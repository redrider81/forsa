import Link from "next/link";
import { notFound } from "next/navigation";
import AgreementEditor from "@/components/portal/agreement-editor";
import ClientDetailNav from "@/components/portal/client-detail-nav";
import DocumentArchive from "@/components/portal/document-archive";
import { readCoachSession } from "@/lib/portal/session";
import { getClientDossier } from "@/lib/portal/repository";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function ClientAgreementPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const dossier = await getClientDossier(session.coachId, clientId);
  if (!dossier) notFound();

  const { client } = dossier;

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          {client.name}
        </Link>
        <div className="mt-4">
          <ClientDetailNav clientId={client.id} />
        </div>
        <div className="mt-4">
          <PageHeading label="Avtal & dokument" title={`${client.name} — avtal och dokument`} />
        </div>
      </div>

      <AgreementEditor clientId={client.id} agreement={client.agreement} />
      <DocumentArchive clientId={client.id} coachId={session.coachId} documents={dossier.documents} />
    </div>
  );
}
