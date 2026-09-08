import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isEmailSendEnabled, RESULT_EMAIL_RECIPIENT } from "@/lib/email/result-email";
import {
  BOOKING_EVENT_RECIPIENT,
  buildBookingEmail,
  type BookingEmailContext,
  type BookingNotificationEvent,
} from "@/lib/email/booking-emails";
import type { BookingEmailProvider } from "@/lib/email/booking-provider";

/**
 * Post-commit dispatch for the public booking chain.
 *
 * Booking truth lives in the database. Everything here runs AFTER the
 * booking mutation has committed, and a failure here can never roll back,
 * invalidate or corrupt a request, a status transition, or slot behaviour —
 * it only records a failed attempt that stays retryable.
 */

export type BookingNotificationOutcome = {
  event: BookingNotificationEvent;
  status: "sent" | "failed" | "skipped";
  simulated?: boolean;
  errorCode?: string;
};

/**
 * Where operator notifications go. Server-only, never sent to the browser
 * and never accepted from a request body. Defaults to the address the
 * portal already uses for coach-facing mail, so no new private recipient is
 * introduced anywhere in public source.
 */
export function resolveOperatorRecipient(): string {
  return process.env.BOOKING_OPERATOR_EMAIL?.trim() || RESULT_EMAIL_RECIPIENT;
}

function resolveFromAddress(): string | null {
  return process.env.EMAIL_FROM?.trim() || null;
}

/** Same shape the database generates, so a retry reuses the same key. */
export function bookingIdempotencyKey(requestId: string, event: BookingNotificationEvent): string {
  return `cvb-public-booking/${requestId}/${event}`;
}

/**
 * Provider errors are recorded as a short code plus a truncated message.
 * Raw provider payloads, credentials and stack traces never reach the
 * ledger, the browser, or a log line a visitor could see.
 */
function sanitizeError(error: unknown): { code: string; message: string } {
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : "provider_error";
  const raw = error instanceof Error ? error.message : "";
  return { code: code.slice(0, 80), message: raw.slice(0, 300) };
}

export type BookingNotificationRecord = {
  event: BookingNotificationEvent;
  status: "pending" | "sending" | "sent" | "failed";
  attemptCount: number;
  lastAttemptAt: string | null;
  errorCode: string | null;
};

/**
 * Coach-only. Reads the ledger for one request under the coach's own RLS
 * policy — there is no anonymous path to this data.
 */
export async function listBookingNotifications(
  requestId: string,
): Promise<BookingNotificationRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("public_booking_notifications")
    .select("event_type, status, attempt_count, last_attempt_at, last_error_code")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    event: row.event_type as BookingNotificationEvent,
    status: row.status as BookingNotificationRecord["status"],
    attemptCount: row.attempt_count,
    lastAttemptAt: row.last_attempt_at,
    errorCode: row.last_error_code,
  }));
}

/**
 * Coach-facing labels for the four notification events. Operational
 * shorthand, not customer copy — it says who the message was for, never
 * what it contained.
 */
const EVENT_LABEL_SV: Record<BookingNotificationEvent, string> = {
  customer_request_received: "Kvitto till kund",
  coach_new_request: "Ny förfrågan till Carolina",
  customer_request_accepted: "Bekräftelse till kund",
  customer_request_declined: "Besked till kund",
};

export type FailedBookingNotification = {
  requestId: string;
  eventType: BookingNotificationEvent;
  label: string;
  visitorName: string;
  requestedStartAt: string;
  requestedEndAt: string;
  /** The retry route rebuilds the payload from stored data for all four events. */
  canRetry: boolean;
};

/**
 * Every booking notification of this coach's that is stuck in `failed`.
 *
 * Both reads run under the coach's own RLS policies, so another coach's
 * rows, a client, or an anonymous caller can never appear here. The
 * columns carrying operational secrets — dispatch_token, idempotency_key,
 * recipient_email, last_error_code, last_error_message — are deliberately
 * never selected, so they cannot reach a rendered page by accident.
 */
export async function listFailedBookingNotifications(): Promise<FailedBookingNotification[]> {
  const supabase = await createSupabaseServerClient();

  const { data: failed } = await supabase
    .from("public_booking_notifications")
    .select("request_id, event_type")
    .eq("status", "failed")
    .order("created_at", { ascending: true });

  if (!failed || failed.length === 0) return [];

  const requestIds = [...new Set(failed.map((row) => row.request_id))];
  const { data: requests } = await supabase
    .from("public_booking_requests")
    .select("id, name, requested_start_at, requested_end_at")
    .in("id", requestIds);

  const byId = new Map((requests ?? []).map((row) => [row.id, row]));

  return failed.flatMap((row) => {
    const request = byId.get(row.request_id);
    // A row whose request is not visible under RLS is skipped rather than
    // rendered without context.
    if (!request) return [];
    const eventType = row.event_type as BookingNotificationEvent;
    return [
      {
        requestId: row.request_id,
        eventType,
        label: EVENT_LABEL_SV[eventType] ?? "Bokningsmejl",
        visitorName: request.name,
        requestedStartAt: request.requested_start_at,
        requestedEndAt: request.requested_end_at,
        canRetry: eventType in EVENT_LABEL_SV,
      },
    ];
  });
}

/**
 * Whether booking email is actually leaving the machine. Read server-side
 * only — the boolean is what reaches a page, never the variable's value.
 */
export function bookingEmailIsSimulated(): boolean {
  return !isEmailSendEnabled();
}

type RecordArgs = {
  requestId: string;
  event: BookingNotificationEvent;
  status: "sending" | "sent" | "failed";
  dispatchToken?: string | null;
  recipientEmail?: string | null;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

async function recordResult(args: RecordArgs): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("record_public_booking_notification_result", {
    p_request_id: args.requestId,
    p_event_type: args.event,
    p_status: args.status,
    p_dispatch_token: args.dispatchToken ?? null,
    p_recipient_email: args.recipientEmail ?? null,
    p_provider_message_id: args.providerMessageId ?? null,
    p_error_code: args.errorCode ?? null,
    p_error_message: args.errorMessage ?? null,
  });

  if (error) {
    // The ledger is best-effort relative to the booking itself. A failure
    // to record must never surface to the visitor or undo the booking.
    console.error("[CVB Coaching] Kunde inte skriva bokningsnotisens status", {
      event: args.event,
      status: args.status,
    });
  }
}

async function dispatchOne(
  event: BookingNotificationEvent,
  input: { requestId: string; dispatchToken?: string | null; context: BookingEmailContext },
  provider?: BookingEmailProvider,
): Promise<BookingNotificationOutcome> {
  const recipientType = BOOKING_EVENT_RECIPIENT[event];
  const to = recipientType === "coach" ? resolveOperatorRecipient() : input.context.email;
  // Customer mail is sent from a technical address no one reads, so a reply
  // is pointed at the same operator mailbox the coach notification goes to.
  // Operator mail needs none: it already arrives in that mailbox.
  const replyTo = recipientType === "customer" ? resolveOperatorRecipient() : undefined;

  await recordResult({
    requestId: input.requestId,
    event,
    status: "sending",
    dispatchToken: input.dispatchToken,
    recipientEmail: to,
  });

  const email = buildBookingEmail(event, input.context);

  // Simulated mode is the local/default configuration: nothing leaves the
  // machine. The attempt is closed out with a "simulated" provider id so a
  // developer can tell it apart from a real provider acceptance.
  if (!isEmailSendEnabled()) {
    console.info("[CVB Coaching] Bokningsnotis simulerad (EMAIL_SEND_ENABLED !== true)", {
      event,
      recipientType,
      subjectLength: email.subject.length,
    });
    await recordResult({
      requestId: input.requestId,
      event,
      status: "sent",
      dispatchToken: input.dispatchToken,
      providerMessageId: "simulated",
    });
    return { event, status: "sent", simulated: true };
  }

  const from = resolveFromAddress();
  if (!from) {
    await recordResult({
      requestId: input.requestId,
      event,
      status: "failed",
      dispatchToken: input.dispatchToken,
      errorCode: "missing_from_address",
      errorMessage: "EMAIL_FROM saknas i den här miljön.",
    });
    return { event, status: "failed", errorCode: "missing_from_address" };
  }

  try {
    const resolved =
      provider ?? (await import("@/lib/email/booking-provider")).createResendBookingProvider();
    const result = await resolved.send({
      from,
      to,
      subject: email.subject,
      body: email.body,
      idempotencyKey: bookingIdempotencyKey(input.requestId, event),
      replyTo,
    });

    await recordResult({
      requestId: input.requestId,
      event,
      status: "sent",
      dispatchToken: input.dispatchToken,
      providerMessageId: result.id,
    });
    return { event, status: "sent", simulated: false };
  } catch (error) {
    const sanitized = sanitizeError(error);
    console.error("[CVB Coaching] Bokningsnotis kunde inte skickas", {
      event,
      recipientType,
      errorCode: sanitized.code,
    });
    await recordResult({
      requestId: input.requestId,
      event,
      status: "failed",
      dispatchToken: input.dispatchToken,
      errorCode: sanitized.code,
      errorMessage: sanitized.message,
    });
    return { event, status: "failed", errorCode: sanitized.code };
  }
}

/**
 * Attempts every requested notification. Always resolves — a caller must be
 * able to report booking success even when every send failed.
 */
export async function dispatchBookingNotifications(
  input: {
    requestId: string;
    dispatchToken?: string | null;
    events: BookingNotificationEvent[];
    context: BookingEmailContext;
  },
  options?: { provider?: BookingEmailProvider },
): Promise<BookingNotificationOutcome[]> {
  const outcomes: BookingNotificationOutcome[] = [];
  for (const event of input.events) {
    try {
      outcomes.push(await dispatchOne(event, input, options?.provider));
    } catch {
      // Defensive: dispatchOne already contains its own failure handling.
      outcomes.push({ event, status: "failed", errorCode: "dispatch_error" });
    }
  }
  return outcomes;
}
