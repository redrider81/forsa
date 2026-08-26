import { readSession } from "@/lib/portal/session";
import { getContract, listContractSignatures, signContractAsClient, signContractAsCoach } from "@/lib/portal/contracts";

/**
 * Either party signs. The signer's role and identity come from the
 * authenticated session, never from the request body. The exact version
 * being signed is read from the contract itself, not trusted client input.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { contractId } = await params;
  const contract = await getContract(contractId);
  if (!contract) {
    return Response.json({ ok: false, error: "Avtalet kunde inte hittas." }, { status: 404 });
  }

  const result =
    session.role === "klient"
      ? await signContractAsClient(contractId, contract.versionId)
      : await signContractAsCoach(contractId, contract.versionId);

  if (!result.ok) {
    return Response.json({ ok: false, error: "Kunde inte signera avtalet." }, { status: 502 });
  }

  const [updatedContract, signatures] = await Promise.all([getContract(contractId), listContractSignatures(contractId)]);

  return Response.json({ ok: true, contract: updatedContract, signatures });
}
