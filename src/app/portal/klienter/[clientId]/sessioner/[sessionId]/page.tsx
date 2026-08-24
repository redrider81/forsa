import Link from "next/link";
import { notFound } from "next/navigation";
import SessionWorkspace from "@/components/portal/session-workspace";
import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, getClientDossier, getSession } from "@/lib/portal/repository";
import { formatWeekdayDate, formatDate, relativeDayLabel, todayIso } from "@/lib/portal/format";
import { Panel, PanelHeading, portalPageStackClass, SectionLabel, Tag } from "@/components/portal/ui";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ clientId: string; sessionId: string }>;
}) {
  const { clientId, sessionId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const dossier = await getClientDossier(session.coachId, clientId);
  const coachingSession = getSession(
    session.coachId,
    clientId,
    sessionId,
    undefined,
    await fetchPortalRepositoryData(),
  );
  if (!dossier || !coachingSession) notFound();

  const { client } = dossier;
  const firstName = client.name.split(" ")[0];
  const today = todayIso();
  const summary = coachingSession.summary;

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          {client.name}
        </Link>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <SectionLabel>{client.name} · {client.role}</SectionLabel>
            <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
              Session {String(coachingSession.number).padStart(2, "0")}
            </h1>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-zinc-600">
              {formatWeekdayDate(coachingSession.date)} kl. {coachingSession.time} ·{" "}
              {relativeDayLabel(coachingSession.date, today)}
              <span className="block text-[0.8125rem] text-zinc-500">
                {coachingSession.location} · {coachingSession.durationMinutes} minuter
              </span>
            </p>
          </div>
          <Tag tone={coachingSession.status === "kommande" ? "open" : "neutral"}>
            {coachingSession.status === "kommande" ? "Kommande" : "Genomförd"}
          </Tag>
        </div>
      </div>

      <Panel>
        <SectionLabel>Övergripande utvecklingsmål</SectionLabel>
        <p className="mt-2.5 text-[1.05rem] leading-[1.6] tracking-tight text-zinc-900">
          {client.goal.headline}
        </p>
      </Panel>

      <Panel>
        <PanelHeading label="Fokus för sessionen" title="Klientens fokus" />
        <p className="mt-3.5 text-[1rem] leading-[1.7] text-zinc-700">{coachingSession.clientFocus}</p>
        <div className="mt-5 border-t border-zinc-200/80 pt-5">
          <SectionLabel>Önskat resultat</SectionLabel>
          <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
            {coachingSession.desiredOutcome}
          </p>
        </div>
      </Panel>

      {summary ? (
        <Panel>
          <PanelHeading
            label={summary.approved ? "Godkänd" : "Utkast"}
            title="Sessionssammanfattning"
          />
          <div className="mt-5 space-y-5">
            <div>
              <SectionLabel>Fokus för sessionen</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">{summary.focus}</p>
            </div>
            {summary.insights.length > 0 ? (
              <div className="border-t border-zinc-200/70 pt-5">
                <SectionLabel>Klientens viktigaste insikter</SectionLabel>
                <ul className="mt-2.5 space-y-2">
                  {summary.insights.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                      <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="border-t border-zinc-200/70 pt-5">
              <SectionLabel>Ökad medvetenhet</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">{summary.awareness}</p>
            </div>
            {summary.commitments.length > 0 ? (
              <div className="border-t border-zinc-200/70 pt-5">
                <SectionLabel>Klientens åtaganden</SectionLabel>
                <ul className="mt-2.5 space-y-2">
                  {summary.commitments.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                      <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {summary.followUp.length > 0 ? (
              <div className="border-t border-zinc-200/70 pt-5">
                <SectionLabel>Att följa upp</SectionLabel>
                <ul className="mt-2.5 space-y-2">
                  {summary.followUp.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                      <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="border-t border-zinc-200/70 pt-5">
              <SectionLabel>Möjligt nästa fokus</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {summary.possibleNextFocus}
              </p>
            </div>
          </div>
          {summary.approvedAt ? (
            <p className="mt-6 border-t border-zinc-200/80 pt-4 text-[0.75rem] text-zinc-400">
              Godkänd av coachen {formatDate(summary.approvedAt)} och delad med {firstName}.
            </p>
          ) : null}
        </Panel>
      ) : null}

      {coachingSession.coachNotes ? (
        <Panel>
          <PanelHeading
            label="Coach privat"
            title="Arbetsanteckningar"
            action={<Tag tone="private">Endast du</Tag>}
          />
          <p className="mt-4 text-[0.9375rem] leading-[1.75] text-zinc-700">
            {coachingSession.coachNotes}
          </p>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-zinc-400">
            Delas aldrig med klienten eller uppdragsgivaren.
          </p>
        </Panel>
      ) : null}

      <SessionWorkspace
        clientId={client.id}
        sessionId={coachingSession.id}
        clientName={client.name}
        clientFirstName={firstName}
      />
    </div>
  );
}
