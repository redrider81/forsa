import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Body,
  Chapter,
  Empty,
  InnerFocus,
  Muted,
  OwnWords,
  QuoteBlock,
  SectionTitle,
  SerifHeading,
  StatusBadge,
  ZoneTag,
} from "@/components/klient/klient-ui";
import { readCoachSession } from "@/lib/portal/session";
import { getClientPerspective } from "@/lib/portal/repository";
import { formatDate, formatWeekdayDate, relativeDayLabel, todayIso } from "@/lib/portal/format";
import { portalPageStackClass } from "@/components/portal/ui";

export default async function ClientViewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const view = await getClientPerspective(session.coachId, clientId);
  if (!view) notFound();

  const { client, goal, organisation } = view;
  const firstName = client.name.split(" ")[0];
  const today = todayIso();
  const completed = view.sessions.filter((item) => item.status === "genomford");
  const latestSummary = [...completed].reverse().find((item) => item.summary);

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          {client.name}
        </Link>

        <div
          className="mt-5 rounded-2xl border border-[var(--klient-accent-gold)]/20 bg-[var(--klient-accent-gold)]/6 px-4 py-3.5"
          role="note"
        >
          <p className="text-[0.8125rem] leading-relaxed text-[var(--klient-accent-gold-muted)]">
            Klientvy. Visar exakt vad {firstName} ser. Arbetsanteckningar och ej godkänt material
            utelämnas.
          </p>
        </div>
      </div>

      <div className="space-y-8 md:space-y-10">
        <header className="max-w-prose">
          <h1 className="sr-only">{client.name}</h1>
          <span className="inline-flex items-center rounded-full border border-[var(--klient-border-muted)] bg-white px-5 py-2.5 text-[1rem] font-medium leading-relaxed text-zinc-700 shadow-[0_1px_3px_rgba(24,24,27,0.06)] md:px-6 md:py-3 md:text-[1.0625rem]">
            {client.name} · {organisation.name}
          </span>
        </header>

        {view.upcomingSession ? (
          <Chapter surface="primary" aria-labelledby="next-session-heading">
            <ZoneTag>Nästa session</ZoneTag>
            <SerifHeading id="next-session-heading">
              {formatWeekdayDate(view.upcomingSession.date)}
            </SerifHeading>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-zinc-600">
              {view.upcomingSession.time} · {view.upcomingSession.location}
            </p>
            <p className="mt-1 text-[0.8125rem] text-zinc-400">
              {relativeDayLabel(view.upcomingSession.date, today)}
            </p>
            <InnerFocus label="Fokus inför sessionen">{view.upcomingSession.clientFocus}</InnerFocus>
          </Chapter>
        ) : null}

        <Chapter surface="strategic" aria-labelledby="goal-heading" className="max-w-none">
          <ZoneTag>Utvecklingsmål</ZoneTag>
          <SectionTitle id="goal-heading">Min riktning</SectionTitle>
          <p className="mt-3 max-w-prose text-[1.0625rem] leading-[1.65] text-zinc-800 md:text-[1.125rem]">
            {goal.headline}
          </p>
          <div className="max-w-prose">
            <QuoteBlock source={`Mina egna ord, ${formatDate(client.agreement.agreedAt)}`}>
              {goal.clientWording}
            </QuoteBlock>
          </div>
          <div className="mt-6 border-t border-[var(--klient-border-muted)]/90 pt-6">
            <ZoneTag tone="muted">Framgångskriterier</ZoneTag>
            <ul className="mt-3 space-y-2.5">
              {goal.successCriteria.map((criterion) => (
                <li key={criterion} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                  <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </Chapter>

        <Chapter surface="primary" aria-labelledby="commitments-heading">
          <ZoneTag>Åtaganden</ZoneTag>
          <SectionTitle id="commitments-heading">Aktuella åtaganden</SectionTitle>
          <div className="mt-5 space-y-5">
            {view.commitments.length === 0 ? (
              <Empty>Inga åtaganden registrerade.</Empty>
            ) : (
              view.commitments.map((commitment) => (
                <article
                  key={commitment.id}
                  className="border-b border-[var(--klient-border-muted)]/70 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-5">
                    <p className="text-[0.9375rem] leading-[1.6] text-zinc-800">{commitment.text}</p>
                    <StatusBadge status={commitment.status} />
                  </div>
                  <p className="mt-2 text-[0.75rem] text-zinc-400">{commitment.dueLabel}</p>
                </article>
              ))
            )}
          </div>
        </Chapter>

        <Chapter surface="reflection" aria-labelledby="reflection-heading">
          <ZoneTag tone="muted">Reflektioner</ZoneTag>
          <SectionTitle id="reflection-heading">Dina egna ord</SectionTitle>
          <div className="mt-4 max-w-prose space-y-6">
            {view.reflections.length === 0 ? (
              <Empty>Ingen reflektion registrerad ännu.</Empty>
            ) : (
              view.reflections.map((reflection) => (
                <article key={reflection.id}>
                  <p className="text-[0.75rem] uppercase tracking-[0.1em] text-zinc-400">
                    {formatDate(reflection.date)} · {reflection.prompt}
                  </p>
                  <div className="mt-3">
                    <OwnWords>{reflection.text}</OwnWords>
                  </div>
                </article>
              ))
            )}
          </div>
        </Chapter>

        <Chapter surface="neutral" aria-labelledby="latest-session-heading" className="max-w-prose">
          <ZoneTag tone="neutral">Session</ZoneTag>
          <SectionTitle id="latest-session-heading">Från senaste sessionen</SectionTitle>
          <Muted>Sammanfattning delad efter coaching — inte din egen reflektion.</Muted>
          <div className="mt-4">
            {latestSummary?.summary ? (
              <>
                <Body>{latestSummary.summary.awareness}</Body>
                <p className="mt-3 text-[0.75rem] text-zinc-400">
                  Session {latestSummary.number} · {formatDate(latestSummary.date)}
                </p>
              </>
            ) : (
              <Empty>Ingen sammanfattning delad ännu.</Empty>
            )}
          </div>
        </Chapter>

        {completed.length > 0 ? (
          <Chapter surface="neutral" aria-labelledby="sessions-heading">
            <ZoneTag tone="neutral">Sessioner</ZoneTag>
            <SectionTitle id="sessions-heading">{completed.length} genomförda</SectionTitle>
            <div className="mt-4 space-y-4">
              {completed.map((item) => (
                <article
                  key={item.id}
                  className="border-b border-[var(--klient-border-muted)]/70 pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">
                    Session {item.number} · {item.clientFocus}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-zinc-500">{formatDate(item.date)}</p>
                  {item.summary ? (
                    <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-600">
                      {item.summary.awareness}
                    </p>
                  ) : (
                    <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-zinc-400">
                      Sammanfattning inte delad.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </Chapter>
        ) : null}

        {view.documents.length > 0 ? (
          <Chapter surface="neutral" aria-labelledby="material-heading">
            <ZoneTag tone="neutral">Material</ZoneTag>
            <SectionTitle id="material-heading">Dokument och material</SectionTitle>
            <div className="mt-4 space-y-4">
              {view.documents.map((document) => (
                <article
                  key={document.id}
                  className="border-b border-[var(--klient-border-muted)]/70 pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">
                    {document.title}
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">
                    {document.description}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] text-zinc-400">
                    {document.kind} · {formatDate(document.date)}
                  </p>
                </article>
              ))}
            </div>
          </Chapter>
        ) : null}
      </div>
    </div>
  );
}
