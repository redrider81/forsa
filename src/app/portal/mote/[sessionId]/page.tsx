import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingWorkspace from "@/components/portal/meeting-workspace";
import { readCoachSession } from "@/lib/portal/session";
import { buildClientDossier, fetchPortalRepositoryData } from "@/lib/portal/repository";
import { formatWeekdayDate } from "@/lib/portal/format";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const coachingSession = data.sessions.find((item) => item.id === sessionId);
  if (!coachingSession) notFound();

  const dossier = buildClientDossier(session.coachId, coachingSession.clientId, undefined, undefined, data);
  if (!dossier) notFound();

  const { client, engagement, organisation } = dossier;
  const exploreContext = dossier.prep?.followUp || dossier.prep?.changed || "";
  const contextLabel = [organisation.name, engagement.title].filter(Boolean).join(" · ");

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          Tillbaka till portalen
        </Link>
        <div className="mt-4">
          <PageHeading
            label="Aktivt möte"
            title={client.name}
            lead={`Session ${coachingSession.number} · ${formatWeekdayDate(coachingSession.date)} kl. ${coachingSession.time}${
              contextLabel ? ` · ${contextLabel}` : ""
            }`}
          />
        </div>
      </div>

      <MeetingWorkspace
        sessionId={coachingSession.id}
        initialClientFocus={coachingSession.clientFocus}
        initialDesiredOutcome={coachingSession.desiredOutcome}
        exploreContext={exploreContext}
        goal={client.goal}
        openCommitments={dossier.openCommitments}
        initialCoachNotes={coachingSession.coachNotes ?? ""}
      />
    </div>
  );
}
