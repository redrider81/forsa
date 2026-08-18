import Link from "next/link";
import { readSession } from "@/lib/portal/session";
import { getCoach, getDashboardData } from "@/lib/portal/repository";
import {
  formatShortDate,
  formatWeekdayDate,
  greeting,
  relativeDayLabel,
  todayIso,
} from "@/lib/portal/format";
import {
  Avatar,
  Divider,
  EmptyState,
  MetaRow,
  Panel,
  PanelHeading,
  RowLink,
  SectionLabel,
  Tag,
} from "@/components/portal/ui";

export default async function PortalOverviewPage() {
  const session = await readSession();
  if (!session) return null;

  const coach = getCoach();
  const today = todayIso();
  const data = getDashboardData(session.coachId, today);
  const firstName = coach.name.split(" ")[0];
  const next = data.nextSession;
  const thisWeek = data.upcomingSessions.slice(0, 4);

  return (
    <div className="space-y-8">
      <header>
        <SectionLabel>Idag</SectionLabel>
        <h1 className="mt-3 text-[1.85rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.2rem]">
          {greeting(new Date().getHours())}, {firstName}
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-[1.7] text-zinc-600">
          {data.sessionsWithinWeek === 1
            ? "1 session den närmaste veckan"
            : `${data.sessionsWithinWeek} sessioner den närmaste veckan`}{" "}
          · {data.recentReflections.length} nya reflektioner ·{" "}
          {data.openCommitments.length} åtaganden att följa upp
        </p>
      </header>

      {next ? (
        <Panel>
          <SectionLabel>Nästa session</SectionLabel>
          <div className="mt-4 flex items-start gap-4">
            <Avatar initials={next.client.initials} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-[1.35rem] font-medium leading-tight tracking-tight text-zinc-900">
                {next.client.name}
              </h2>
              <p className="mt-1 text-[0.9375rem] leading-snug text-zinc-600">{next.client.role}</p>
              <MetaRow
                items={[
                  next.engagement.kindLabel,
                  `Session ${next.session.number}`,
                ]}
              />
            </div>
          </div>

          <p className="mt-5 text-[0.9375rem] leading-relaxed text-zinc-700">
            {formatWeekdayDate(next.session.date)} kl. {next.session.time} ·{" "}
            {relativeDayLabel(next.session.date, today)}
            <span className="block text-[0.8125rem] text-zinc-500">{next.session.location}</span>
          </p>

          <div className="mt-5 rounded-xl bg-[#faf9f7] p-4">
            <SectionLabel>Klientens fokus</SectionLabel>
            <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">
              {next.session.clientFocus}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href={`/portal/klienter/${next.client.id}/forbered`}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Förbered session
            </Link>
            <Link
              href={`/portal/klienter/${next.client.id}`}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-[#faf9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Öppna klienten
            </Link>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeading
          label="Framåt"
          title="Kommande sessioner"
          action={
            <span className="text-[0.75rem] text-zinc-400">
              {data.upcomingSessions.length} bokade
            </span>
          }
        />
        <div className="mt-4">
          {thisWeek.length === 0 ? (
            <EmptyState>Inga bokade sessioner just nu.</EmptyState>
          ) : (
            thisWeek.map((item, index) => (
              <div key={item.session.id}>
                {index > 0 ? <Divider /> : null}
                <RowLink
                  href={`/portal/klienter/${item.client.id}`}
                  leading={<Avatar initials={item.client.initials} />}
                  title={item.client.name}
                  subtitle={item.client.role}
                  meta={`${formatShortDate(item.session.date)} kl. ${item.session.time} · ${relativeDayLabel(item.session.date, today)}`}
                />
              </div>
            ))
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Uppdrag" title="Aktiva uppdrag" />
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Från enskild executive coaching till ledarskapsprogram med tolv deltagare.
        </p>
        <div className="mt-4 space-y-3">
          {data.engagements.map((engagement) => {
            const participants = engagement.participantIds.length;
            return (
              <Link
                key={engagement.id}
                href={`/portal/uppdrag/${engagement.id}`}
                className="block rounded-xl border border-zinc-200/80 bg-[#faf9f7] p-4 transition-[border-color,background-color] duration-200 hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.9875rem] font-medium leading-snug text-zinc-900">
                      {engagement.title}
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-snug text-zinc-500">
                      {engagement.kindLabel} · {engagement.periodLabel}
                    </p>
                  </div>
                  <Tag>{participants === 1 ? "1 deltagare" : `${participants} deltagare`}</Tag>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Att granska" title="Nya reflektioner" />
        <div className="mt-4">
          {data.recentReflections.length === 0 ? (
            <EmptyState>Inga nya reflektioner.</EmptyState>
          ) : (
            data.recentReflections.map((item, index) => (
              <div key={item.reflection.id}>
                {index > 0 ? <Divider /> : null}
                <RowLink
                  href={`/portal/klienter/${item.client.id}`}
                  leading={<Avatar initials={item.client.initials} />}
                  title={item.client.name}
                  subtitle={item.reflection.text.slice(0, 78).trim() + "…"}
                  meta={`${formatShortDate(item.reflection.date)} · ${item.reflection.prompt}`}
                />
              </div>
            ))
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Uppföljning" title="Öppna åtaganden" />
        <div className="mt-4">
          {data.openCommitments.length === 0 ? (
            <EmptyState>Alla åtaganden är följda upp.</EmptyState>
          ) : (
            data.openCommitments.map((item, index) => (
              <div key={item.commitment.id}>
                {index > 0 ? <Divider /> : null}
                <RowLink
                  href={`/portal/klienter/${item.client.id}`}
                  leading={<Avatar initials={item.client.initials} />}
                  multiline
                  title={item.commitment.text}
                  subtitle={`${item.client.name} · ${item.commitment.dueLabel}`}
                  trailing={<Tag tone="open">Öppet</Tag>}
                />
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
