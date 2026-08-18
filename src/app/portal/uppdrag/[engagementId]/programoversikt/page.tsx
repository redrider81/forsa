import Link from "next/link";
import { notFound } from "next/navigation";
import { readSession } from "@/lib/portal/session";
import { getEngagementOverview } from "@/lib/portal/repository";
import { engagementStatusLabel, formatDate, milestoneStatusLabel } from "@/lib/portal/format";
import { Divider, Panel, PanelHeading, SectionLabel, Tag } from "@/components/portal/ui";

export default async function ProgramReportPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const session = await readSession();
  if (!session) return null;

  const overview = getEngagementOverview(session.coachId, engagementId);
  if (!overview) notFound();

  const { engagement, organisation, participants } = overview;
  const openFollowUps = participants.reduce((sum, item) => sum + item.openCommitments, 0);

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/portal/uppdrag/${engagement.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
        >
          ← {engagement.title}
        </Link>
        <div className="mt-4">
          <SectionLabel>Rapport · uppdragsgivare</SectionLabel>
        </div>
        <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2rem]">
          Programöversikt
        </h1>
        <p className="mt-3.5 text-[1rem] leading-[1.7] text-zinc-600">
          {organisation.name} · {engagement.title} · {engagement.periodLabel}
        </p>
      </div>

      <Panel>
        <PanelHeading label="Status" title={engagementStatusLabel[engagement.status]} />
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          {[
            { term: "Deltagare", value: String(participants.length) },
            { term: "Genomförda", value: String(overview.totalCompletedSessions) },
            { term: "Bokade", value: String(overview.totalUpcomingSessions) },
            { term: "Uppföljningar", value: String(openFollowUps) },
          ].map((item) => (
            <div key={item.term}>
              <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">{item.term}</dt>
              <dd className="mt-1.5 text-[1.5rem] font-medium leading-none tracking-tight text-zinc-900">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 border-t border-zinc-200/80 pt-4 text-[0.9375rem] leading-[1.7] text-zinc-700">
          {engagement.purpose}
        </p>
      </Panel>

      <Panel>
        <PanelHeading label="Deltagande" title="Deltagare och genomförande" />
        <div className="mt-4">
          {participants.map((item, index) => (
            <div key={item.client.id}>
              {index > 0 ? <Divider /> : null}
              <div className="-mx-3 flex items-start justify-between gap-3 px-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[0.9375rem] font-medium leading-snug text-zinc-900">
                    {item.client.name}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug text-zinc-500">
                    {item.client.role}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[0.8125rem] text-zinc-700">
                    {item.completedSessions} genomförda
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-zinc-400">
                    {item.upcomingSession
                      ? `nästa ${formatDate(item.upcomingSession.date, false)}`
                      : "ingen bokad"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Milstolpar" title="Programmets hållpunkter" />
        <ol className="mt-5 space-y-4">
          {engagement.milestones.map((milestone) => (
            <li key={milestone.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.9375rem] leading-snug text-zinc-800">{milestone.label}</p>
                <p className="mt-1 text-[0.8125rem] text-zinc-500">{formatDate(milestone.date)}</p>
              </div>
              <Tag tone={milestone.status === "genomford" ? "done" : "neutral"}>
                {milestoneStatusLabel[milestone.status]}
              </Tag>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel>
        <PanelHeading label="Sekretess" title="Vad rapporten innehåller" />
        <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
          {engagement.sponsorReporting}
        </p>
        <p className="mt-4 text-[0.875rem] leading-relaxed text-zinc-500">
          Rapporten innehåller inga individuella samtalsinnehåll, inga reflektioner, inga insikter och
          inga coachanteckningar.
        </p>
      </Panel>
    </div>
  );
}
