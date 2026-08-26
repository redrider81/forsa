import Link from "next/link";
import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, listClients, listEngagements } from "@/lib/portal/repository";
import { listContractTemplates } from "@/lib/portal/contracts";
import NewContractForm from "@/components/portal/avtal/new-contract-form";
import { PageHeading, portalQuietLinkClass, portalPageStackClass } from "@/components/portal/ui";

export default async function NewAvtalPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const clients = listClients(session.coachId, undefined, data);
  const engagements = listEngagements(session.coachId, data);
  const templates = await listContractTemplates();

  const clientOptions = clients.map((client) => {
    const engagement = engagements.find((e) => e.id === client.engagementId);
    return { id: client.id, name: client.name, engagementId: client.engagementId, engagementTitle: engagement?.title ?? "" };
  });

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link href="/portal/avtal" className={portalQuietLinkClass}>
          ← Avtal
        </Link>
      </div>

      <PageHeading label="Avtal" title="Nytt avtal" lead="Utgå från en mall eller börja med ett tomt avtal." />

      <NewContractForm clients={clientOptions} templates={templates} />
    </div>
  );
}
