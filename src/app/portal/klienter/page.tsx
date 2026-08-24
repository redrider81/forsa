import { readCoachSession } from "@/lib/portal/session";
import { readDemoState } from "@/lib/portal/store/demo-store";
import {
  fetchPortalRepositoryData,
  getOrganisation,
  listClients,
  listEngagements,
  listSessions,
} from "@/lib/portal/repository";
import { formatDate } from "@/lib/portal/format";
import {
  Avatar,
  Divider,
  PageHeading,
  Panel,
  portalPageStackClass,
  RowLink,
  SectionLabel,
} from "@/components/portal/ui";

export default async function ClientsPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const state = await readDemoState();
  const data = await fetchPortalRepositoryData();
  const engagements = listEngagements(session.coachId, data);
  const clients = listClients(session.coachId, state, data);

  return (
    <div className={portalPageStackClass}>
      <PageHeading
        title="Klienter"
        lead={`${clients.length} aktiva coachingrelationer · ${engagements.length} uppdrag`}
      />

      <div className="space-y-6">
        {engagements.map((engagement) => {
          const group = clients.filter((client) => client.engagementId === engagement.id);
          if (group.length === 0) return null;

          const organisation = getOrganisation(session.coachId, engagement.organisationId, data);

          return (
            <Panel key={engagement.id} as="section">
              <SectionLabel>{engagement.kindLabel}</SectionLabel>
              <h2 className="mt-2.5 text-[1.35rem] font-medium leading-snug tracking-tight text-zinc-900 md:text-[1.45rem]">
                {engagement.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-zinc-600">
                {organisation ? `${organisation.name} · ` : ""}
                {group.length === 1 ? "1 deltagare" : `${group.length} deltagare`}
              </p>

              <div className="mt-5 border-t border-[var(--klient-border-muted)] pt-4">
                {group.map((client, index) => {
                  const clientSessions = listSessions(session.coachId, client.id, state, data);
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
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
