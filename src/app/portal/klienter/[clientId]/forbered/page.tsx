import Link from "next/link";
import { notFound } from "next/navigation";
import AiPreparePanel from "@/components/portal/ai-prepare-panel";
import { readSession } from "@/lib/portal/session";
import { getClientDossier } from "@/lib/portal/repository";
import { formatDate, formatWeekdayDate, relativeDayLabel, todayIso } from "@/lib/portal/format";
import { Panel, PanelHeading, QuoteBlock, SectionLabel, Tag } from "@/components/portal/ui";

export default async function PrepareSessionPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await readSession();
  if (!session) return null;

  const dossier = getClientDossier(session.coachId, clientId);
  if (!dossier) notFound();

  const { client, upcomingSession, lastSession } = dossier;
  const firstName = client.name.split(" ")[0];
  const today = todayIso();

  const nextSessionLabel = upcomingSession
    ? `Session ${upcomingSession.number}, ${formatWeekdayDate(upcomingSession.date)} kl. ${upcomingSession.time}.`
    : "Ingen session är bokad ännu.";

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
        >
          ← {client.name}
        </Link>
        <div className="mt-4">
          <SectionLabel>Förbered session</SectionLabel>
        </div>
        <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2rem]">
          Inför samtalet med {firstName}
        </h1>
        {upcomingSession ? (
          <p className="mt-3.5 text-[1rem] leading-[1.7] text-zinc-600">
            {formatWeekdayDate(upcomingSession.date)} kl. {upcomingSession.time} ·{" "}
            {relativeDayLabel(upcomingSession.date, today)} · {upcomingSession.location}
          </p>
        ) : null}
      </div>

      {upcomingSession ? (
        <Panel>
          <PanelHeading label="Klientens förberedelse" title="Vad klienten har skickat inför sessionen" />
          <div className="mt-5 space-y-5">
            <div>
              <SectionLabel>Vad vill du fokusera på idag?</SectionLabel>
              <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {upcomingSession.clientFocus}
              </p>
            </div>
            <div className="border-t border-zinc-200/70 pt-5">
              <SectionLabel>Vad skulle göra det här samtalet värdefullt för dig?</SectionLabel>
              <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {upcomingSession.desiredOutcome}
              </p>
            </div>
          </div>
        </Panel>
      ) : null}

      {lastSession?.summary ? (
        <Panel>
          <PanelHeading
            label="Föregående session"
            title={`Session ${lastSession.number} · ${formatDate(lastSession.date)}`}
          />
          <div className="mt-5 space-y-4">
            <div>
              <SectionLabel>Fokus</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {lastSession.summary.focus}
              </p>
            </div>
            <div className="border-t border-zinc-200/70 pt-4">
              <SectionLabel>Att följa upp</SectionLabel>
              <ul className="mt-2.5 space-y-2">
                {lastSession.summary.followUp.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                    <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      ) : null}

      {dossier.openCommitments.length > 0 ? (
        <Panel>
          <PanelHeading label="Uppföljning" title="Åtaganden som inte är avslutade" />
          <div className="mt-5 space-y-4">
            {dossier.openCommitments.map((commitment) => (
              <div key={commitment.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.9375rem] leading-[1.6] text-zinc-800">{commitment.text}</p>
                  <p className="mt-1 text-[0.75rem] text-zinc-400">{commitment.dueLabel}</p>
                </div>
                <Tag tone={commitment.status === "pagar" ? "progress" : "open"}>
                  {commitment.status === "pagar" ? "Pågår" : "Öppet"}
                </Tag>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {dossier.reflections[0] ? (
        <Panel>
          <PanelHeading label="Senaste reflektionen" title={dossier.reflections[0].prompt} />
          <div className="mt-5">
            <QuoteBlock source={`${firstName}, ${formatDate(dossier.reflections[0].date)}`}>
              {dossier.reflections[0].text}
            </QuoteBlock>
          </div>
        </Panel>
      ) : null}

      <AiPreparePanel
        clientId={client.id}
        clientFirstName={firstName}
        nextSessionLabel={nextSessionLabel}
      />
    </div>
  );
}
