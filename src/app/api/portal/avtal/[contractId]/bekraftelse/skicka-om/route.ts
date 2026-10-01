import { readCoachSession } from "@/lib/portal/session";
import { dispatchContractConfirmation, getContractConfirmationState } from "@/lib/portal/contract-confirmation";

/**
 * Retry a contract confirmation that could not be sent. Coach-authorised,
 * own contracts only (every read runs under RLS). Re-sends the stored
 * snapshot with the original idempotency key; never touches the contract,
 * its status or its signatures.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { contractId } = await params;
  const state = await getContractConfirmationState(contractId);
  if (!state) {
    return Response.json({ ok: false, error: "Avtalsbekräftelsen hittades inte." }, { status: 404 });
  }
  if (state.status === "sent") {
    return Response.json({ ok: false, error: "Avtalsbekräftelsen är redan skickad." }, { status: 409 });
  }

  const outcome = await dispatchContractConfirmation(contractId);
  return Response.json({ ok: outcome.status === "sent", status: outcome.status });
}
