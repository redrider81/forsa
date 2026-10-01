import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isEmailSendEnabled } from "@/lib/email/result-email";
import type { BookingEmailProvider } from "@/lib/email/booking-provider";
import { resolveOperatorRecipient, sanitizeError } from "@/lib/portal/booking-notifications";
import {
  buildWithdrawalEmail,
  WITHDRAWAL_EVENT_RECIPIENT,
  WITHDRAWAL_NOTIFICATION_EVENTS,
  type WithdrawalEmailContext,
  type WithdrawalNotificationEvent,
} from "@/lib/email/withdrawal-emails";

/**
 * Consumer withdrawal (ångerrätt) — server side.
 *
 * The withdrawal itself is one atomic database call. Emails are strictly a
 * post-commit side effect on the same outbox pattern as the public booking
 * chain: a failed send is recorded and stays retryable from CVB Base, and
 * can never invalidate or undo a registered withdrawal.
 */

export type WithdrawalErrorCode =
  | "NOT_AUTHORIZED"
  | "CONTRACT_NOT_FOUND"
  | "WITHDRAWAL_NOT_AVAILABLE"
  | "WITHDRAWAL_PERIOD_EXPIRED"
  | "UNKNOWN";

const KNOWN_ERRORS: WithdrawalErrorCode[] = [
  "NOT_AUTHORIZED",
  "CONTRACT_NOT_FOUND",
  "WITHDRAWAL_NOT_AVAILABLE",
  "WITHDRAWAL_PERIOD_EXPIRED",
];

export function withdrawalErrorCode(message: string | undefined): WithdrawalErrorCode {
  const match = KNOWN_ERRORS.find((code) => message?.includes(code));
  return match ?? "UNKNOWN";
}

export type ExerciseWithdrawalResult =
  | { ok: true; withdrawalId: string; requestedAt: string; alreadyWithdrawn: boolean }
  | { ok: false; code: WithdrawalErrorCode };

export async function exerciseContractWithdrawal(contractId: string): Promise<ExerciseWithdrawalResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("exercise_contract_withdrawal", { p_contract_id: contractId });
  if (error) return { ok: false, code: withdrawalErrorCode(error.message) };
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { ok: false, code: "UNKNOWN" };
  return {
    ok: true,
    withdrawalId: row.withdrawal_id,
    requestedAt: row.requested_at,
    alreadyWithdrawn: row.already_withdrawn,
  };
}

/** Same shape the database generates, so a retry reuses the provider-side key. */
export function withdrawalIdempotencyKey(withdrawalId: string, event: WithdrawalNotificationEvent): string {
  return `cvb-contract-withdrawal/${withdrawalId}/${event}`;
}

/**
 * Rebuilds the email context from stored data only — the withdrawal record,
 * the contract and nothing a request body supplied. Runs under the caller's
 * RLS: the withdrawing client or the owning coach.
 */
export async function loadWithdrawalEmailContext(contractId: string): Promise<WithdrawalEmailContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contracts")
    .select(
      "id, early_performance_requested_at, contract_withdrawals(id, contract_title, contract_version_id, requester_name, receipt_email, requested_at, withdrawal_deadline)",
    )
    .eq("id", contractId)
    .maybeSingle();

  const raw = data?.contract_withdrawals as unknown;
  const withdrawal = (Array.isArray(raw) ? raw[0] : raw) as
    | {
        id: string;
        contract_title: string;
        contract_version_id: string;
        requester_name: string;
        receipt_email: string;
        requested_at: string;
        withdrawal_deadline: string | null;
      }
    | null
    | undefined;
  if (!data || !withdrawal) return null;

  return {
    withdrawalId: withdrawal.id,
    contractId: data.id,
    contractTitle: withdrawal.contract_title,
    contractVersionId: withdrawal.contract_version_id,
    clientName: withdrawal.requester_name,
    receiptEmail: withdrawal.receipt_email,
    requestedAt: withdrawal.requested_at,
    withdrawalDeadline: withdrawal.withdrawal_deadline,
    earlyPerformanceRequestedAt: data.early_performance_requested_at,
  };
}

type RecordArgs = {
  withdrawalId: string;
  event: WithdrawalNotificationEvent;
  status: "sending" | "sent" | "failed";
  recipientEmail?: string | null;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

async function recordResult(args: RecordArgs): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("record_contract_withdrawal_notification_result", {
    p_withdrawal_id: args.withdrawalId,
    p_event_type: args.event,
    p_status: args.status,
    p_recipient_email: args.recipientEmail ?? null,
    p_provider_message_id: args.providerMessageId ?? null,
    p_error_code: args.errorCode ?? null,
    p_error_message: args.errorMessage ?? null,
  });
  if (error) {
    // Best-effort relative to the withdrawal, which is already committed.
    console.error("[CVB Coaching] Kunde inte skriva status för ångermejl", {
      event: args.event,
      status: args.status,
    });
  }
}

export type WithdrawalNotificationOutcome = {
  event: WithdrawalNotificationEvent;
  status: "sent" | "failed";
  simulated?: boolean;
  errorCode?: string;
};

async function dispatchOne(
  event: WithdrawalNotificationEvent,
  context: WithdrawalEmailContext,
  provider?: BookingEmailProvider,
): Promise<WithdrawalNotificationOutcome> {
  const recipientType = WITHDRAWAL_EVENT_RECIPIENT[event];
  const operator = resolveOperatorRecipient();
  const to = recipientType === "coach" ? operator : context.receiptEmail;

  await recordResult({ withdrawalId: context.withdrawalId, event, status: "sending", recipientEmail: to });

  if (!to) {
    await recordResult({
      withdrawalId: context.withdrawalId,
      event,
      status: "failed",
      errorCode: "missing_recipient",
      errorMessage: "Klienten saknar e-postadress.",
    });
    return { event, status: "failed", errorCode: "missing_recipient" };
  }

  const email = buildWithdrawalEmail(event, context);

  if (!isEmailSendEnabled()) {
    console.info("[CVB Coaching] Ångermejl simulerat (EMAIL_SEND_ENABLED !== true)", {
      event,
      recipientType,
      subjectLength: email.subject.length,
    });
    await recordResult({ withdrawalId: context.withdrawalId, event, status: "sent", providerMessageId: "simulated" });
    return { event, status: "sent", simulated: true };
  }

  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    await recordResult({
      withdrawalId: context.withdrawalId,
      event,
      status: "failed",
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
      idempotencyKey: withdrawalIdempotencyKey(context.withdrawalId, event),
      // A client reply lands in the same mailbox as the operator notice.
      replyTo: recipientType === "client" ? operator : undefined,
    });
    await recordResult({ withdrawalId: context.withdrawalId, event, status: "sent", providerMessageId: result.id });
    return { event, status: "sent", simulated: false };
  } catch (error) {
    const sanitized = sanitizeError(error);
    console.error("[CVB Coaching] Ångermejl kunde inte skickas", { event, recipientType, errorCode: sanitized.code });
    await recordResult({
      withdrawalId: context.withdrawalId,
      event,
      status: "failed",
      errorCode: sanitized.code,
      errorMessage: sanitized.message,
    });
    return { event, status: "failed", errorCode: sanitized.code };
  }
}

/** Always resolves — the caller reports the withdrawal regardless of email. */
export async function dispatchWithdrawalNotifications(
  context: WithdrawalEmailContext,
  events: readonly WithdrawalNotificationEvent[] = WITHDRAWAL_NOTIFICATION_EVENTS,
  options?: { provider?: BookingEmailProvider },
): Promise<WithdrawalNotificationOutcome[]> {
  const outcomes: WithdrawalNotificationOutcome[] = [];
  for (const event of events) {
    try {
      outcomes.push(await dispatchOne(event, context, options?.provider));
    } catch {
      outcomes.push({ event, status: "failed", errorCode: "dispatch_error" });
    }
  }
  return outcomes;
}

const EVENT_LABEL_SV: Record<WithdrawalNotificationEvent, string> = {
  client_withdrawal_receipt: "Mottagningsbevis till klient (ångrat avtal)",
  coach_withdrawal_notice: "Notis till Carolina (ångrat avtal)",
};

export type FailedWithdrawalNotification = {
  contractId: string;
  eventType: WithdrawalNotificationEvent;
  label: string;
  clientName: string;
  contractTitle: string;
  requestedAt: string;
};

/**
 * Coach-only, RLS-scoped. Like the booking query, it never selects the
 * recipient address, idempotency key or provider error text.
 */
export async function listFailedWithdrawalNotifications(): Promise<FailedWithdrawalNotification[]> {
  const supabase = await createSupabaseServerClient();
  const { data: failed } = await supabase
    .from("contract_withdrawal_notifications")
    .select("withdrawal_id, event_type")
    .eq("status", "failed")
    .order("created_at", { ascending: true });

  if (!failed || failed.length === 0) return [];

  const ids = [...new Set(failed.map((row) => row.withdrawal_id))];
  const { data: withdrawals } = await supabase
    .from("contract_withdrawals")
    .select("id, contract_id, contract_title, requester_name, requested_at")
    .in("id", ids);

  const byId = new Map((withdrawals ?? []).map((row) => [row.id, row]));

  return failed.flatMap((row) => {
    const withdrawal = byId.get(row.withdrawal_id);
    const eventType = row.event_type as WithdrawalNotificationEvent;
    if (!withdrawal || !(eventType in EVENT_LABEL_SV)) return [];
    return [
      {
        contractId: withdrawal.contract_id,
        eventType,
        label: EVENT_LABEL_SV[eventType],
        clientName: withdrawal.requester_name,
        contractTitle: withdrawal.contract_title,
        requestedAt: withdrawal.requested_at,
      },
    ];
  });
}

export function isWithdrawalNotificationEvent(value: unknown): value is WithdrawalNotificationEvent {
  return typeof value === "string" && (WITHDRAWAL_NOTIFICATION_EVENTS as readonly string[]).includes(value);
}

/** Coach-only (RLS): the ledger status of one withdrawal notification. */
export async function getWithdrawalNotificationStatus(
  withdrawalId: string,
  event: WithdrawalNotificationEvent,
): Promise<"pending" | "sending" | "sent" | "failed" | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contract_withdrawal_notifications")
    .select("status")
    .eq("withdrawal_id", withdrawalId)
    .eq("event_type", event)
    .maybeSingle();
  return (data?.status as "pending" | "sending" | "sent" | "failed" | undefined) ?? null;
}
