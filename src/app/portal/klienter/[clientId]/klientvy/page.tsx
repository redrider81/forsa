import Link from "next/link";
import { notFound } from "next/navigation";
import { readSession } from "@/lib/portal/session";
import { getClientPerspective } from "@/lib/portal/repository";
import { commitmentStatusLabel, formatDate, formatWeekdayDate } from "@/lib/portal/format";
import {
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  QuoteBlock,
  SectionLabel,
  Tag,
} from "@/components/portal/ui";

export default async function ClientViewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await readSession();
  if (!session) return null;

  const view = getClientPerspective(session.coachId, clientId);
  if (!view) notFound();

  const { client, goal } = view;
  const firstName = client.name.split(" ")[0];
  const completed = view.sessions.filter((item) => item.status === "genomford");

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/portal/klienter/${client.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
        >
          ← {client.name}
        </Link>

        <div
          className="mt-5 rounded-2xl border border-[#92753a]/20 bg-[#92753a]/6 px-4 py-3.5"
          role="note"
        >
          <p className="text-[0.8125rem] leading-relaxed text-[#7d6432]">
            Du ser portalen som {firstName} ser den. Dina privata anteckningar och allt som inte är
            godkänt visas inte här.
          </p>
        </div>

        <div className="mt-6">
          <SectionLabel>Min utveckling</SectionLabel>
        </div>
        <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2rem]">
          {goal.headline}
        </h1>
      </div>

      <Panel>
        <PanelHeading label="Mitt utvecklingsmål" title="Så formulerade jag det" />
        <div className="mt-5">
          <QuoteBlock source={`Mina egna ord, ${formatDate(client.agreement.agreedAt)}`}>
            {goal.clientWording}
          </QuoteBlock>
        </div>
        <div className="mt-6 border-t border-zinc-200/80 pt-5">
          <SectionLabel>Vad som gör målet uppnått</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {goal.successCriteria.map((criterion) => (
              <li key={criterion} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
                <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {view.upcomingSession ? (
        <Panel>
          <PanelHeading label="Nästa session" title={`Session ${view.upcomingSession.number}`} />
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-zinc-600">
            {formatWeekdayDate(view.upcomingSession.date)} kl. {view.upcomingSession.time} ·{" "}
            {view.upcomingSession.location}
          </p>
          <div className="mt-5 space-y-4 rounded-xl bg-[#faf9f7] p-4">
            <div>
              <SectionLabel>Mitt fokus</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {view.upcomingSession.clientFocus}
              </p>
            </div>
            <div className="border-t border-zinc-200/70 pt-4">
              <SectionLabel>Vad jag vill få ut av samtalet</SectionLabel>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
                {view.upcomingSession.desiredOutcome}
              </p>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeading label="Mina reflektioner" title="Det jag har skrivit" />
        <div className="mt-5 space-y-6">
          {view.reflections.length === 0 ? (
            <EmptyState>Du har inte skrivit några reflektioner ännu.</EmptyState>
          ) : (
            view.reflections.map((reflection) => (
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
        <PanelHeading label="Mina åtaganden" title="Det jag har bestämt mig för" />
        <div className="mt-5 space-y-5">
          {view.commitments.map((commitment) => (
            <article key={commitment.id} className="border-b border-zinc-200/70 pb-5 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
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
              <p className="mt-2 text-[0.75rem] text-zinc-400">{commitment.dueLabel}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Mina sessioner" title={`${completed.length} genomförda samtal`} />
        <div className="mt-4">
          {completed.map((item, index) => (
            <div key={item.id}>
              {index > 0 ? <Divider /> : null}
              <div className="-mx-3 px-3 py-3.5">
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
                    Sammanfattningen är inte delad ännu.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Material" title="Mina dokument" />
        <div className="mt-4">
          {view.documents.map((document, index) => (
            <div key={document.id}>
              {index > 0 ? <Divider /> : null}
              <div className="-mx-3 px-3 py-3.5">
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
          ))}
        </div>
      </Panel>
    </div>
  );
}
