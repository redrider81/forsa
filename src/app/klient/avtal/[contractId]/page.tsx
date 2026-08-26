import { notFound } from "next/navigation";
import { readClientSession } from "@/lib/portal/session";
import { getContract, listContractSignatures } from "@/lib/portal/contracts";
import ContractWorkspace from "@/components/portal/avtal/contract-workspace";

export default async function ClientAvtalDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const session = await readClientSession();
  if (!session) return null;

  const { contractId } = await params;
  const contract = await getContract(contractId);
  if (!contract || contract.clientId !== session.clientId) notFound();

  const signatures = await listContractSignatures(contractId);

  return (
    <div className="space-y-6">
      <ContractWorkspace initialContract={contract} initialSignatures={signatures} viewerRole="klient" />
    </div>
  );
}
