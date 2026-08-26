import InternalDocumentArchive from "@/components/portal/internal-document-archive";
import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, listInternalDocuments } from "@/lib/portal/repository";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function InternalDocumentsPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const documents = listInternalDocuments(session.coachId, data);

  return (
    <div className={portalPageStackClass}>
      <PageHeading
        title="Dokument"
        lead="Ditt interna arkiv — avtal, mallar, certifikat och administrativa underlag. Synligt endast för dig."
      />
      <InternalDocumentArchive coachId={session.coachId} documents={documents} />
    </div>
  );
}
