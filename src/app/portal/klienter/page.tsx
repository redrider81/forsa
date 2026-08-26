import Link from "next/link";
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
  portalPrimaryButtonClass,
  portalPageStackClass,
  RowLink,
  SectionLabel,
  Tag,
} from "@/components/portal/ui";

const FILTERS = [
  { key: "aktiva", label: "Aktiva" },
  { key: "avslutade", label: "Avslutade" },
  { key: "alla", label: "Alla" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await readCoachSession();
  if (!session) return null;

  const { status: statusParam } = await searchParams;
  const filter: FilterKey = statusParam === "avslutade" || statusParam === "alla" ? statusParam : "aktiva";

  const state = await readDemoState();
  const data = await fetchPortalRepositoryData();
  const engagements = listEngagements(session.coachId, data);
  const allClients = listClients(session.coachId, state, data);

  const clients = allClients.filter((client) => {
    const clientStatus = client.status ?? "aktiv";
    if (filter === "aktiva") return clientStatus === "aktiv";
    if (filter === "avslutade") return clientStatus === "avslutad";
    return true;
  });

  const activeCount = allClients.filter((client) => (client.status ?? "aktiv") === "aktiv").length;

  return (
    <div className={portalPageStackClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          title="Klienter"
          lead={`${activeCount} aktiva coachingrelationer · ${engagements.length} uppdrag`}
        />
        <Link href="/portal/klienter/ny" className={portalPrimaryButtonClass}>
          + Ny klient
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Link
            key={item.key}
            href={item.key === "aktiva" ? "/portal/klienter" : `/portal/klienter?status=${item.key}`}
            className={`inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-[0.8125rem] font-medium transition-colors ${
              filter === item.key
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {engagements.map((engagement) => {
          const group = clients.filter((client) => client.engagementId === engagement.id);
          if (group.length === 0) return null;

          const organisation = engagement.organisationId
            ? getOrganisation(session.coachId, engagement.organisationId, data)
            : null;

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
                  const isEnded = (client.status ?? "aktiv") === "avslutad";
                  return (
                    <div key={client.id}>
                      {index > 0 ? <Divider /> : null}
                      <RowLink
                        href={`/portal/klienter/${client.id}`}
                        leading={<Avatar initials={client.initials} />}
                        title={client.name}
                        subtitle={client.role}
                        meta={
                          isEnded && client.endedAt
                            ? `Avslutad ${formatDate(client.endedAt.slice(0, 10))}`
                            : `${completed} genomförda sessioner${
                                upcoming ? ` · nästa ${formatDate(upcoming.date, false)}` : ""
                              }`
                        }
                        trailing={isEnded ? <Tag tone="neutral">AVSLUTAD</Tag> : undefined}
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
