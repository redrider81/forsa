import { readCoachSession } from "@/lib/portal/session";
import {
  dispatchWithdrawalNotifications,
  getWithdrawalNotificationStatus,
  isWithdrawalNotificationEvent,
  loadWithdrawalEmailContext,
} from "@/lib/portal/contract-withdrawal";

/**
 * Retry one failed withdrawal email. Coach-authorised only, and only for
 * the coach's own contracts (every read runs under RLS). Acts purely on the
 * existing ledger row with the original idempotency key; it never touches
 * the withdrawal itself.
 */
export async function POST(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const eventType = (body as Record<string, unknown> | null)?.eventType;
  if (!isWithdrawalNotificationEvent(eventType)) {
    return Response.json({ ok: false, error: "Ogiltig notistyp." }, { status: 400 });
  }

  const { contractId } = await params;
  const context = await loadWithdrawalEmailContext(contractId);
  if (!context) {
    return Response.json({ ok: false, error: "Ångerbegäran hittades inte." }, { status: 404 });
  }

  const status = await getWithdrawalNotificationStatus(context.withdrawalId, eventType);
  if (!status) {
    return Response.json({ ok: false, error: "Notisen hittades inte." }, { status: 404 });
  }
  if (status === "sent") {
    return Response.json({ ok: false, error: "Notisen är redan skickad." }, { status: 409 });
  }

  const [outcome] = await dispatchWithdrawalNotifications(context, [eventType]);
  return Response.json({ ok: outcome?.status === "sent", status: outcome?.status ?? "failed" });
}
