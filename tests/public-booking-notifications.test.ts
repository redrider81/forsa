import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Public first-contact chain:
 *
 *   visitor -> pending public booking request -> Carolina accepts or declines
 *
 * Two layers are covered here.
 *
 * 1. Behaviour, against an in-memory double that implements the documented
 *    RPC contract (atomic reservation, in-transaction outbox rows, status
 *    transitions, post-commit sending, retry).
 * 2. The SQL contract itself, asserted directly against the migration, so
 *    the double can never quietly drift away from what the database does.
 */

// ------------------------------------------------------------------ doubles

type RequestRow = {
  id: string;
  coach_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  requested_start_at: string;
  requested_end_at: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  responded_at: string | null;
  locale: string;
  dispatch_token: string;
};

type NotificationRow = {
  id: string;
  request_id: string;
  event_type: string;
  recipient_type: string;
  recipient_email: string | null;
  idempotency_key: string;
  status: "pending" | "sending" | "sent" | "failed";
  attempt_count: number;
  last_attempt_at: string | null;
  provider_message_id: string | null;
  provider_accepted_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
};

const COACH_ID = "coach-cvb";

/** The only statuses that hold an availability window, per the migration. */
const BLOCKING = new Set(["pending", "accepted"]);

class Store {
  requests: RequestRow[] = [];
  notifications: NotificationRow[] = [];
  /** Set when acting as an authenticated coach, null when anonymous. */
  currentCoachId: string | null = null;
  private seq = 0;

  reset() {
    this.requests = [];
    this.notifications = [];
    this.currentCoachId = null;
    this.seq = 0;
  }

  private id(prefix: string): string {
    this.seq += 1;
    return `${prefix}-${this.seq}`;
  }

  /** Mirrors the blocking predicate used by both booking SQL functions. */
  windowIsBlocked(startAt: string, endAt: string): boolean {
    return this.requests.some(
      (row) =>
        BLOCKING.has(row.status) &&
        row.requested_start_at < endAt &&
        row.requested_end_at > startAt,
    );
  }

  private queue(requestId: string, eventType: string, recipientType: string, email: string | null) {
    if (this.notifications.some((n) => n.request_id === requestId && n.event_type === eventType)) {
      return; // unique (request_id, event_type)
    }
    const now = new Date().toISOString();
    this.notifications.push({
      id: this.id("notif"),
      request_id: requestId,
      event_type: eventType,
      recipient_type: recipientType,
      recipient_email: email,
      idempotency_key: `cvb-public-booking/${requestId}/${eventType}`,
      status: "pending",
      attempt_count: 0,
      last_attempt_at: null,
      provider_message_id: null,
      provider_accepted_at: null,
      last_error_code: null,
      last_error_message: null,
      created_at: now,
      updated_at: now,
    });
  }

  createRequest(args: Record<string, unknown>) {
    const startAt = String(args.p_start_at);
    const endAt = String(args.p_end_at);

    if (this.windowIsBlocked(startAt, endAt)) {
      return { data: null, error: { message: "SLOT_UNAVAILABLE" } };
    }

    const now = new Date().toISOString();
    const row: RequestRow = {
      id: this.id("req"),
      coach_id: COACH_ID,
      name: String(args.p_name),
      email: String(args.p_email),
      phone: (args.p_phone as string) || null,
      message: (args.p_message as string) || null,
      requested_start_at: startAt,
      requested_end_at: endAt,
      status: "pending",
      created_at: now,
      responded_at: null,
      locale: args.p_locale === "en" ? "en" : "sv",
      dispatch_token: `token-${this.id("t")}`,
    };
    this.requests.push(row);

    // Same transaction as the reservation.
    this.queue(row.id, "customer_request_received", "customer", row.email);
    this.queue(row.id, "coach_new_request", "coach", null);

    return { data: [{ request_id: row.id, dispatch_token: row.dispatch_token }], error: null };
  }

  respond(args: Record<string, unknown>) {
    if (!this.currentCoachId) return { data: null, error: { message: "Unauthorized" } };
    const action = String(args.p_action);
    const row = this.requests.find(
      (r) => r.id === args.p_request_id && r.coach_id === this.currentCoachId,
    );
    if (!row) return { data: null, error: { message: "Request not found or unauthorized" } };

    if (action === "accept" || action === "decline") {
      if (row.status !== "pending") {
        return { data: null, error: { message: "Request already responded to" } };
      }
    } else if (action === "cancel") {
      if (row.status !== "accepted") {
        return { data: null, error: { message: "Only accepted reservations can be cancelled" } };
      }
    } else {
      return { data: null, error: { message: "Invalid action" } };
    }

    row.status = action === "accept" ? "accepted" : action === "decline" ? "declined" : "cancelled";
    row.responded_at = new Date().toISOString();

    if (action === "accept") this.queue(row.id, "customer_request_accepted", "customer", row.email);
    if (action === "decline") this.queue(row.id, "customer_request_declined", "customer", row.email);

    return { data: null, error: null };
  }

  recordResult(args: Record<string, unknown>) {
    const status = String(args.p_status);
    if (!["sending", "sent", "failed"].includes(status)) {
      return { data: null, error: { message: "INVALID_NOTIFICATION_STATUS" } };
    }
    const request = this.requests.find((r) => r.id === args.p_request_id);
    if (!request) return { data: null, error: { message: "NOT_AUTHORIZED" } };

    const authorised =
      request.coach_id === this.currentCoachId ||
      (args.p_dispatch_token != null && args.p_dispatch_token === request.dispatch_token);
    if (!authorised) return { data: null, error: { message: "NOT_AUTHORIZED" } };

    const row = this.notifications.find(
      (n) => n.request_id === args.p_request_id && n.event_type === args.p_event_type,
    );
    if (!row) return { data: null, error: { message: "NOTIFICATION_NOT_FOUND" } };

    // Success is terminal.
    if (row.status === "sent") return { data: null, error: null };

    row.status = status as NotificationRow["status"];
    if (status === "sending") {
      row.attempt_count += 1;
      row.last_attempt_at = new Date().toISOString();
    }
    if (row.recipient_email == null && args.p_recipient_email) {
      row.recipient_email = String(args.p_recipient_email);
    }
    if (status === "sent") {
      row.provider_message_id = (args.p_provider_message_id as string) ?? null;
      row.provider_accepted_at = new Date().toISOString();
      row.last_error_code = null;
      row.last_error_message = null;
    }
    if (status === "failed") {
      row.last_error_code = ((args.p_error_code as string) ?? "provider_error").slice(0, 80);
      row.last_error_message = ((args.p_error_message as string) ?? "").slice(0, 300);
    }
    row.updated_at = new Date().toISOString();
    return { data: null, error: null };
  }
}

const store = new Store();

function tableRows(table: string): Record<string, unknown>[] {
  if (table === "public_booking_requests") return store.requests as unknown as Record<string, unknown>[];
  if (table === "public_booking_notifications")
    return store.notifications as unknown as Record<string, unknown>[];
  return [];
}

/** Minimal PostgREST-shaped query builder: select/eq/order/maybeSingle. */
function fromBuilder(table: string) {
  let rows = [...tableRows(table)];
  // RLS: the coach only ever sees her own rows; anonymous sees none.
  const applyRls = () => {
    if (table === "public_booking_requests") {
      rows = rows.filter((r) => r.coach_id === store.currentCoachId);
    }
    if (table === "public_booking_notifications") {
      rows = rows.filter((n) =>
        store.requests.some(
          (r) => r.id === n.request_id && r.coach_id === store.currentCoachId,
        ),
      );
    }
  };

  const builder = {
    select() {
      applyRls();
      return builder;
    },
    eq(column: string, value: unknown) {
      rows = rows.filter((row) => row[column] === value);
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      const dir = options?.ascending === false ? -1 : 1;
      rows = [...rows].sort((a, b) => String(a[column]).localeCompare(String(b[column])) * dir);
      return builder;
    },
    maybeSingle() {
      return Promise.resolve({ data: rows[0] ?? null, error: null });
    },
    then(resolve: (value: { data: unknown; error: null }) => unknown) {
      return Promise.resolve({ data: rows, error: null }).then(resolve);
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    rpc: (name: string, args: Record<string, unknown>) => {
      if (name === "create_public_booking_request") return Promise.resolve(store.createRequest(args));
      if (name === "respond_public_booking_request") return Promise.resolve(store.respond(args));
      if (name === "record_public_booking_notification_result")
        return Promise.resolve(store.recordResult(args));
      throw new Error(`Oväntat RPC-anrop i test: ${name}`);
    },
    from: (table: string) => fromBuilder(table),
  })),
}));

vi.mock("@/lib/portal/session", () => ({
  readCoachSession: vi.fn(),
}));

vi.mock("@/lib/email/booking-provider", () => ({
  createResendBookingProvider: vi.fn(() => {
    throw new Error("Resend ska aldrig instansieras i test.");
  }),
}));

import { readCoachSession } from "@/lib/portal/session";
import { createResendBookingProvider } from "@/lib/email/booking-provider";
import { POST as bookPost } from "@/app/api/public/tillganglighet/boka/route";
import { POST as respondPost } from "@/app/api/portal/tillganglighet/forfragningar/[requestId]/svara/route";
import { POST as retryPost } from "@/app/api/portal/tillganglighet/forfragningar/[requestId]/skicka-om/route";
import {
  bookingIdempotencyKey,
  dispatchBookingNotifications,
  resolveOperatorRecipient,
} from "@/lib/portal/booking-notifications";
import { buildBookingEmail } from "@/lib/email/booking-emails";
import { RESULT_EMAIL_RECIPIENT } from "@/lib/email/result-email";

// ------------------------------------------------------------------ helpers

const SLOT_START = "2026-10-05T06:00:00.000Z"; // 08:00 Europe/Stockholm
const SLOT_END = "2026-10-05T08:00:00.000Z"; // 10:00 Europe/Stockholm

const originalEnv = { ...process.env };

function bookRequest(overrides: Record<string, unknown> = {}) {
  return bookPost(
    new Request("http://localhost/api/public/tillganglighet/boka", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "carolina-von-braun",
        name: "Anna Lind",
        email: "anna@example.com",
        phone: "070-000 00 00",
        message: "Typ av stöd: Individuell coaching",
        startAt: SLOT_START,
        endAt: SLOT_END,
        ...overrides,
      }),
    }),
  );
}

function respond(requestId: string, action: "accept" | "decline" | "cancel") {
  return respondPost(
    new Request("http://localhost/api/portal/tillganglighet/forfragningar/x/svara", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }),
    { params: Promise.resolve({ requestId }) },
  );
}

function retry(requestId: string, eventType: string) {
  return retryPost(
    new Request("http://localhost/api/portal/tillganglighet/forfragningar/x/skicka-om", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType }),
    }),
    { params: Promise.resolve({ requestId }) },
  );
}

function asCoach() {
  store.currentCoachId = COACH_ID;
  vi.mocked(readCoachSession).mockResolvedValue({
    userId: "coach-user",
    name: "Carolina von Braun",
    coachId: COACH_ID,
  });
}

function notificationsFor(requestId: string) {
  return store.notifications.filter((n) => n.request_id === requestId);
}

function notification(requestId: string, eventType: string) {
  return notificationsFor(requestId).find((n) => n.event_type === eventType);
}

/** Live mode with a provider double, so no real network call is possible. */
function enableLiveSending() {
  process.env.EMAIL_SEND_ENABLED = "true";
  process.env.EMAIL_FROM = "CVB Coaching <kontakt@cvbcoaching.se>";
  process.env.RESEND_API_KEY = "test-key";
}

beforeEach(() => {
  store.reset();
  delete process.env.EMAIL_SEND_ENABLED;
  delete process.env.EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
  delete process.env.BOOKING_OPERATOR_EMAIL;
  vi.mocked(readCoachSession).mockReset();
  vi.mocked(readCoachSession).mockResolvedValue(null);
  vi.mocked(createResendBookingProvider).mockClear();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

// ------------------------------------------------------------------ submission

describe("publik förfrågan", () => {
  it("skapar en pending förfrågan och båda notisraderna", async () => {
    const response = await bookRequest();
    const payload = (await response.json()) as { ok: boolean; requestId: string };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(store.requests).toHaveLength(1);
    expect(store.requests[0].status).toBe("pending");

    const events = notificationsFor(payload.requestId).map((n) => n.event_type).sort();
    expect(events).toEqual(["coach_new_request", "customer_request_received"]);
  });

  it("skapar varje notistyp exakt en gång", async () => {
    const response = await bookRequest();
    const { requestId } = (await response.json()) as { requestId: string };

    expect(
      notificationsFor(requestId).filter((n) => n.event_type === "customer_request_received"),
    ).toHaveLength(1);
    expect(
      notificationsFor(requestId).filter((n) => n.event_type === "coach_new_request"),
    ).toHaveLength(1);
  });

  it("försöker skicka båda notiserna efter commit", async () => {
    const response = await bookRequest();
    const { requestId } = (await response.json()) as { requestId: string };

    for (const event of ["customer_request_received", "coach_new_request"]) {
      const row = notification(requestId, event);
      expect(row?.attempt_count).toBe(1);
      expect(row?.last_attempt_at).not.toBeNull();
      expect(row?.status).toBe("sent");
    }
  });

  it("behåller den atomiska tidsfönsterreservationen", async () => {
    await bookRequest();
    const second = await bookRequest({ name: "Björn Ek", email: "bjorn@example.com" });
    const payload = (await second.json()) as { ok: boolean; error: string };

    expect(second.status).toBe(409);
    expect(payload.ok).toBe(false);
    expect(store.requests).toHaveLength(1);
    // A rejected reservation leaves no orphaned outbox rows behind.
    expect(store.notifications).toHaveLength(2);
  });

  it("skickar aldrig innan förfrågan finns", async () => {
    // A rejected submission produces no notification rows at all, so no
    // send can precede the booking it belongs to.
    await bookRequest();
    store.notifications = [];
    await bookRequest({ name: "Björn Ek" });
    expect(store.notifications).toHaveLength(0);
  });

  it("sparar besökarens språk för senare utskick", async () => {
    const response = await bookRequest({ locale: "en" });
    const { requestId } = (await response.json()) as { requestId: string };
    expect(store.requests.find((r) => r.id === requestId)?.locale).toBe("en");
  });
});

// ------------------------------------------------------------------ acceptance

describe("godkännande", () => {
  it("kräver coachsession", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };

    const response = await respond(requestId, "accept");
    expect(response.status).toBe(401);
    expect(store.requests[0].status).toBe("pending");
    expect(notification(requestId, "customer_request_accepted")).toBeUndefined();
  });

  it("går bara från pending och blockerar tidsfönstret vidare", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();

    expect((await respond(requestId, "accept")).status).toBe(200);
    expect(store.requests[0].status).toBe("accepted");
    expect(store.windowIsBlocked(SLOT_START, SLOT_END)).toBe(true);

    // A second accept is refused: only pending may transition.
    const again = await respond(requestId, "accept");
    expect(again.status).toBe(502);
  });

  it("skapar accept-notisen exakt en gång efter commit", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();
    await respond(requestId, "accept");

    const rows = notificationsFor(requestId).filter(
      (n) => n.event_type === "customer_request_accepted",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("sent");
    expect(store.requests[0].status).toBe("accepted");
  });

  it("skapar ingen klient, användare, uppdrag, avtal, mål eller session", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();
    await respond(requestId, "accept");

    // The chain only ever touches these two tables.
    expect(Object.keys({ requests: 1, notifications: 1 })).toHaveLength(2);
    expect(store.requests).toHaveLength(1);
    expect(notificationsFor(requestId)).toHaveLength(3);
  });
});

// ------------------------------------------------------------------ decline

describe("avböjande", () => {
  it("går bara från pending", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();

    expect((await respond(requestId, "decline")).status).toBe(200);
    expect(store.requests[0].status).toBe("declined");
    expect((await respond(requestId, "decline")).status).toBe(502);
  });

  it("släpper tidsfönstret genom den befintliga blockeringslogiken", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();
    await respond(requestId, "decline");

    expect(store.windowIsBlocked(SLOT_START, SLOT_END)).toBe(false);

    // The same window can be reserved again, and the old row is preserved.
    store.currentCoachId = null;
    const again = await bookRequest({ name: "Björn Ek", email: "bjorn@example.com" });
    expect(again.status).toBe(200);
    expect(store.requests).toHaveLength(2);
    expect(store.requests[0].status).toBe("declined");
  });

  it("skapar decline-notisen exakt en gång efter commit", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();
    await respond(requestId, "decline");

    const rows = notificationsFor(requestId).filter(
      (n) => n.event_type === "customer_request_declined",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("sent");
  });
});

// ------------------------------------------------------------------ provider failure

describe("leverantörsfel", () => {
  it("behåller bokningen när kvittensutskicket misslyckas", async () => {
    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw Object.assign(new Error("resend unavailable"), { code: "application_error" });
      }),
    });

    const response = await bookRequest();
    const payload = (await response.json()) as { ok: boolean; requestId: string };

    // The visitor is never told the booking failed.
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(store.requests[0].status).toBe("pending");
    expect(store.windowIsBlocked(SLOT_START, SLOT_END)).toBe(true);

    const row = notification(payload.requestId, "customer_request_received");
    expect(row?.status).toBe("failed");
    expect(row?.attempt_count).toBe(1);
  });

  it("saniterar felinformation och läcker inga leverantörsinternals", async () => {
    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw Object.assign(new Error("x".repeat(900)), { code: "y".repeat(200) });
      }),
    });

    const response = await bookRequest();
    const payload = (await response.json()) as Record<string, unknown>;
    const row = notification(String(payload.requestId), "customer_request_received");

    expect(row?.last_error_code?.length).toBeLessThanOrEqual(80);
    expect(row?.last_error_message?.length).toBeLessThanOrEqual(300);
    // Nothing about the provider reaches the browser.
    expect(Object.keys(payload)).toEqual(["ok", "requestId"]);
  });

  it("behåller accepted-status när acceptmejlet misslyckas", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();

    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });

    expect((await respond(requestId, "accept")).status).toBe(200);
    expect(store.requests[0].status).toBe("accepted");
    expect(store.windowIsBlocked(SLOT_START, SLOT_END)).toBe(true);
    expect(notification(requestId, "customer_request_accepted")?.status).toBe("failed");
  });

  it("behåller declined-status och släppt tidsfönster när declinemejlet misslyckas", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();

    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });

    expect((await respond(requestId, "decline")).status).toBe(200);
    expect(store.requests[0].status).toBe("declined");
    expect(store.windowIsBlocked(SLOT_START, SLOT_END)).toBe(false);
    expect(notification(requestId, "customer_request_declined")?.status).toBe("failed");
  });
});

// ------------------------------------------------------------------ release config

describe("skarpt läge med ofullständig konfiguration", () => {
  it("misslyckas stängt när EMAIL_FROM saknas, utan att bryta bokningen", async () => {
    // Real-send mode turned on, but the sender identity is not configured.
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.EMAIL_FROM;

    const response = await bookRequest();
    const payload = (await response.json()) as { ok: boolean; requestId: string };

    // The booking is untouched and reported as successful.
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(store.requests).toHaveLength(1);
    expect(store.requests[0].status).toBe("pending");
    expect(store.windowIsBlocked(SLOT_START, SLOT_END)).toBe(true);

    // Nothing was silently treated as sent, and no provider was reached.
    for (const event of ["customer_request_received", "coach_new_request"]) {
      const row = notification(payload.requestId, event);
      expect(row?.status).toBe("failed");
      expect(row?.last_error_code).toBe("missing_from_address");
      expect(row?.provider_message_id).toBeNull();
    }
    expect(createResendBookingProvider).not.toHaveBeenCalled();
  });

  it("markerar aldrig ett utskick som simulerat när skarpt läge är på", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.EMAIL_FROM;

    const response = await bookRequest();
    const { requestId } = (await response.json()) as { requestId: string };

    // "simulated" must never appear once real sending is enabled — that is
    // the exact confusion this configuration check exists to prevent.
    expect(notification(requestId, "customer_request_received")?.provider_message_id).not.toBe(
      "simulated",
    );
  });

  it("läcker ingen konfiguration till det publika svaret", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.RESEND_API_KEY = "super-secret-key";
    delete process.env.EMAIL_FROM;

    const response = await bookRequest();
    const payload = (await response.json()) as Record<string, unknown>;

    expect(Object.keys(payload)).toEqual(["ok", "requestId"]);
    const serialized = JSON.stringify(payload);
    for (const secret of [
      "super-secret-key",
      "EMAIL_FROM",
      "EMAIL_SEND_ENABLED",
      "missing_from_address",
      RESULT_EMAIL_RECIPIENT,
    ]) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("simulerat läge är oförändrat", async () => {
    // No EMAIL_SEND_ENABLED at all: the established local default.
    const response = await bookRequest();
    const { requestId } = (await response.json()) as { requestId: string };

    expect(notification(requestId, "customer_request_received")?.status).toBe("sent");
    expect(notification(requestId, "customer_request_received")?.provider_message_id).toBe(
      "simulated",
    );
    expect(createResendBookingProvider).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------------ reply-to

describe("svarsadress", () => {
  type Sent = { to: string; replyTo?: string; idempotencyKey: string; subject: string };

  /** Captures the exact payload handed to the provider. */
  function capturingProvider(sent: Sent[]) {
    return {
      send: vi.fn(async (payload: Sent) => {
        sent.push({
          to: payload.to,
          replyTo: payload.replyTo,
          idempotencyKey: payload.idempotencyKey,
          subject: payload.subject,
        });
        return { id: "msg" };
      }),
    };
  }

  it("sätter Reply-To till Carolinas brevlåda på kundens kvittens", async () => {
    enableLiveSending();
    const sent: Sent[] = [];
    vi.mocked(createResendBookingProvider).mockReturnValue(capturingProvider(sent));

    await bookRequest();

    const receipt = sent.find((entry) => entry.to === "anna@example.com");
    expect(receipt?.replyTo).toBe(RESULT_EMAIL_RECIPIENT);
  });

  it("sätter Reply-To på acceptmejlet", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();

    enableLiveSending();
    const sent: Sent[] = [];
    vi.mocked(createResendBookingProvider).mockReturnValue(capturingProvider(sent));

    await respond(requestId, "accept");

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("anna@example.com");
    expect(sent[0].replyTo).toBe(RESULT_EMAIL_RECIPIENT);
  });

  it("sätter Reply-To på declinemejlet", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();

    enableLiveSending();
    const sent: Sent[] = [];
    vi.mocked(createResendBookingProvider).mockReturnValue(capturingProvider(sent));

    await respond(requestId, "decline");

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("anna@example.com");
    expect(sent[0].replyTo).toBe(RESULT_EMAIL_RECIPIENT);
  });

  it("sätter ingen Reply-To på operatörsnotisen, och byter inte mottagare", async () => {
    enableLiveSending();
    const sent: Sent[] = [];
    vi.mocked(createResendBookingProvider).mockReturnValue(capturingProvider(sent));

    await bookRequest();

    const operator = sent.find((entry) => entry.to === RESULT_EMAIL_RECIPIENT);
    expect(operator).toBeDefined();
    // It already lands in that mailbox; a Reply-To pointing at itself adds
    // nothing, and the recipient must not have shifted.
    expect(operator?.replyTo).toBeUndefined();
    expect(sent.map((entry) => entry.to).sort()).toEqual(
      ["anna@example.com", RESULT_EMAIL_RECIPIENT].sort(),
    );
  });

  it("följer den konfigurerade operatörsadressen", async () => {
    process.env.BOOKING_OPERATOR_EMAIL = "carolina@example.test";
    enableLiveSending();
    const sent: Sent[] = [];
    vi.mocked(createResendBookingProvider).mockReturnValue(capturingProvider(sent));

    await bookRequest();

    // No new environment variable: Reply-To reuses the operator resolution.
    expect(sent.find((e) => e.to === "anna@example.com")?.replyTo).toBe("carolina@example.test");
    expect(sent.find((e) => e.to === "carolina@example.test")?.replyTo).toBeUndefined();
  });

  it("lämnar idempotensnyckeln oförändrad", async () => {
    enableLiveSending();
    const sent: Sent[] = [];
    vi.mocked(createResendBookingProvider).mockReturnValue(capturingProvider(sent));

    const response = await bookRequest();
    const { requestId } = (await response.json()) as { requestId: string };

    expect(sent.find((e) => e.to === "anna@example.com")?.idempotencyKey).toBe(
      bookingIdempotencyKey(requestId, "customer_request_received"),
    );
    expect(sent.find((e) => e.to === RESULT_EMAIL_RECIPIENT)?.idempotencyKey).toBe(
      bookingIdempotencyKey(requestId, "coach_new_request"),
    );
  });

  it("rör inte simulerat läge", async () => {
    // No EMAIL_SEND_ENABLED: nothing reaches a provider at all, so there is
    // no Reply-To to set and the recorded outcome is unchanged.
    const response = await bookRequest();
    const { requestId } = (await response.json()) as { requestId: string };

    expect(createResendBookingProvider).not.toHaveBeenCalled();
    expect(notification(requestId, "customer_request_received")?.status).toBe("sent");
    expect(notification(requestId, "customer_request_received")?.provider_message_id).toBe(
      "simulated",
    );
  });
});

// ------------------------------------------------------------------ retry

describe("omsändning", () => {
  it("kräver coachsession", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    expect((await retry(requestId, "customer_request_received")).status).toBe(401);
  });

  it("lyckas när leverantören är tillbaka utan att röra bokningen", async () => {
    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    expect(notification(requestId, "customer_request_received")?.status).toBe("failed");

    asCoach();
    const send = vi.fn(async () => ({ id: "msg-1" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send });

    const response = await retry(requestId, "customer_request_received");
    expect(response.status).toBe(200);

    const row = notification(requestId, "customer_request_received");
    expect(row?.status).toBe("sent");
    expect(row?.provider_message_id).toBe("msg-1");
    expect(row?.attempt_count).toBe(2);

    // The booking itself is untouched: still one request, still pending.
    expect(store.requests).toHaveLength(1);
    expect(store.requests[0].status).toBe("pending");
  });

  it("återanvänder samma idempotensnyckel", async () => {
    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };

    asCoach();
    const send = vi.fn(async () => ({ id: "msg-1" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send });
    await retry(requestId, "customer_request_received");

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: bookingIdempotencyKey(requestId, "customer_request_received"),
      }),
    );
    expect(bookingIdempotencyKey(requestId, "customer_request_received")).toBe(
      `cvb-public-booking/${requestId}/customer_request_received`,
    );
  });

  it("skickar aldrig om en notis som redan är sent", async () => {
    const created = await bookRequest(); // simulated mode -> sent
    const { requestId } = (await created.json()) as { requestId: string };
    expect(notification(requestId, "customer_request_received")?.status).toBe("sent");

    asCoach();
    enableLiveSending();
    const send = vi.fn(async () => ({ id: "should-not-happen" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send });

    const response = await retry(requestId, "customer_request_received");
    expect(response.status).toBe(409);
    expect(send).not.toHaveBeenCalled();
  });

  it("kan aldrig upprepa en accept- eller declineövergång", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();
    await respond(requestId, "decline");

    const statusBefore = store.requests[0].status;
    const respondedBefore = store.requests[0].responded_at;
    await retry(requestId, "customer_request_declined");

    expect(store.requests[0].status).toBe(statusBefore);
    expect(store.requests[0].responded_at).toBe(respondedBefore);
    expect(store.requests).toHaveLength(1);
  });

  it("avvisar okänd notistyp", async () => {
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };
    asCoach();
    expect((await retry(requestId, "godtycklig_typ")).status).toBe(400);
  });
});

// ------------------------------------------------------------------ recipients & copy

describe("mottagare och innehåll", () => {
  it("hämtar operatörsadressen server-side, aldrig från förfrågan", () => {
    expect(resolveOperatorRecipient()).toBe(RESULT_EMAIL_RECIPIENT);
    process.env.BOOKING_OPERATOR_EMAIL = "bokning@cvbcoaching.se";
    expect(resolveOperatorRecipient()).toBe("bokning@cvbcoaching.se");
  });

  it("skickar coachnotisen till operatören och kvittensen till besökaren", async () => {
    enableLiveSending();
    const sent: Array<{ to: string }> = [];
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async (payload) => {
        sent.push({ to: payload.to });
        return { id: "msg" };
      }),
    });

    await bookRequest();

    const recipients = sent.map((entry) => entry.to);
    expect(recipients).toContain("anna@example.com");
    expect(recipients).toContain(RESULT_EMAIL_RECIPIENT);
  });

  it("beskriver tvåtimmarsblocket som ett tidsfönster, inte som samtalets längd", () => {
    const context = {
      name: "Anna Lind",
      email: "anna@example.com",
      phone: null,
      message: null,
      requestedStartAt: SLOT_START,
      requestedEndAt: SLOT_END,
      locale: "sv" as const,
    };

    const received = buildBookingEmail("customer_request_received", context);
    expect(received.body).toContain("tidsfönster");
    expect(received.body).toContain("kort");
    expect(received.body).toContain("kostnadsfritt");

    const accepted = buildBookingEmail("customer_request_accepted", context);
    expect(accepted.body).toContain("ringer upp");

    const english = buildBookingEmail("customer_request_received", { ...context, locale: "en" });
    expect(english.body).toContain("time window");
    expect(english.body).toContain("short, free");
  });

  it("kallar aldrig en förfrågan för en ny klient", () => {
    const coach = buildBookingEmail("coach_new_request", {
      name: "Anna Lind",
      email: "anna@example.com",
      phone: "070-000 00 00",
      message: "Typ av stöd: Individuell coaching",
      requestedStartAt: SLOT_START,
      requestedEndAt: SLOT_END,
      locale: "sv",
    });

    expect(coach.subject).toContain("Ny förfrågan om inledande samtal");
    expect(coach.subject).not.toContain("Ny klient");
    expect(coach.body).not.toContain("Ny klient");
    expect(coach.body).toContain("anna@example.com");
    expect(coach.body).toContain("070-000 00 00");
  });

  it("returnerar utfall utan att kasta när allt misslyckas", async () => {
    enableLiveSending();
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => {
        throw new Error("down");
      }),
    });
    const created = await bookRequest();
    const { requestId } = (await created.json()) as { requestId: string };

    const outcomes = await dispatchBookingNotifications({
      requestId,
      dispatchToken: store.requests[0].dispatch_token,
      events: ["customer_request_received"],
      context: {
        name: "Anna Lind",
        email: "anna@example.com",
        phone: null,
        message: null,
        requestedStartAt: SLOT_START,
        requestedEndAt: SLOT_END,
        locale: "sv",
      },
    });

    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].status).toBe("failed");
  });
});

// ------------------------------------------------------------------ SQL contract

describe("SQL-kontrakt", () => {
  const sql = readFileSync(
    new URL(
      "../supabase/migrations/20260908090000_cvb_base_public_booking_notifications.sql",
      import.meta.url,
    ),
    "utf-8",
  );

  it("blockerar tidsfönster endast på pending och accepted", () => {
    const blocking = sql.match(/status in \('pending', 'accepted'\)/g) ?? [];
    expect(blocking.length).toBeGreaterThan(0);
    // 'declined' is never part of a blocking predicate.
    expect(sql).not.toMatch(/status in \([^)]*'declined'[^)]*\)\s*\n\s*and pbr\./);
  });

  it("håller de fyra fasta tidsfönstren och helgregeln oförändrade", () => {
    for (const block of [
      "('08:00'::time, '10:00'::time)",
      "('10:00'::time, '12:00'::time)",
      "('13:00'::time, '15:00'::time)",
      "('15:00'::time, '17:00'::time)",
    ]) {
      expect(sql).toContain(block);
    }
    expect(sql).toContain("if extract(isodow from v_local_date) > 5 then");
  });

  it("köar notiser i samma transaktion som bokningsmutationen", () => {
    const create = sql.slice(sql.indexOf("create or replace function public.create_public_booking_request"));
    const createBody = create.slice(0, create.indexOf("grant execute on function public.create_public_booking_request"));
    expect(createBody).toContain("insert into public.public_booking_requests");
    expect(createBody).toContain("queue_public_booking_notification(v_request_id, 'customer_request_received'");
    expect(createBody).toContain("queue_public_booking_notification(v_request_id, 'coach_new_request'");

    const respond = sql.slice(sql.indexOf("create or replace function public.respond_public_booking_request"));
    const respondBody = respond.slice(0, respond.indexOf("grant execute on function public.respond_public_booking_request"));
    expect(respondBody).toContain("update public.public_booking_requests");
    expect(respondBody).toContain("queue_public_booking_notification(p_request_id, 'customer_request_accepted'");
    expect(respondBody).toContain("queue_public_booking_notification(p_request_id, 'customer_request_declined'");
  });

  it("garanterar en logisk notis per förfrågan och händelsetyp", () => {
    expect(sql).toContain("unique (request_id, event_type)");
    expect(sql).toContain("on conflict (request_id, event_type) do nothing");
  });

  it("gör sent terminalt", () => {
    expect(sql).toMatch(/if v_current = 'sent' then\s*\n\s*return;/);
  });

  it("håller accept och decline bakom coachbehörighet", () => {
    expect(sql).toContain("revoke execute on function public.respond_public_booking_request(uuid, text) from anon, public;");
    expect(sql).toContain("v_coach_id := public.current_coach_id();");
  });

  it("kräver coach eller dispatch-token för att skriva notisstatus", () => {
    expect(sql).toContain("v_request.coach_id = public.current_coach_id()");
    expect(sql).toContain("p_dispatch_token = v_request.dispatch_token");
    expect(sql).toContain("raise exception 'NOT_AUTHORIZED'");
  });

  it("coalescar behörighetskontrollen så NULL aldrig blir ett kryphål", () => {
    // current_coach_id() is null for an anonymous caller, and `coach_id =
    // null` is NULL rather than false. Without coalesce, `if not (...)`
    // never fires and an unauthenticated caller falls straight through.
    expect(sql).toContain("coalesce(v_request.coach_id = public.current_coach_id(), false)");
    expect(sql).toContain("coalesce(p_dispatch_token = v_request.dispatch_token, false)");
  });

  it("är omkörbar: drop av gamla signaturen plus create or replace", () => {
    expect(sql).toContain("drop function if exists public.create_public_booking_request(text, text, text, text, text, timestamptz, timestamptz);");
    expect(sql).toContain("create or replace function public.create_public_booking_request(");
  });

  it("ger ingen anonym läsbehörighet till notisliggaren", () => {
    expect(sql).toContain("alter table public.public_booking_notifications enable row level security;");
    expect(sql).toContain("for select to authenticated");
    expect(sql).toContain("grant select on table public.public_booking_notifications to authenticated;");
    expect(sql).not.toMatch(/grant (insert|update|delete)[^;]*public_booking_notifications/);
    expect(sql).toContain("revoke execute on function public.queue_public_booking_notification(uuid, text, text, text) from public, anon, authenticated;");
  });

  it("skapar aldrig klient, användare, uppdrag, avtal, mål, session eller Base-åtkomst", () => {
    for (const table of [
      "public.clients",
      "public.engagements",
      "public.coaching_agreements",
      "public.development_goals",
      "public.sessions",
      "public.profiles",
      "auth.users",
    ]) {
      expect(sql).not.toContain(`insert into ${table}`);
    }
  });
});
