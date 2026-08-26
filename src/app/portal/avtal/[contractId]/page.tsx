import Link from "next/link";
import { notFound } from "next/navigation";
import { readCoachSession } from "@/lib/portal/session";
import { getContract, listContractSignatures } from "@/lib/portal/contracts";
import ContractWorkspace from "@/components/portal/avtal/contract-workspace";
import { portalQuietLinkClass, portalPageStackClass } from "@/components/portal/ui";

export default async function AvtalDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const session = await readCoachSession();
  if (!session) return null;

  const { contractId } = await params;
  const contract = await getContract(contractId);
  if (!contract || contract.coachId !== session.coachId) notFound();

  const signatures = await listContractSignatures(contractId);

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link href="/portal/avtal" className={portalQuietLinkClass}>
          ← Avtal
        </Link>
      </div>

      <ContractWorkspace initialContract={contract} initialSignatures={signatures} viewerRole="coach" />
    </div>
  );
}
