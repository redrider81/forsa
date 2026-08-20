import { notFound } from "next/navigation";
import CommitmentList from "@/components/klient/commitment-list";
import DevelopmentOverview from "@/components/klient/development-overview";
import ReflectionComposer from "@/components/klient/reflection-composer";
import {
  Body,
  Chapter,
  Empty,
  InnerFocus,
  Muted,
  OwnWords,
  PrimaryButton,
  QuoteBlock,
  QuietLink,
  SectionTitle,
  SerifHeading,
  ZoneTag,
} from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { getClientPerspective, getCoach } from "@/lib/portal/repository";
import { formatDate, formatWeekdayDate, relativeDayLabel, todayIso } from "@/lib/portal/format";

export default async function ClientOverviewPage() {
  const session = await readClientSession();
  if (!session) return null;

  const view = await getClientPerspective(getCoach().id, session.clientId);
  if (!view) notFound();

  const today = todayIso();
  const latestReflection = view.reflections[0];
  const latestSummary = [...view.completedSessions].reverse().find((item) => item.summary);
  const sessionLabels = Object.fromEntries(
    view.sessions.map((item) => [item.id, `Session ${item.number}`]),
  );

  const completedSessionsCount = view.completedSessions.length;
  const activeCommitmentsCount = view.commitments.filter(
    (item) => item.status === "pagar" || item.status === "oppet",
  ).length;
  const completedCommitmentsCount = view.commitments.filter(
    (item) => item.status === "genomfort",
  ).length;
  const reflectionsCount = view.reflections.length;

  return (
    <div className="klient-overview space-y-8 md:space-y-10">
      <header className="max-w-prose">
        <h1 className="sr-only">{view.client.name}</h1>
        <span className="inline-flex items-center rounded-full border border-[var(--klient-border-muted)] bg-white px-5 py-2.5 text-[1rem] font-medium leading-relaxed text-zinc-700 shadow-[0_1px_3px_rgba(24,24,27,0.06)] md:px-6 md:py-3 md:text-[1.0625rem]">
          {view.client.name} · {view.organisation.name}
        </span>
      </header>

      <DevelopmentOverview
        completedSessions={completedSessionsCount}
        activeCommitments={activeCommitmentsCount}
        completedCommitments={completedCommitmentsCount}
        reflections={reflectionsCount}
      />

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

          <InnerFocus label="Fokus inför sessionen">
            {view.upcomingSession.clientFocus}
          </InnerFocus>

          <div className="mt-6">
            <PrimaryButton href="/klient/infor-nasta-samtal">
              {view.prep ? "Uppdatera förberedelse" : "Förbered session"}
            </PrimaryButton>
          </div>

          {view.prep ? (
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--klient-accent-gold-muted)]">
              Förberedelse sparad och delad med Carolina.
            </p>
          ) : null}

          {view.nextSessionMaterialCount > 0 ? (
            <div className="mt-5 space-y-4">
              <p className="flex items-baseline gap-3 text-[0.9375rem] font-bold leading-relaxed text-zinc-500">
                <span aria-hidden="true" className="text-[1.375rem] leading-none">
                  ·
                </span>
                <span>
                  {view.nextSessionMaterialCount}{" "}
                  {view.nextSessionMaterialCount === 1 ? "material kopplat" : "material kopplade"} till
                  nästa session.
                </span>
              </p>
              <QuietLink href="/klient/material">Visa material</QuietLink>
            </div>
          ) : null}
        </Chapter>
      ) : null}

      <Chapter surface="strategic" aria-labelledby="goal-heading" className="max-w-none">
        <ZoneTag>Utvecklingsmål</ZoneTag>
        <SectionTitle id="goal-heading">Min riktning</SectionTitle>
        <p className="mt-3 max-w-prose text-[1.0625rem] leading-[1.65] text-zinc-800 md:text-[1.125rem]">
          {view.goal.headline}
        </p>
        <div className="max-w-prose">
          <QuoteBlock source={`Mina egna ord, ${formatDate(view.client.agreement.agreedAt)}`}>
            {view.goal.clientWording}
          </QuoteBlock>
        </div>
      </Chapter>

      <Chapter
        id="aktuellt-fokus"
        surface="primary"
        aria-labelledby="commitments-heading"
        className="scroll-mt-6"
      >
        <CommitmentList
          overviewLimit={3}
          activeCount={activeCommitmentsCount}
          commitments={view.commitments.map((item) => ({
            id: item.id,
            text: item.text,
            dueLabel: item.dueLabel,
            status: item.status,
            clientNote: item.clientNote,
            completedAt: item.completedAt,
            sessionLabel: sessionLabels[item.sessionId],
          }))}
        />
      </Chapter>

      <Chapter surface="reflection" aria-labelledby="reflection-zone-heading">
        <h2 id="reflection-zone-heading" className="sr-only">
          Reflektion
        </h2>
        <ReflectionComposer variant="overview" embedded />

        <div className="mt-7 border-t border-[var(--klient-border-muted)]/90 pt-7">
          <ZoneTag tone="muted">Senaste reflektion</ZoneTag>
          <SectionTitle id="latest-reflection-heading" className="mt-2">
            Dina egna ord
          </SectionTitle>
          <div className="mt-4 max-w-prose">
            {latestReflection ? (
              <OwnWords source={formatDate(latestReflection.date)}>
                {latestReflection.text}
              </OwnWords>
            ) : (
              <Empty>Ingen reflektion registrerad ännu.</Empty>
            )}
          </div>
          <div className="mt-4">
            <QuietLink href="/klient/reflektioner">Visa alla reflektioner</QuietLink>
          </div>
        </div>
      </Chapter>

      <Chapter surface="neutral" aria-labelledby="latest-session-heading" className="max-w-prose">
        <ZoneTag tone="neutral">Session</ZoneTag>
        <SectionTitle id="latest-session-heading">Från senaste sessionen</SectionTitle>
        <Muted>
          Sammanfattning delad efter coaching — inte din egen reflektion.
        </Muted>
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
        <div className="mt-4">
          <QuietLink href="/klient/sessioner">Visa alla sessioner</QuietLink>
        </div>
      </Chapter>
    </div>
  );
}
