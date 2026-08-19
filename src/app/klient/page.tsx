import Link from "next/link";
import { notFound } from "next/navigation";
import CommitmentList from "@/components/klient/commitment-list";
import ReflectionComposer from "@/components/klient/reflection-composer";
import { Body, Card, CardTitle, Empty, Label, Muted, OwnWords } from "@/components/klient/klient-ui";
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

  return (
    <div className="space-y-6">
      <header className="pb-1">
        <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
          Min utveckling
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          {view.client.name} · {view.organisation.name}
        </p>
      </header>

      {view.upcomingSession ? (
        <Card>
          <Label>Nästa session</Label>
          <CardTitle>
            {formatWeekdayDate(view.upcomingSession.date)} kl. {view.upcomingSession.time}
          </CardTitle>
          <div className="mt-2">
            <Muted>
              {relativeDayLabel(view.upcomingSession.date, today)} · {view.upcomingSession.location}
            </Muted>
          </div>

          <div className="mt-5 rounded-xl bg-[#fbfaf7] p-4">
            <Label>Fokus inför nästa session</Label>
            <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
              {view.upcomingSession.clientFocus}
            </p>
          </div>

          <Link
            href="/klient/infor-nasta-samtal"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {view.prep ? "Uppdatera förberedelse" : "Förbered session"}
          </Link>

          {view.prep ? (
            <p className="mt-3.5 text-[0.8125rem] leading-relaxed text-[#7d6432]">
              Förberedelse sparad och delad med Carolina.
            </p>
          ) : null}
        </Card>
      ) : null}

      <ReflectionComposer />

      <CommitmentList
        commitments={view.commitments.map((item) => ({
          id: item.id,
          text: item.text,
          dueLabel: item.dueLabel,
          status: item.status,
          clientNote: item.clientNote,
        }))}
      />

      <Card>
        <Label>Senaste reflektion</Label>
        <CardTitle>Mina egna ord</CardTitle>
        <div className="mt-5">
          {latestReflection ? (
            <OwnWords source={formatDate(latestReflection.date)}>{latestReflection.text}</OwnWords>
          ) : (
            <Empty>Ingen reflektion registrerad.</Empty>
          )}
        </div>
        <Link
          href="/klient/reflektioner"
          className="mt-5 inline-block text-[0.875rem] text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900"
        >
          Visa alla reflektioner
        </Link>
      </Card>

      <Card>
        <Label>Uppföljning</Label>
        <CardTitle>Senaste sammanfattning</CardTitle>
        <div className="mt-5">
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
        <Link
          href="/klient/sessioner"
          className="mt-5 inline-block text-[0.875rem] text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900"
        >
          Visa alla sessioner
        </Link>
      </Card>

      <Card>
        <Label>Mitt utvecklingsmål</Label>
        <CardTitle>{view.goal.headline}</CardTitle>
        <div className="mt-5">
          <OwnWords source={`Mina egna ord, ${formatDate(view.client.agreement.agreedAt)}`}>
            {view.goal.clientWording}
          </OwnWords>
        </div>
      </Card>
    </div>
  );
}
