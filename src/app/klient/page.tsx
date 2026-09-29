import { notFound } from "next/navigation";
import CommitmentList from "@/components/klient/commitment-list";
import DevelopmentOverview from "@/components/klient/development-overview";
import ReflectionComposer from "@/components/klient/reflection-composer";
import {
  BentoCard,
  BentoDivider,
  BentoDocCue,
  BentoEmpty,
  BentoFieldLabel,
  BentoLabel,
  BentoPrimaryLink,
  BentoQuietLink,
  BentoQuote,
  BentoSerif,
  BentoTitle,
} from "@/components/klient/bento";
import { SharingBadge } from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { buildClientPerspective, fetchPortalRepositoryData } from "@/lib/portal/repository";
import { materialCategoryLabel } from "@/lib/portal/material-labels";
import { formatDate, formatWeekdayDate, relativeDayLabel, todayIso } from "@/lib/portal/format";

export default async function ClientOverviewPage() {
  const session = await readClientSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const view = buildClientPerspective(data.coach.id, session.clientId, undefined, undefined, data);
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

  const recentSessions = [...view.completedSessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      number: item.number,
      date: item.date,
      clientFocus: item.clientFocus,
    }));

  // Befintliga fält, ingen ny rekommendationslogik: material som Carolina har
  // delat eller som klienten själv kopplat till nästa session.
  const relevantMaterials = view.materials
    .filter((item) => item.source === "coach_shared" || item.linkType === "next_session")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  const direction = (
    <BentoCard
      tone="strategic"
      padding="spacious"
      reveal={1}
      lift
      aria-labelledby="goal-heading"
      className={`flex flex-col ${view.upcomingSession ? "lg:col-span-4" : "lg:col-span-12"}`}
    >
      <BentoTitle id="goal-heading">Min riktning</BentoTitle>

      <p className="mt-6 font-serif text-[1.3125rem] font-medium leading-[1.4] tracking-[-0.015em] text-stone-900 md:text-[1.5rem] md:leading-[1.38]">
        {view.goal.headline}
      </p>

      <BentoQuote
        className="mt-auto pt-8"
        source={`Mina egna ord, ${formatDate(view.client.agreement.agreedAt)}`}
      >
        {view.goal.clientWording}
      </BentoQuote>
    </BentoCard>
  );

  return (
    /**
     * Ett enda 12-kolumnsraster för hela översikten. Modulerna spänner över
     * det i stället för att varje rad hittar på egna fr-proportioner — alla
     * kortkanter landar därför på 33 % eller 66 %.
     * `items-start` låter korten få sin egen höjd; ingen modul sträcks ut och
     * fylls med tomrum för att matcha en högre granne.
     */
    <div className="klient-overview grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12">
      <header className="klient-reveal lg:col-span-12">
        <h1 className="sr-only">{view.client.name}</h1>
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-[1rem] font-medium tracking-[-0.01em] text-stone-900 md:text-[1.0625rem]">
            {view.client.name}
          </span>
          <span aria-hidden="true" className="text-stone-300">
            ·
          </span>
          <span className="text-[0.8125rem] leading-relaxed text-stone-600 md:text-[0.875rem]">
            {view.organisation.name}
          </span>
        </p>
      </header>

      {view.upcomingSession ? (
        <BentoCard
          padding="spacious"
          reveal={0}
          lift
          aria-labelledby="next-session-heading"
          className="flex flex-col lg:col-span-8"
        >
          <BentoLabel tone="gold">Nästa session</BentoLabel>

          <BentoSerif id="next-session-heading" size="large" className="mt-3.5">
            {formatWeekdayDate(view.upcomingSession.date)}
          </BentoSerif>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[0.875rem] tabular-nums text-stone-600">
              {view.upcomingSession.time}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-[var(--klient-border-muted)]" />
            <span className="text-[0.875rem] text-stone-600">{view.upcomingSession.location}</span>
            <span className="inline-flex items-center rounded-full border border-[var(--klient-accent-gold-line)] bg-[var(--klient-accent-gold-tint)] px-2.5 py-[0.1875rem] text-[0.75rem] font-medium tracking-[0.01em] text-[var(--klient-accent-gold-muted)]">
              {relativeDayLabel(view.upcomingSession.date, today)}
            </span>
          </div>

          <div className="klient-inset mt-7 px-5 py-5 md:px-6 md:py-6">
            <BentoFieldLabel>Fokus inför sessionen</BentoFieldLabel>
            <p className="klient-rule mt-3 pl-4 font-serif text-[1.0625rem] leading-[1.7] text-stone-700 md:text-[1.125rem]">
              {view.upcomingSession.clientFocus}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3.5 pt-8 sm:flex-row sm:items-center sm:gap-5">
            <BentoPrimaryLink href="/klient/infor-nasta-samtal">
              {view.prep ? "Uppdatera förberedelse" : "Förbered session"}
            </BentoPrimaryLink>

            {view.prep ? (
              <p className="text-[0.8125rem] leading-relaxed text-[var(--klient-accent-gold-muted)]">
                Förberedelse sparad och delad med Carolina.
              </p>
            ) : null}
          </div>

          {view.nextSessionMaterialCount > 0 ? (
            <>
              <BentoDivider className="mt-8" />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <p className="text-[0.875rem] leading-relaxed text-stone-600">
                  {view.nextSessionMaterialCount}{" "}
                  {view.nextSessionMaterialCount === 1 ? "material kopplat" : "material kopplade"}{" "}
                  till nästa session.
                </p>
                <BentoQuietLink href="/klient/material">Visa material</BentoQuietLink>
              </div>
            </>
          ) : null}
        </BentoCard>
      ) : null}

      {direction}

      <BentoCard
        id="aktuellt-fokus"
        padding="spacious"
        reveal={2}
        aria-labelledby="commitments-heading"
        className="scroll-mt-24 lg:col-span-12"
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
      </BentoCard>

      <BentoCard
        tone="reflection"
        padding="spacious"
        reveal={3}
        lift
        aria-labelledby="reflection-zone-heading"
        className="flex flex-col lg:col-span-7"
      >
        <h2 id="reflection-zone-heading" className="sr-only">
          Reflektion
        </h2>
        <ReflectionComposer variant="overview" embedded />

        <div className="klient-inset mt-auto px-5 py-5 md:px-6 md:py-6">
          <BentoFieldLabel>Senaste reflektion</BentoFieldLabel>

          <div className="mt-4">
            {latestReflection ? (
              <BentoQuote clamp tone="quiet" source={formatDate(latestReflection.date)}>
                {latestReflection.text}
              </BentoQuote>
            ) : (
              <BentoEmpty>Ingen reflektion registrerad ännu.</BentoEmpty>
            )}
          </div>

          <div className="mt-5">
            <BentoQuietLink href="/klient/reflektioner">Visa alla reflektioner</BentoQuietLink>
          </div>
        </div>
      </BentoCard>

      <BentoCard
        tone="neutral"
        padding="spacious"
        reveal={4}
        lift
        aria-labelledby="latest-session-heading"
        className="flex flex-col lg:col-span-5"
      >
        <BentoTitle id="latest-session-heading">Från senaste sessionen</BentoTitle>
        <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-stone-600">
          Sammanfattning delad efter coaching, inte din egen reflektion.
        </p>

        <div className="mt-7 flex-1">
          {latestSummary?.summary ? (
            <>
              <p className="text-[0.8125rem] text-stone-600">
                <span className="font-medium text-[var(--klient-accent-gold-muted)]">
                  Session {latestSummary.number}
                </span>
                <span aria-hidden="true" className="px-1.5 text-stone-300">
                  ·
                </span>
                {formatDate(latestSummary.date)}
              </p>
              <p className="mt-5 text-[1rem] leading-[1.8] text-stone-700 md:text-[1.0625rem]">
                {latestSummary.summary.awareness}
              </p>
            </>
          ) : (
            <BentoEmpty>Ingen sammanfattning delad ännu.</BentoEmpty>
          )}
        </div>

        <BentoDivider className="mt-8" />
        <div className="pt-5">
          <BentoQuietLink href="/klient/sessioner">Visa alla sessioner</BentoQuietLink>
        </div>
      </BentoCard>

      <BentoCard
        tone="neutral"
        padding="spacious"
        reveal={5}
        lift
        aria-labelledby="material-heading"
        className="flex flex-col lg:col-span-4"
      >
        <BentoTitle id="material-heading">Relevant material</BentoTitle>

        <div className="mt-6 flex-1">
          {relevantMaterials.length > 0 ? (
            <ul className="-mx-2 space-y-1.5">
              {relevantMaterials.map((item) => (
                <li key={item.id} className="klient-row px-2 py-3">
                  <div className="flex items-start gap-3">
                    <BentoDocCue
                      variant={
                        item.source === "coach_shared"
                          ? "shared"
                          : item.source === "client_note"
                            ? "note"
                            : "file"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.875rem] font-medium leading-snug text-stone-900">
                        {item.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[0.8125rem] text-stone-500">
                          {materialCategoryLabel[item.category]}
                        </span>
                        <SharingBadge material={item} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : view.nextSessionMaterialCount > 0 ? (
            <p className="text-[0.875rem] leading-relaxed text-stone-600">
              {view.nextSessionMaterialCount}{" "}
              {view.nextSessionMaterialCount === 1 ? "material kopplat" : "material kopplade"} till
              nästa session.
            </p>
          ) : (
            <BentoEmpty>Inget material kopplat just nu.</BentoEmpty>
          )}
        </div>

        <BentoDivider className="mt-8" />
        <div className="pt-5">
          <BentoQuietLink href="/klient/material">Visa allt material</BentoQuietLink>
        </div>
      </BentoCard>

      <BentoCard
        tone="quiet"
        padding="spacious"
        reveal={6}
        aria-labelledby="development-overview-heading"
        className="flex flex-col lg:col-span-8"
      >
        <DevelopmentOverview
          completedSessions={completedSessionsCount}
          activeCommitments={activeCommitmentsCount}
          completedCommitments={completedCommitmentsCount}
          reflections={reflectionsCount}
          startedAt={view.client.startedAt}
          recentSessions={recentSessions}
        />
      </BentoCard>
    </div>
  );
}
