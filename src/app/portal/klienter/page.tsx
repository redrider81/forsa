import { readSession } from "@/lib/portal/session";
import { listClients, listEngagements, listSessions } from "@/lib/portal/repository";
import { formatDate } from "@/lib/portal/format";
import { Avatar, Divider, PageHeading, Panel, RowLink, SectionLabel } from "@/components/portal/ui";

export default async function ClientsPage() {
  const session = await readSession();
  if (!session) return null;

  const engagements = listEngagements(session.coachId);
  const clients = listClients(session.coachId);

  return (
    <div className="space-y-7">
      <PageHeading
        label="Klienter"
        title="Klienter och deltagare"
        lead={`${clients.length} pågående coachingrelationer, fördelade på ${engagements.length} uppdrag.`}
      />

      {engagements.map((engagement) => {
        const group = clients.filter((client) => client.engagementId === engagement.id);
        if (group.length === 0) return null;

        return (
          <Panel key={engagement.id}>
            <SectionLabel>{engagement.kindLabel}</SectionLabel>
            <h2 className="mt-2.5 text-[1.15rem] font-medium leading-snug tracking-tight text-zinc-900">
              {engagement.title}
            </h2>

            <div className="mt-4">
              {group.map((client, index) => {
                const clientSessions = listSessions(session.coachId, client.id);
                const upcoming = clientSessions.find((item) => item.status === "kommande");
                const completed = clientSessions.filter((item) => item.status === "genomford").length;
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
  );
}
