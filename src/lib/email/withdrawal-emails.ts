/**
 * Emails for an exercised consumer withdrawal (ångerrätt).
 *
 * The client's message is an acknowledgement of receipt: it restates what
 * the consumer submitted and when it was registered. It is not a decision
 * and says nothing about approval. No marketing, no AI wording.
 * CVB Base is Swedish-only, so these are too.
 */

export const WITHDRAWAL_NOTIFICATION_EVENTS = [
  "client_withdrawal_receipt",
  "coach_withdrawal_notice",
] as const;

export type WithdrawalNotificationEvent = (typeof WITHDRAWAL_NOTIFICATION_EVENTS)[number];

export const WITHDRAWAL_EVENT_RECIPIENT: Record<WithdrawalNotificationEvent, "client" | "coach"> = {
  client_withdrawal_receipt: "client",
  coach_withdrawal_notice: "coach",
};

export type WithdrawalEmailContext = {
  withdrawalId: string;
  contractId: string;
  contractTitle: string;
  contractVersionId: string;
  clientName: string;
  receiptEmail: string;
  requestedAt: string;
  withdrawalDeadline: string | null;
  earlyPerformanceRequestedAt: string | null;
};

export type WithdrawalEmail = { subject: string; body: string };

const TIMEZONE = "Europe/Stockholm";

function formatDateTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return `${new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: TIMEZONE,
  }).format(parsed)} (svensk tid)`;
}

function formatLastDay(deadlineIso: string): string {
  const parsed = new Date(deadlineIso);
  if (Number.isNaN(parsed.getTime())) return deadlineIso;
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(parsed.getTime() - 1));
}

function lines(...parts: Array<string | null | false>): string {
  return parts.filter((part): part is string => typeof part === "string").join("\n");
}

export function buildWithdrawalEmail(
  event: WithdrawalNotificationEvent,
  context: WithdrawalEmailContext,
): WithdrawalEmail {
  const registered = formatDateTime(context.requestedAt);

  if (event === "client_withdrawal_receipt") {
    return {
      subject: `Mottagningsbevis: ångrat avtal – ${context.contractTitle}`,
      body: lines(
        `Hej ${context.clientName},`,
        "",
        `Vi har tagit emot din begäran att ångra avtalet ${context.contractTitle}.`,
        `Begäran registrerades ${registered}.`,
        "",
        "Det här registrerades:",
        `Namn: ${context.clientName}`,
        `Avtal: ${context.contractTitle}`,
        `Avtals-ID: ${context.contractId}`,
        `Avtalsversion: ${context.contractVersionId}`,
        `Meddelande: Jag ångrar avtalet ${context.contractTitle}.`,
        context.withdrawalDeadline ? `Ångerfristens sista dag: ${formatLastDay(context.withdrawalDeadline)}` : null,
        context.earlyPerformanceRequestedAt
          ? `Du begärde att coachingen skulle påbörjas under ångerfristen (${formatDateTime(context.earlyPerformanceRequestedAt)}). Du betalar då för den del av tjänsten som utförts fram till att du ångrade dig.`
          : null,
        "",
        "Det här är ett automatiskt mottagningsbevis. Avtalet och din ångerbegäran finns kvar under Avtal i CVB Base.",
        "",
        "CVB Coaching",
      ),
    };
  }

  return {
    subject: `Avtal ångrat: ${context.contractTitle}`,
    body: lines(
      `${context.clientName} har utövat ångerrätten för avtalet ${context.contractTitle}.`,
      `Begäran registrerades ${registered}.`,
      context.earlyPerformanceRequestedAt
        ? "Klienten hade begärt att tjänsten skulle påbörjas under ångerfristen."
        : "Klienten hade inte begärt att tjänsten skulle påbörjas under ångerfristen.",
      "",
      "Se avtalet i CVB Base.",
    ),
  };
}
