import { readCoachSession } from "@/lib/portal/session";
import {
  getOrganisation,
  listClients,
  listEngagements,
  listSessions,
} from "@/lib/portal/repository";
import { formatDate } from "@/lib/portal/format";
import { Avatar, Divider, Panel, RowLink, SectionLabel } from "@/components/portal/ui";

export default async function ClientsPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const engagements = listEngagements(session.coachId);
  const clients = listClients(session.coachId);

  return (
    <div className="space-y-7">
      <header className="pb-1">
        <h1 className="text-[1.6rem] font-medium leading-[1.2] tracking-tight text-zinc-900 md:text-[1.9rem]">
          Klienter
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          {clients.length} aktiva coachingrelationer · {engagements.length} uppdrag
        </p>
      </header>

      {/* En vertikal serie uppdrag. Varje uppdrag är en sektion med samma
          struktur oavsett hur många deltagare det har. */}
      <div className="space-y-6">
        {engagements.map((engagement) => {
          const group = clients.filter((client) => client.engagementId === engagement.id);
          if (group.length === 0) return null;

          const organisation = getOrganisation(session.coachId, engagement.organisationId);

          return (
            <Panel key={engagement.id} as="section">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-x-10">
                <div className="min-w-0 lg:col-span-5">
                  <div className="lg:sticky lg:top-24">
                    <SectionLabel>{engagement.kindLabel}</SectionLabel>
                    <h2 className="mt-2.5 text-[1.15rem] font-medium leading-snug tracking-tight text-zinc-900">
                      {engagement.title}
                    </h2>
                    <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-zinc-500">
                      {organisation ? `${organisation.name} · ` : ""}
                      {group.length === 1 ? "1 deltagare" : `${group.length} deltagare`}
                    </p>
                  </div>
                </div>

                {/* Radbredden kapas så att raderna inte blir onödigt långa
                    på breda skärmar. */}
                <div className="min-w-0 lg:col-span-7 lg:max-w-3xl">
                  {group.map((client, index) => {
                    const clientSessions = listSessions(session.coachId, client.id);
                    const upcoming = clientSessions.find((item) => item.status === "kommande");
                    const completed = clientSessions.filter(
                      (item) => item.status === "genomford",
                    ).length;
                    return (
                      <div key={client.id}>
                        {index > 0 ? <Divider /> : null}
                        <RowLink
                          href={`/portal/klienter/${client.id}`}
                          leading={<Avatar initials={client.initials} />}
                          title={client.name}
                          subtitle={client.role}
                          meta={`${completed} genomförda sessioner${
                            upcoming ? ` · nästa ${formatDate(upcoming.date, false)}` : ""
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
