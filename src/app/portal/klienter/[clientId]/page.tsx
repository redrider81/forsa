import Link from "next/link";
import { notFound } from "next/navigation";
import AiAskPanel from "@/components/portal/ai-ask-panel";
import ClientDetailNav from "@/components/portal/client-detail-nav";
import ShareMaterialPanel from "@/components/portal/share-material-panel";
import { readCoachSession } from "@/lib/portal/session";
import { getClientDossier } from "@/lib/portal/repository";
import {
  commitmentStatusLabel,
  formatDate,
  formatWeekdayDate,
  relativeDayLabel,
  todayIso,
} from "@/lib/portal/format";
import {
  AiActionLink,
  Avatar,
  DefinitionList,
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  portalOutlineButtonClass,
  portalPageStackClass,
  QuoteBlock,
  RowLink,
  SectionLabel,
  Tag,
} from "@/components/portal/ui";

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const dossier = await getClientDossier(session.coachId, clientId);
  if (!dossier) notFound();

  const { client, engagement, organisation, completedSessions, upcomingSession } = dossier;
  const firstName = client.name.split(" ")[0];
  const today = todayIso();

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link
          href="/portal/klienter"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
        >
          Klienter
        </Link>

        <div className="mt-4">
          <ClientDetailNav clientId={client.id} />
        </div>

        <div className="mt-5 flex items-start gap-4">
          <Avatar initials={client.initials} size="lg" />
          <div className="min-w-0">
            <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
              {client.name}
            </h1>
            <p className="mt-1.5 text-[0.9375rem] leading-snug text-zinc-600">{client.role}</p>
            {organisation.name ? (
              <p className="mt-1 text-[0.8125rem] leading-snug text-zinc-500">
                {organisation.name} · {organisation.sizeLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Tag>{engagement.kindLabel}</Tag>
          <Tag>{completedSessions.length} genomförda sessioner</Tag>
          <Tag tone={dossier.openCommitments.length > 0 ? "open" : "done"}>
            {dossier.openCommitments.length} åtaganden att följa upp
          </Tag>
        </div>
      </div>

      {upcomingSession ? (
        <Panel>
          <SectionLabel>Nästa session</SectionLabel>
          <h2 className="mt-2.5 text-[1.3rem] font-medium leading-[1.25] tracking-tight text-zinc-900">
            Session {upcomingSession.number}
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-zinc-600">
            {formatWeekdayDate(upcomingSession.date)} kl. {upcomingSession.time} ·{" "}
            {relativeDayLabel(upcomingSession.date, today)}
            <span className="block text-[0.8125rem] text-zinc-500">{upcomingSession.location}</span>
          </p>

          <div className="mt-5 space-y-4 rounded-xl bg-[var(--klient-text-block-bg)] p-4">
            <div>
              <SectionLabel>Klientens fokus</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {upcomingSession.clientFocus}
              </p>
            </div>
            <div className="border-t border-zinc-200/70 pt-4">
              <SectionLabel>Önskat resultat</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {upcomingSession.desiredOutcome}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <AiActionLink href={`/portal/klienter/${client.id}/forbered`} className="flex-1">
              Förbered session
            </AiActionLink>
            <Link
              href={`/portal/klienter/${client.id}/sessioner/${upcomingSession.id}`}
              className={`flex-1 ${portalOutlineButtonClass} min-h-11 px-6 py-3 text-sm`}
            >
              Öppna sessionsvy
            </Link>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeading label="Utvecklingsmål" title={client.goal.headline} />
        <div className="mt-5">
          <QuoteBlock source="Klientens egna ord vid överenskommelsen">
            {client.goal.clientWording}
          </QuoteBlock>
        </div>
        <div className="mt-6 border-t border-zinc-200/80 pt-5">
          <SectionLabel>Utgångsläge</SectionLabel>
          <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-700">{client.goal.baseline}</p>
        </div>
        <div className="mt-5">
          <SectionLabel>Framgångskriterier</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {client.goal.successCriteria.map((criterion) => (
              <li key={criterion} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Åtaganden" title="Klientens åtaganden" />
        <div className="mt-5 space-y-5">
          {dossier.commitments.length === 0 ? (
            <EmptyState>Inga åtaganden registrerade.</EmptyState>
          ) : (
            dossier.commitments.map((commitment) => (
              <article key={commitment.id} className="border-b border-zinc-200/70 pb-5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-5">
                  <p className="text-[0.9375rem] leading-[1.6] text-zinc-800">{commitment.text}</p>
                  <Tag
                    tone={
                      commitment.status === "genomfort"
                        ? "done"
                        : commitment.status === "pagar"
                          ? "progress"
                          : "open"
                    }
                  >
                    {commitmentStatusLabel[commitment.status]}
                  </Tag>
                </div>
                <p className="mt-2 text-[0.75rem] text-zinc-400">
                  {formatDate(commitment.date)} · {commitment.dueLabel}
                </p>
                {commitment.clientNote ? (
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
                    {firstName}: ”{commitment.clientNote}”
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </Panel>

      {dossier.insights.length > 0 ? (
        <Panel>
          <PanelHeading label="Insikter" title="Klientens egna formuleringar" />
          <ul className="mt-5 space-y-4">
            {dossier.insights.map((insight) => (
              <li key={insight.id}>
                <p className="text-[0.9375rem] leading-[1.7] text-zinc-700">”{insight.text}”</p>
                <p className="mt-1 text-[0.75rem] text-zinc-400">{formatDate(insight.date)}</p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeading label="Reflektion" title="Klientens reflektioner" />
        <div className="mt-5 space-y-6">
          {dossier.reflections.length === 0 ? (
            <EmptyState>Inga reflektioner registrerade.</EmptyState>
          ) : (
            dossier.reflections.map((reflection) => (
              <article key={reflection.id}>
                <p className="text-[0.75rem] uppercase tracking-[0.1em] text-zinc-400">
                  {formatDate(reflection.date)} · {reflection.prompt}
                </p>
                <div className="mt-3">
                  <QuoteBlock>{reflection.text}</QuoteBlock>
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Sessioner" title="Genomförda och planerade" />
        <div className="mt-4">
          {dossier.sessions.length === 0 ? (
            <EmptyState>Inga sessioner registrerade.</EmptyState>
          ) : (
            [...dossier.sessions].reverse().map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <Divider /> : null}
                <RowLink
                  href={`/portal/klienter/${client.id}/sessioner/${item.id}`}
                  title={`Session ${item.number} · ${item.clientFocus}`}
                  subtitle={`${formatDate(item.date)} · ${item.location}`}
                  trailing={
                    <Tag tone={item.status === "kommande" ? "open" : "neutral"}>
                      {item.status === "kommande" ? "Kommande" : "Genomförd"}
                    </Tag>
                  }
                />
              </div>
            ))
          )}
        </div>
      </Panel>

      <ShareMaterialPanel clientId={client.id} materials={dossier.materials} />

      <Panel>
        <PanelHeading label="Uppdrag" title="Dokument och material" />
        <div className="mt-4">
          {dossier.documents.map((document, index) => (
            <div key={document.id}>
              {index > 0 ? <Divider /> : null}
              <div className="-mx-3 px-3 py-3.5">
                <div className="flex items-start justify-between gap-5">
                  <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">
                    {document.title}
                  </p>
                  {document.visibility === "coach" ? <Tag tone="private">Coach privat</Tag> : null}
                </div>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">
                  {document.description}
                </p>
                <p className="mt-1.5 text-[0.75rem] text-zinc-400">
                  {document.kind} · {formatDate(document.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <AiAskPanel
        contextType="klient"
        contextId={client.id}
        emailSubject={`CVB Coaching – Underlag för ${client.name}`}
        title={`Fråga om ${firstName}`}
        scopeNote={`Endast ${firstName}. Underlag: utvecklingsmål, sessioner, reflektioner, åtaganden och dina arbetsanteckningar. Privat material når aldrig klient eller uppdragsgivare.`}
        suggestions={[
          {
            label: "Vad har förändrats?",
            question: `Vad har förändrats för ${firstName} sedan föregående session?`,
          },
          {
            label: "Öppna åtaganden",
            question: "Vilka åtaganden är fortfarande öppna och vad har vi ännu inte följt upp?",
          },
          {
            label: "Sammanfatta utvecklingen",
            question: `Sammanfatta ${firstName}s utveckling hittills.`,
          },
          {
            label: "Frågor att utforska",
            question: `Ge tre möjliga utforskande frågor inför nästa session, utifrån ${firstName}s egna formuleringar.`,
          },
        ]}
        placeholder="Fråga om klientens mål, sessioner, reflektioner, åtaganden eller utveckling…"
      />

      <Panel>
        <PanelHeading label="Överenskommelse" title="Coachningsöverenskommelse" />
        <div className="mt-5">
          <DefinitionList
            items={[
              { term: "Ingången", value: formatDate(client.agreement.agreedAt) },
              { term: "Syfte", value: client.agreement.purpose },
              { term: "Omfattning", value: client.agreement.scope },
              { term: "Form", value: client.agreement.cadence },
              { term: "Sekretess", value: client.agreement.confidentiality },
              { term: "Delning med uppdragsgivare", value: client.agreement.sponsorSharing },
              { term: "Etisk ram", value: client.agreement.ethics },
              { term: "Klientens ansvar", value: client.agreement.clientResponsibility },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Rapporter" title="Utvecklingsöversikt och klientvy" />
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Utvecklingsöversikten delas med klienten. Klientvyn visar exakt vad {firstName} ser.
        </p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href={`/portal/klienter/${client.id}/utveckling`}
            className={`flex-1 ${portalOutlineButtonClass} min-h-11 px-6 py-3 text-sm`}
          >
            Utvecklingsöversikt
          </Link>
          <Link
            href={`/portal/klienter/${client.id}/klientvy`}
            className={`flex-1 ${portalOutlineButtonClass} min-h-11 px-6 py-3 text-sm`}
          >
            Visa som klient
          </Link>
        </div>
      </Panel>
    </div>
  );
}
