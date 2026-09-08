import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Operational readiness for the public booking email flow.
 *
 * Two layers, because the portal has no React renderer configured and this
 * pass deliberately does not add one:
 *
 * 1. Behaviour — the coach-scoped failed-notification query and the retry
 *    route, against an in-memory double that enforces the same RLS scoping
 *    the database does.
 * 2. Rendered-output contract — asserted against the component and page
 *    sources, so the coach-facing wording, the gating of the simulated-mode
 *    notice, and the absence of sensitive fields cannot silently drift.
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
  status: string;
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
  status: string;
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
const OTHER_COACH_ID = "coach-annan";

const store = {
  requests: [] as RequestRow[],
  notifications: [] as NotificationRow[],
  currentCoachId: null as string | null,
  /** Every column list the code asked the database for. */
  selectedColumns: [] as string[],
  reset() {
    this.requests = [];
    this.notifications = [];
    this.currentCoachId = null;
    this.selectedColumns = [];
  },
};

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

function seedRequest(overrides: Partial<RequestRow> = {}): RequestRow {
  const row: RequestRow = {
    id: nextId("req"),
    coach_id: COACH_ID,
    name: "Anna Lind",
    email: "anna@example.com",
    phone: "070-000 00 00",
    message: null,
    requested_start_at: "2026-10-05T06:00:00.000Z",
    requested_end_at: "2026-10-05T08:00:00.000Z",
    status: "pending",
    created_at: new Date().toISOString(),
    responded_at: null,
    locale: "sv",
    dispatch_token: nextId("token"),
    ...overrides,
  };
  store.requests.push(row);
  return row;
}

function seedNotification(
  request: RequestRow,
  eventType: string,
  status: string,
  overrides: Partial<NotificationRow> = {},
): NotificationRow {
  const row: NotificationRow = {
    id: nextId("notif"),
    request_id: request.id,
    event_type: eventType,
    recipient_type: eventType === "coach_new_request" ? "coach" : "customer",
    recipient_email: "anna@example.com",
    idempotency_key: `cvb-public-booking/${request.id}/${eventType}`,
    status,
    attempt_count: 1,
    last_attempt_at: new Date().toISOString(),
    provider_message_id: status === "sent" ? "msg-1" : null,
    provider_accepted_at: null,
    last_error_code: status === "failed" ? "application_error" : null,
    last_error_message: status === "failed" ? "resend exploded internally" : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
  store.notifications.push(row);
  return row;
}

function rowsFor(table: string): Record<string, unknown>[] {
  if (table === "public_booking_requests") return store.requests as unknown as Record<string, unknown>[];
  if (table === "public_booking_notifications")
    return store.notifications as unknown as Record<string, unknown>[];
  return [];
}

/** Applies the same coach scoping the RLS policies apply in Postgres. */
function applyRls(table: string, rows: Record<string, unknown>[]) {
  if (table === "public_booking_requests") {
    return rows.filter((row) => row.coach_id === store.currentCoachId);
  }
  if (table === "public_booking_notifications") {
    return rows.filter((row) =>
      store.requests.some((r) => r.id === row.request_id && r.coach_id === store.currentCoachId),
    );
  }
  return [];
}

function fromBuilder(table: string) {
  let rows = [...rowsFor(table)];
  const builder = {
    select(columns: string) {
      store.selectedColumns.push(columns);
      rows = applyRls(table, rows);
      return builder;
    },
    eq(column: string, value: unknown) {
      rows = rows.filter((row) => row[column] === value);
      return builder;
    },
    in(column: string, values: unknown[]) {
      rows = rows.filter((row) => values.includes(row[column]));
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
    from: (table: string) => fromBuilder(table),
    rpc: (name: string, args: Record<string, unknown>) => {
      if (name === "record_public_booking_notification_result") {
        const request = store.requests.find((r) => r.id === args.p_request_id);
        if (!request) return Promise.resolve({ data: null, error: { message: "NOT_AUTHORIZED" } });
        const authorised =
          request.coach_id === store.currentCoachId ||
          (args.p_dispatch_token != null && args.p_dispatch_token === request.dispatch_token);
        if (!authorised) return Promise.resolve({ data: null, error: { message: "NOT_AUTHORIZED" } });
        const row = store.notifications.find(
          (n) => n.request_id === args.p_request_id && n.event_type === args.p_event_type,
        );
        if (!row) return Promise.resolve({ data: null, error: { message: "NOTIFICATION_NOT_FOUND" } });
        if (row.status === "sent") return Promise.resolve({ data: null, error: null });
        const status = String(args.p_status);
        row.status = status;
        if (status === "sending") row.attempt_count += 1;
        if (status === "sent") row.provider_message_id = String(args.p_provider_message_id ?? "");
        return Promise.resolve({ data: null, error: null });
      }
      throw new Error(`Oväntat RPC-anrop i test: ${name}`);
    },
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
import { POST as retryPost } from "@/app/api/portal/tillganglighet/forfragningar/[requestId]/skicka-om/route";
import {
  bookingEmailIsSimulated,
  listFailedBookingNotifications,
} from "@/lib/portal/booking-notifications";

// ------------------------------------------------------------------ helpers

const originalEnv = { ...process.env };

/**
 * Comments explaining what a component deliberately withholds naturally
 * mention the withheld field names. Strip them, so these assertions test
 * the rendered code rather than its documentation.
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const noticeSource = readFileSync(
  new URL("../src/components/portal/dashboard-email-notice.tsx", import.meta.url),
  "utf-8",
);
const failedSource = readFileSync(
  new URL("../src/components/portal/dashboard-failed-emails.tsx", import.meta.url),
  "utf-8",
);
const pageSource = readFileSync(
  new URL("../src/app/cvb-base/page.tsx", import.meta.url),
  "utf-8",
);
const librarySource = readFileSync(
  new URL("../src/lib/portal/booking-notifications.ts", import.meta.url),
  "utf-8",
);

function asCoach(coachId = COACH_ID) {
  store.currentCoachId = coachId;
  vi.mocked(readCoachSession).mockResolvedValue({
    userId: "coach-user",
    name: "Carolina von Braun",
    coachId,
  });
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

beforeEach(() => {
  store.reset();
  delete process.env.EMAIL_SEND_ENABLED;
  delete process.env.EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
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

// ------------------------------------------------------------------ email mode

describe("simulerat e-postläge", () => {
  it("är simulerat när EMAIL_SEND_ENABLED saknas", () => {
    expect(bookingEmailIsSimulated()).toBe(true);
  });

  it("är simulerat för alla värden utom exakt 'true'", () => {
    for (const value of ["false", "TRUE", "1", "yes", ""]) {
      process.env.EMAIL_SEND_ENABLED = value;
      expect(bookingEmailIsSimulated()).toBe(true);
    }
  });

  it("är inte simulerat när EMAIL_SEND_ENABLED === 'true'", () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    expect(bookingEmailIsSimulated()).toBe(false);
  });

  it("renderas bara när läget faktiskt är simulerat", () => {
    // The page gates the notice on the server-side boolean, so real
    // delivery mode renders no notice at all.
    expect(pageSource).toContain("{bookingEmailIsSimulated() && (");
    expect(pageSource).toContain("<DashboardEmailNotice />");
  });

  it("säger den operativa sanningen med godkänd formulering", () => {
    expect(noticeSource).toContain("E-postutskick är i simulerat läge.");
    expect(noticeSource).toContain(
      "Bokningsmejl registreras som genomförda, men skickas inte till mottagare.",
    );
  });

  it("påstår aldrig att leverans fungerar när läget är skarpt", () => {
    // No counterpart "everything is fine" badge: configuration is not
    // evidence of inbox delivery.
    for (const claim of ["Leverans fungerar", "E-post fungerar", "levereras", "Skarpt läge"]) {
      expect(noticeSource).not.toContain(claim);
    }
    expect(pageSource).not.toMatch(/!bookingEmailIsSimulated\(\)/);
  });

  it("exponerar inga hemligheter eller konfigurationsvärden", () => {
    for (const secret of [
      "EMAIL_SEND_ENABLED",
      "RESEND_API_KEY",
      "EMAIL_FROM",
      "BOOKING_OPERATOR_EMAIL",
      "process.env",
      "Resend",
      "carolinavonbraun",
    ]) {
      expect(withoutComments(noticeSource)).not.toContain(secret);
    }
  });

  it("håller beslutet server-side", () => {
    // The helper lives in a server-only module, so it cannot be imported
    // into a client component even by accident.
    expect(librarySource.startsWith('import "server-only";')).toBe(true);
    expect(noticeSource).not.toContain('"use client"');
  });
});

// ------------------------------------------------------------------ failed notifications

describe("misslyckade utskick", () => {
  it("visar coachens egna failed-notiser", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");
    asCoach();

    const items = await listFailedBookingNotifications();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      requestId: request.id,
      eventType: "customer_request_received",
      label: "Kvitto till kund",
      visitorName: "Anna Lind",
      canRetry: true,
    });
  });

  it("visar inte sent, pending eller sending", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "sent");
    seedNotification(request, "coach_new_request", "pending");
    seedNotification(request, "customer_request_accepted", "sending");
    asCoach();

    expect(await listFailedBookingNotifications()).toEqual([]);
  });

  it("visar inte en annan coachs notiser", async () => {
    const mine = seedRequest();
    seedNotification(mine, "customer_request_received", "failed");
    const theirs = seedRequest({ coach_id: OTHER_COACH_ID, name: "Någon Annan" });
    seedNotification(theirs, "customer_request_received", "failed");
    asCoach();

    const items = await listFailedBookingNotifications();
    expect(items).toHaveLength(1);
    expect(items[0].requestId).toBe(mine.id);
    expect(JSON.stringify(items)).not.toContain("Någon Annan");
  });

  it("visar ingenting för klient eller anonym", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");

    // No coach identity at all — the RLS filter yields nothing.
    store.currentCoachId = null;
    expect(await listFailedBookingNotifications()).toEqual([]);

    store.currentCoachId = "klient-emma";
    expect(await listFailedBookingNotifications()).toEqual([]);
  });

  it("översätter alla fyra händelsetyperna till begripliga etiketter", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");
    const r2 = seedRequest({ requested_start_at: "2026-10-06T06:00:00.000Z" });
    seedNotification(r2, "coach_new_request", "failed");
    const r3 = seedRequest({ requested_start_at: "2026-10-07T06:00:00.000Z" });
    seedNotification(r3, "customer_request_accepted", "failed");
    const r4 = seedRequest({ requested_start_at: "2026-10-08T06:00:00.000Z" });
    seedNotification(r4, "customer_request_declined", "failed");
    asCoach();

    const labels = (await listFailedBookingNotifications()).map((item) => item.label).sort();
    expect(labels).toEqual([
      "Bekräftelse till kund",
      "Besked till kund",
      "Kvitto till kund",
      "Ny förfrågan till Carolina",
    ]);
  });

  it("hämtar aldrig känsliga kolumner från databasen", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");
    asCoach();
    await listFailedBookingNotifications();

    const asked = store.selectedColumns.join(" ");
    for (const column of [
      "dispatch_token",
      "idempotency_key",
      "recipient_email",
      "last_error_code",
      "last_error_message",
      "provider_message_id",
    ]) {
      expect(asked).not.toContain(column);
    }
    expect(asked).toContain("event_type");
    expect(asked).toContain("requested_start_at");
  });

  it("returnerar inget känsligt i resultatet", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");
    asCoach();

    const serialized = JSON.stringify(await listFailedBookingNotifications());
    for (const leak of [
      "anna@example.com",
      "application_error",
      "resend exploded internally",
      "cvb-public-booking/",
      request.dispatch_token,
    ]) {
      expect(serialized).not.toContain(leak);
    }
  });

  it("hoppar över en notis vars förfrågan inte är synlig", async () => {
    const hidden = seedRequest({ coach_id: OTHER_COACH_ID });
    const orphan = seedNotification(hidden, "customer_request_received", "failed");
    // The notification is reachable but its request is not — render nothing
    // rather than a row without context.
    store.requests = store.requests.filter((r) => r.id !== hidden.id);
    store.requests.push({ ...hidden, coach_id: COACH_ID });
    store.notifications = [{ ...orphan, request_id: "saknas" }];
    asCoach();

    expect(await listFailedBookingNotifications()).toEqual([]);
  });

  it("visar bara ofarlig operativ information i panelen", () => {
    expect(failedSource).toContain("Mejl som behöver skickas om");
    expect(failedSource).toContain("Kunde inte skickas");
    expect(failedSource).toContain("Bokningen och tidsfönstret påverkas inte.");

    const code = withoutComments(failedSource);
    for (const forbidden of [
      "last_error_code",
      "last_error_message",
      "idempotency",
      "dispatch_token",
      "recipient_email",
      "errorCode",
      "Resend",
      "provider",
    ]) {
      expect(code).not.toContain(forbidden);
    }
  });
});

// ------------------------------------------------------------------ retry

describe("skicka om", () => {
  it("visar knappen bara när notisen kan skickas om", () => {
    expect(failedSource).toContain("{item.canRetry ? (");
    expect(failedSource).toContain("Skicka igen");
  });

  it("anropar bara den befintliga behöriga rutten", () => {
    const routes = failedSource.match(/fetch\(\s*`?[^`")]*/g) ?? [];
    expect(routes).toHaveLength(1);
    expect(failedSource).toContain(
      "/api/portal/tillganglighet/forfragningar/${item.requestId}/skicka-om",
    );
  });

  it("blockerar dubbelklick och visar laddningsläge", () => {
    expect(failedSource).toContain("if (busyKey) return;");
    expect(failedSource).toContain("disabled={busy || busyKey !== null}");
    expect(failedSource).toContain('{busy ? "Skickar…" : "Skicka igen"}');
  });

  it("uppdaterar vyn efter lyckad omsändning", () => {
    expect(failedSource).toContain("router.refresh()");
  });

  it("visar ett neutralt fel utan leverantörsdetaljer", () => {
    expect(failedSource).toContain("Mejlet kunde inte skickas just nu. Försök igen senare.");
    // The route's own error text is never rendered.
    expect(failedSource).not.toContain("result.error");
  });

  it("kräver coachsession", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");

    const response = await retry(request.id, "customer_request_received");
    expect(response.status).toBe(401);
  });

  it("skickar om utan att skapa en ny notishändelse eller ändra bokningen", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");
    asCoach();

    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <kontakt@cvbcoaching.se>";
    process.env.RESEND_API_KEY = "test-key";
    vi.mocked(createResendBookingProvider).mockReturnValue({
      send: vi.fn(async () => ({ id: "msg-retry" })),
    });

    const notificationsBefore = store.notifications.length;
    const statusBefore = request.status;
    const respondedBefore = request.responded_at;

    const response = await retry(request.id, "customer_request_received");
    expect(response.status).toBe(200);

    // No new event row, and the booking itself is untouched.
    expect(store.notifications).toHaveLength(notificationsBefore);
    expect(store.requests).toHaveLength(1);
    expect(store.requests[0].status).toBe(statusBefore);
    expect(store.requests[0].responded_at).toBe(respondedBefore);
    expect(store.notifications[0].status).toBe("sent");
  });

  it("vägrar skicka om en notis som redan är sent", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "sent");
    asCoach();

    const response = await retry(request.id, "customer_request_received");
    expect(response.status).toBe(409);
  });

  it("skapar ingen klient, användare, profil, uppdrag, avtal, mål eller session", async () => {
    const request = seedRequest();
    seedNotification(request, "customer_request_received", "failed");
    asCoach();
    await retry(request.id, "customer_request_received");

    // The whole flow only ever touches these two collections.
    expect(Object.keys(store).filter((key) => Array.isArray((store as never)[key]))).toEqual([
      "requests",
      "notifications",
      "selectedColumns",
    ]);
    expect(store.requests).toHaveLength(1);
    expect(store.notifications).toHaveLength(1);
  });

  it("lovar inte leverans till inkorgen", () => {
    for (const claim of ["levererat", "Levererat", "kommit fram", "i inkorgen"]) {
      expect(failedSource).not.toContain(claim);
    }
  });
});
