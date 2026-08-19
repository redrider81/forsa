import Link from "next/link";
import { notFound } from "next/navigation";
import { readCoachSession } from "@/lib/portal/session";
import { getClientDossier } from "@/lib/portal/repository";
import { commitmentStatusLabel, formatDate } from "@/lib/portal/format";
import { Panel, PanelHeading, QuoteBlock, SectionLabel, Tag } from "@/components/portal/ui";

export default async function DevelopmentReportPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await readCoachSession();
  if (!session) return null;

  const dossier = await getClientDossier(session.coachId, clientId);
  if (!dossier) notFound();

  const { client, completedSessions, insights, commitments, openCommitments } = dossier;
  const done = commitments.filter((item) => item.status === "genomfort");

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
        >
          {client.name}
        </Link>
        <div className="mt-4">
          <SectionLabel>Rapport · coach och klient</SectionLabel>
        </div>
        <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2rem]">
          Individuell utvecklingsöversikt
        </h1>
        <p className="mt-3.5 text-[1rem] leading-[1.7] text-zinc-600">
          {client.name}, {client.role}. Perioden {formatDate(client.startedAt)} till i dag.
        </p>
      </div>

      <Panel>
        <PanelHeading label="Ursprungligt mål" title={client.goal.headline} />
        <div className="mt-5">
          <QuoteBlock source="Klientens egna ord vid start">{client.goal.clientWording}</QuoteBlock>
        </div>
        <p className="mt-5 text-[0.9375rem] leading-[1.7] text-zinc-700">{client.goal.baseline}</p>
      </Panel>

      <Panel>
        <PanelHeading label="Omfattning" title="Genomfört arbete" />
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          {[
            { term: "Sessioner", value: String(completedSessions.length) },
            { term: "Reflektioner", value: String(dossier.reflections.length) },
            { term: "Åtaganden", value: String(commitments.length) },
            { term: "Genomförda", value: String(done.length) },
          ].map((item) => (
            <div key={item.term}>
              <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">{item.term}</dt>
              <dd className="mt-1.5 text-[1.5rem] font-medium leading-none tracking-tight text-zinc-900">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {dossier.reflections.length > 0 ? (
        <Panel>
          <PanelHeading label="Reflektioner" title="Klientens egna formuleringar" />
          <div className="mt-5 space-y-6">
            {dossier.reflections.slice(0, 3).map((reflection) => (
              <article key={reflection.id}>
                <p className="text-[0.75rem] uppercase tracking-[0.1em] text-zinc-400">
                  {formatDate(reflection.date)}
                </p>
                <div className="mt-3">
                  <QuoteBlock>{reflection.text}</QuoteBlock>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      ) : null}

      {insights.length > 0 ? (
        <Panel>
          <PanelHeading label="Observerad utveckling" title="Insikter över tid" />
          <ol className="mt-5 space-y-4">
            {[...insights].reverse().map((insight) => (
              <li key={insight.id} className="flex gap-4">
                <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#92753a]" />
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] leading-[1.7] text-zinc-700">
                    ”{insight.text}”
                  </span>
                  <span className="mt-1 block text-[0.75rem] text-zinc-400">
                    {formatDate(insight.date)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeading label="Åtaganden" title="Klientens åtaganden" />
        <div className="mt-5 space-y-4">
          {commitments.map((commitment) => (
            <div key={commitment.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.9375rem] leading-[1.6] text-zinc-800">{commitment.text}</p>
                <p className="mt-1 text-[0.75rem] text-zinc-400">{formatDate(commitment.date)}</p>
              </div>
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
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Nästa steg" title="Kvarstående fokus" />
        <div className="mt-5 space-y-3">
          {openCommitments.length === 0 ? (
            <p className="text-[0.9375rem] leading-[1.7] text-zinc-700">
              Inga öppna åtaganden. Fokus inför fortsättningen sätts vid nästa session.
            </p>
          ) : (
            openCommitments.map((commitment) => (
              <p key={commitment.id} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                <span>{commitment.text}</span>
              </p>
            ))
          )}
        </div>
        {dossier.upcomingSession ? (
          <p className="mt-5 rounded-xl bg-[#faf9f7] px-4 py-3.5 text-[0.875rem] leading-relaxed text-zinc-600">
            Nästa session {formatDate(dossier.upcomingSession.date)}: {dossier.upcomingSession.clientFocus}
          </p>
        ) : null}
      </Panel>

      <p className="px-1 text-[0.75rem] leading-relaxed text-zinc-400">
        För coach och klient. Coachens arbetsanteckningar ingår inte och innehållet delas inte med
        uppdragsgivaren.
      </p>
    </div>
  );
}
