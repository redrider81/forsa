import Link from "next/link";
import { notFound } from "next/navigation";
import AiAskPanel from "@/components/portal/ai-ask-panel";
import { readCoachSession } from "@/lib/portal/session";
import { getEngagementOverview } from "@/lib/portal/repository";
import { engagementStatusLabel, formatDate, milestoneStatusLabel } from "@/lib/portal/format";
import {
  Avatar,
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  portalOutlineButtonClass,
  portalPageStackClass,
  RowLink,
  SectionLabel,
  Tag,
} from "@/components/portal/ui";

export default async function EngagementPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const overview = await getEngagementOverview(session.coachId, engagementId);
  if (!overview) notFound();

  const { engagement, organisation, participants } = overview;
  const openFollowUps = participants.reduce((sum, item) => sum + item.openCommitments, 0);

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href="/portal/uppdrag"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          Uppdrag
        </Link>
        <div className="mt-4">
          <SectionLabel>{organisation.name}</SectionLabel>
        </div>
        <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2.05rem]">
          {engagement.title}
        </h1>
        <p className="mt-3.5 text-[1rem] leading-[1.7] text-zinc-600">{engagement.purpose}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Tag>{engagement.kindLabel}</Tag>
          <Tag>{engagementStatusLabel[engagement.status]}</Tag>
          <Tag>{engagement.periodLabel}</Tag>
        </div>
      </div>

      <Panel>
        <PanelHeading label="Programstatus" title="Nuläge" />
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
        <p className="mt-6 border-t border-zinc-200/80 pt-4 text-[0.875rem] leading-relaxed text-zinc-600">
          {engagement.scopeNote}
          {organisation.sponsor
            ? ` Uppdragsgivarens kontaktperson är ${organisation.sponsor.name}, ${organisation.sponsor.role}.`
            : ""}
        </p>
      </Panel>

      <Panel>
        <PanelHeading
          label="Deltagare"
          title={participants.length === 1 ? "Deltagare" : `${participants.length} deltagare`}
        />
        <div className="mt-4">
          {participants.map((item, index) => (
            <div key={item.client.id}>
              {index > 0 ? <Divider /> : null}
              <RowLink
                href={`/portal/klienter/${item.client.id}`}
                leading={<Avatar initials={item.client.initials} />}
                title={item.client.name}
                subtitle={item.client.role}
                meta={`${item.completedSessions} genomförda · ${
                  item.upcomingSession
                    ? `nästa ${formatDate(item.upcomingSession.date, false)}`
                    : "ingen bokad session"
                }${item.openCommitments > 0 ? ` · ${item.openCommitments} öppna uppföljningar` : ""}`}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Milstolpar" title="Programaktivitet" />
        <ol className="mt-5 space-y-4">
          {engagement.milestones.map((milestone) => (
            <li key={milestone.id} className="flex gap-4">
              <span
                aria-hidden="true"
                className={`mt-[0.45rem] h-2 w-2 shrink-0 rounded-full ${
                  milestone.status === "genomford"
                    ? "bg-[#92753a]"
                    : milestone.status === "pagaende"
                      ? "bg-zinc-500"
                      : "border border-zinc-300 bg-white"
                }`}
              />
              <span className="min-w-0">
                <span className="block text-[0.9375rem] leading-snug text-zinc-800">
                  {milestone.label}
                </span>
                <span className="mt-1 block text-[0.8125rem] text-zinc-500">
                  {formatDate(milestone.date)} · {milestoneStatusLabel[milestone.status]}
                </span>
              </span>
            </li>
          ))}
        </ol>
        {engagement.nextReview ? (
          <p className="mt-6 rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3.5 text-[0.875rem] leading-relaxed text-zinc-600">
            Nästa programgenomgång: {engagement.nextReview.label} ·{" "}
            {formatDate(engagement.nextReview.date)}
          </p>
        ) : null}
      </Panel>

      <Panel>
        <PanelHeading label="Dokument" title="Material på uppdragsnivå" />
        <div className="mt-4">
          {overview.documents.length === 0 ? (
            <EmptyState>Inga dokument registrerade.</EmptyState>
          ) : (
            overview.documents.map((document, index) => (
              <div key={document.id}>
                {index > 0 ? <Divider /> : null}
                <div className="px-3 py-3.5 -mx-3">
                  <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">
                    {document.title}
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">
                    {document.description}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] text-zinc-400">
                    {document.kind} · {formatDate(document.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      <AiAskPanel
        contextType="organisation"
        contextId={engagement.id}
        title={`Fråga om ${organisation.name}`}
        scopeNote="Endast detta uppdrag och endast data tillåten på organisationsnivå. Individuella reflektioner, insikter och coachanteckningar ingår aldrig."
        suggestions={[
          {
            label: "Sessioner framåt",
            question: "Vilka deltagare har sessioner den närmaste månaden?",
          },
          { label: "Aktiviteter som väntar", question: "Vilka aktiviteter väntar?" },
          { label: "Genomförande", question: "Hur ser programmets genomförande ut?" },
          {
            label: "Inför nästa genomgång",
            question: "Vad behöver förberedas inför nästa programgenomgång?",
          },
          {
            label: "Öppna uppföljningar",
            question: "Vilka deltagare har öppna uppföljningar?",
          },
        ]}
        placeholder="Fråga om deltagare, sessioner, programstatus, milstolpar eller dokument…"
      />

      <Panel>
        <PanelHeading label="Rapport" title="Programöversikt" />
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          För uppdragsgivaren. Endast data tillåten på organisationsnivå.
        </p>
        <Link
          href={`/portal/uppdrag/${engagement.id}/programoversikt`}
          className={`mt-5 ${portalOutlineButtonClass} min-h-11 px-6 py-3 text-sm`}
        >
          Öppna programöversikt
        </Link>
      </Panel>

      <Panel>
        <PanelHeading label="Sekretess" title="Rapporteringsprinciper" />
        <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
          {engagement.sponsorReporting}
        </p>
      </Panel>
    </div>
  );
}
