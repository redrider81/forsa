import { readSession } from "@/lib/portal/session";
import { getContract, listContractSignatures, signContractAsClient, signContractAsCoach } from "@/lib/portal/contracts";
import { dispatchContractConfirmation } from "@/lib/portal/contract-confirmation";
import { CURRENT_GENERAL_TERMS_VERSION } from "@/lib/legal/terms-versions";

/**
 * Either party signs. The signer's role and identity come from the
 * authenticated session, never from the request body. The exact version
 * being signed is read from the contract itself, not trusted client input.
 *
 * The only thing the body may carry is the client's separate, explicit
 * choice to have the service start during the withdrawal period. It is
 * ignored for coaches, and the database ignores it for business contracts.
 */
export async function POST(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { contractId } = await params;
  const contract = await getContract(contractId);
  if (!contract) {
    return Response.json({ ok: false, error: "Avtalet kunde inte hittas." }, { status: 404 });
  }

  let requestEarlyPerformance = false;
  // The terms version the client was shown and confirms: the one pinned to
  // the contract (legacy contracts: the current one). The database checks it.
  let generalTermsVersion = contract.generalTermsVersion ?? CURRENT_GENERAL_TERMS_VERSION;
  if (session.role === "klient") {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    requestEarlyPerformance = body?.requestEarlyPerformance === true;
    if (typeof body?.generalTermsVersion === "string") generalTermsVersion = body.generalTermsVersion;
  }

  const result =
    session.role === "klient"
      ? await signContractAsClient(contractId, contract.versionId, requestEarlyPerformance, generalTermsVersion)
      : await signContractAsCoach(contractId, contract.versionId);

  if (!result.ok) {
    return Response.json({ ok: false, error: "Kunde inte signera avtalet." }, { status: 502 });
  }

  // The countersignature is committed. A consumer contract has had its
  // confirmation queued in that same transaction; sending it is best-effort
  // and its outcome never changes the signing result.
  if (session.role !== "klient") {
    await dispatchContractConfirmation(contractId);
  }

  const [updatedContract, signatures] = await Promise.all([getContract(contractId), listContractSignatures(contractId)]);

  return Response.json({ ok: true, contract: updatedContract, signatures });
}
