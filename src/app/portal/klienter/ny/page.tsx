import Link from "next/link";
import NewClientForm from "@/components/portal/new-client-form";
import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, listOrganisations } from "@/lib/portal/repository";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function NewClientPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const organisations = listOrganisations(session.coachId, data);

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href="/portal/klienter"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          Klienter
        </Link>
        <div className="mt-4">
          <PageHeading title="Ny klient" lead="Skapa en privat- eller företagsklient med tillhörande uppdrag." />
        </div>
      </div>

      <NewClientForm
        organisations={organisations.map((o) => ({ id: o.id, name: o.name }))}
      />
    </div>
  );
}
