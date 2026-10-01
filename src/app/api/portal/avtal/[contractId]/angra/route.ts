import { readClientSession } from "@/lib/portal/session";
import {
  dispatchWithdrawalNotifications,
  exerciseContractWithdrawal,
  loadWithdrawalEmailContext,
  type WithdrawalErrorCode,
} from "@/lib/portal/contract-withdrawal";

const MESSAGES: Record<WithdrawalErrorCode, { status: number; error: string }> = {
  NOT_AUTHORIZED: { status: 403, error: "Endast klienten kan ångra sitt avtal." },
  CONTRACT_NOT_FOUND: { status: 404, error: "Avtalet kunde inte hittas." },
  WITHDRAWAL_NOT_AVAILABLE: { status: 409, error: "Ångerrätt gäller inte för det här avtalet." },
  WITHDRAWAL_PERIOD_EXPIRED: { status: 409, error: "Ångerfristen för avtalet har löpt ut." },
  UNKNOWN: { status: 502, error: "Begäran kunde inte registreras just nu. Försök igen om en stund." },
};

/**
 * The consumer's online withdrawal function (ångerfunktion).
 *
 * Client session only — the coach can never exercise a client's right. The
 * database function re-checks ownership, classification, signature state
 * and the deadline, stamps the time server-side and writes the audit record
 * and both outbox rows in one transaction. Repeating the call returns the
 * existing record unchanged.
 *
 * Emails are sent after commit and only for a newly registered withdrawal.
 * Their outcome is deliberately not part of the response: the withdrawal
 * is valid whether or not an email could be sent.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: MESSAGES.NOT_AUTHORIZED.error }, { status: 403 });
  }

  const { contractId } = await params;
  const result = await exerciseContractWithdrawal(contractId);
  if (!result.ok) {
    const message = MESSAGES[result.code];
    return Response.json({ ok: false, error: message.error }, { status: message.status });
  }

  if (!result.alreadyWithdrawn) {
    const context = await loadWithdrawalEmailContext(contractId);
    if (context) await dispatchWithdrawalNotifications(context);
  }

  return Response.json({
    ok: true,
    withdrawal: { requestedAt: result.requestedAt, alreadyWithdrawn: result.alreadyWithdrawn },
  });
}
