import Link from "next/link";
import { readSession } from "@/lib/portal/session";
import { getEngagementOverview, listEngagements } from "@/lib/portal/repository";
import { engagementStatusLabel, formatDate } from "@/lib/portal/format";
import { PageHeading, Panel, SectionLabel, Tag } from "@/components/portal/ui";

export default async function EngagementsPage() {
  const session = await readSession();
  if (!session) return null;

  const engagements = listEngagements(session.coachId);

  return (
    <div className="space-y-7">
      <PageHeading
        label="Uppdrag"
        title="Aktiva uppdrag"
        lead="Samma struktur bär en enskild klient och ett program med tolv deltagare."
      />

      <div className="space-y-4">
        {engagements.map((engagement) => {
          const overview = getEngagementOverview(session.coachId, engagement.id);
          if (!overview) return null;
          return (
            <Panel key={engagement.id} as="article" className="transition-colors hover:border-zinc-300">
              <Link
                href={`/portal/uppdrag/${engagement.id}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                <SectionLabel>{overview.organisation.name}</SectionLabel>
                <h2 className="mt-2.5 text-[1.25rem] font-medium leading-[1.3] tracking-tight text-zinc-900">
                  {engagement.title}
                </h2>
                <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
                  {engagement.purpose}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag>{engagement.kindLabel}</Tag>
                  <Tag>
                    {overview.participants.length === 1
                      ? "1 deltagare"
                      : `${overview.participants.length} deltagare`}
                  </Tag>
                  <Tag>{engagementStatusLabel[engagement.status]}</Tag>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-zinc-200/80 pt-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">Organisation</dt>
                    <dd className="mt-1 text-[0.8125rem] text-zinc-700">{overview.organisation.sizeLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">Genomfört</dt>
                    <dd className="mt-1 text-[0.8125rem] text-zinc-700">
                      {overview.totalCompletedSessions} sessioner
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">Bokat</dt>
                    <dd className="mt-1 text-[0.8125rem] text-zinc-700">
                      {overview.totalUpcomingSessions} kommande
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">Nästa hållpunkt</dt>
                    <dd className="mt-1 text-[0.8125rem] text-zinc-700">
                      {engagement.nextReview ? formatDate(engagement.nextReview.date, false) : "—"}
                    </dd>
                  </div>
                </dl>
              </Link>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
