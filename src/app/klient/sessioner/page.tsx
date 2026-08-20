import { notFound } from "next/navigation";
import { Body, Card, CardTitle, Empty, Label, Muted } from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { getClientPerspective, getCoach } from "@/lib/portal/repository";
import { formatDate, formatWeekdayDate } from "@/lib/portal/format";

export default async function ClientSessionsPage() {
  const session = await readClientSession();
  if (!session) return null;

  const view = await getClientPerspective(getCoach().id, session.clientId);
  if (!view) notFound();

  const past = [...view.completedSessions].reverse();

  return (
    <div className="space-y-6">
      <header className="pb-1">
        <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
          Mina sessioner
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          {past.length} genomförda sedan {formatDate(view.client.startedAt)}
        </p>
      </header>

      {view.upcomingSession ? (
        <Card>
          <Label>Nästa session</Label>
          <CardTitle>
            {formatWeekdayDate(view.upcomingSession.date)} kl. {view.upcomingSession.time}
          </CardTitle>
          <div className="mt-2">
            <Muted>{view.upcomingSession.location}</Muted>
          </div>
          <div className="mt-5 rounded-xl bg-[var(--klient-text-block-bg)] p-4">
            <Label>Fokus</Label>
            <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
              {view.upcomingSession.clientFocus}
            </p>
          </div>
        </Card>
      ) : null}

      {past.map((item) => (
        <Card key={item.id}>
          <Label>Session {item.number}</Label>
          <CardTitle>{item.clientFocus}</CardTitle>
          <div className="mt-2">
            <Muted>{formatDate(item.date)}</Muted>
          </div>

          {item.summary ? (
            <div className="mt-5 space-y-5">
              <div>
                <Label>Egna insikter</Label>
                <ul className="mt-2.5 space-y-2">
                  {item.summary.insights.map((insight) => (
                    <li
                      key={insight}
                      className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400"
                      />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-[#ece7dc] pt-5">
                <Label>Vad blev tydligare</Label>
                <div className="mt-2.5">
                  <Body>{item.summary.awareness}</Body>
                </div>
              </div>
              <div className="border-t border-[#ece7dc] pt-5">
                <Label>Åtaganden</Label>
                <ul className="mt-2.5 space-y-2">
                  {item.summary.commitments.map((commitment) => (
                    <li
                      key={commitment}
                      className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400"
                      />
                      <span>{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <Empty>Sammanfattning inte delad ännu.</Empty>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
