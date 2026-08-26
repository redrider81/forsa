import { readCoachSession } from "@/lib/portal/session";
import { getContract, sendContractForSignature } from "@/lib/portal/contracts";

/** Carolina sends a draft contract for signing — freezes the version and locks editing. */
export async function POST(_request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { contractId } = await params;
  const result = await sendContractForSignature(contractId);
  if (!result.ok) {
    return Response.json({ ok: false, error: "Kunde inte skicka avtalet för signering." }, { status: 502 });
  }

  const updatedContract = await getContract(contractId);
  return Response.json({ ok: true, contract: updatedContract });
}
