import Link from "next/link";
import type { OperationsItem, OperationsOverview } from "@/lib/portal/repository";
import { formatShortDate, formatWeekdayDate } from "@/lib/portal/format";
import { ActionRow, StatusTag } from "@/components/portal/operations";
import {
  Divider,
  Panel,
  portalQuietLinkClass,
  PortalSectionHeader,
  RowLink,
  Avatar,
} from "@/components/portal/ui";
import {
  TodayAgendaMeetingActions,
  type MeetableClient,
} from "@/components/portal/today-agenda-meeting-actions";

const UPCOMING_PREVIEW = 4;
const ACTIVITY_PREVIEW = 3;

type SummaryProps = {
  todayCount: number;
  actionCount: number;
  weekSessions: number;
  activeClients: number;
  pendingBookings: number;
};

export function ExecutiveSummaryBand({
  todayCount,
  actionCount,
  weekSessions,
  activeClients,
  pendingBookings,
}: SummaryProps) {
  const items = [
    { label: "Idag", value: String(todayCount), note: "insatser" },
    { label: "Kräver åtgärd", value: String(actionCount), note: "öppna punkter" },
    { label: "Nästa 7 dagar", value: String(weekSessions), note: "coachingsamtal" },
    { label: "Aktiva klienter", value: String(activeClients), note: "" },
    { label: "Väntar på svar", value: String(pendingBookings), note: "" },
  ];

  return (
    <section
      aria-label="Operativ sammanfattning"
      className="overflow-hidden rounded-2xl border border-[var(--klient-border-soft)] bg-white shadow-[var(--klient-shadow-soft)]"
    >
      <dl className="grid grid-cols-2 gap-px bg-[var(--klient-border-muted)] max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 bg-white px-4 py-4 text-center sm:px-5 md:px-6 md:py-5">
            <dt className="text-[0.8125rem] font-medium text-zinc-500">{item.label}</dt>
            <dd className="mt-1.5 text-[1.625rem] font-medium leading-none tabular-nums tracking-tight text-zinc-900 sm:text-[1.75rem] md:text-[2rem]">
              {item.value}
            </dd>
            {item.note ? (
              <p className="mt-1 text-[0.8125rem] text-zinc-400">{item.note}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

export function TodayAgendaSection({
  items,
  today,
  meetableClients = [],
}: {
  items: OperationsItem[];
  today: string;
  meetableClients?: MeetableClient[];
}) {
  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Idag
          </p>
          <p className="mt-1 text-[0.9375rem] font-medium text-zinc-800">
            Ingen planerad insats idag
          </p>
        </div>
        <Link href="/portal/kalender" className={portalQuietLinkClass}>
          Visa kalender →
        </Link>
      </section>
    );
  }

  return (
    <Panel>
      <PortalSectionHeader
        label="Idag"
        title="Dagens agenda"
        context={
          items.length === 1 ? "1 insats planerad" : `${items.length} insatser planerade`
        }
      />
      <div className="mt-5">
        {items.map((item, index) => {
          const isCoachingSession = item.kind === "Coachingsamtal";
          const sessionId = isCoachingSession ? item.id.replace("op-", "") : null;

          return (
            <div key={item.id}>
              {index > 0 ? <Divider /> : null}
              <ActionRow item={item} today={today} />
            </div>
          );
        })}
        {(() => {
          const firstCoachingSession = items.find((item) => item.kind === "Coachingsamtal");
          const sessionId = firstCoachingSession?.id.replace("op-", "");
          if (!sessionId) return null;
          return (
            <TodayAgendaMeetingActions sessionId={sessionId} clients={meetableClients} />
          );
        })()}
      </div>
    </Panel>
  );
}

export function WeekStatusModule({ week }: { week: OperationsOverview["week"] }) {
  const primary = [
    { label: "Coachingsamtal", value: String(week.sessions) },
    { label: "Förberedelser", value: String(week.preparationsReceived), note: "mottagna" },
    { label: "Uppföljningar", value: String(week.followUpsRequired), note: "öppna" },
    { label: "Genomgångar", value: String(week.programmeReviews), note: "program" },
  ];

  const portfolio = [
    { label: "Genomförda", value: String(week.completedThisPeriod), note: "sessioner totalt" },
    { label: "Uppdrag", value: String(week.activeEngagements), note: "aktiva" },
    { label: "Klienter", value: String(week.activeClients), note: "aktiva" },
  ];

  return (
    <Panel>
      <PortalSectionHeader label="Veckan" title="Sju dagar framåt" />
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
        {primary.map((metric) => (
          <div key={metric.label} className="text-center">
            <dt className="text-[0.8125rem] font-medium text-zinc-500">{metric.label}</dt>
            <dd className="mt-1.5 text-[1.625rem] font-medium leading-none tabular-nums text-zinc-900 lg:text-[1.75rem]">
              {metric.value}
            </dd>
            {metric.note ? (
              <p className="mt-1 text-[0.8125rem] text-zinc-400">{metric.note}</p>
            ) : null}
          </div>
        ))}
      </dl>
      <div className="mt-6 border-t border-[var(--klient-border-muted)] pt-5 pl-4 min-[420px]:pl-0">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-zinc-900">
          Verksamhetsöversikt
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:mt-3 sm:gap-3">
          {portfolio.map((metric) => (
            <div key={metric.label} className="text-left min-[420px]:text-center">
              <dt className="text-[0.6875rem] uppercase tracking-[0.08em] text-zinc-400">
                {metric.label}
              </dt>
              <dd className="mt-1 text-[1.125rem] font-medium tabular-nums text-zinc-800">
                {metric.value}
              </dd>
              {metric.note ? (
                <p className="mt-0.5 text-[0.6875rem] text-zinc-400">{metric.note}</p>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  );
}

export function UpcomingSection({ items }: { items: OperationsItem[] }) {
  const upcoming = items.slice(0, UPCOMING_PREVIEW);

  return (
    <Panel>
      <PortalSectionHeader label="Kommande" title="Nästa insatser" />
      <div className="mt-3">
        {upcoming.length === 0 ? (
          <p className="text-[0.9375rem] text-zinc-600">Inget planerat inom perioden.</p>
        ) : (
          upcoming.map((item, index) => (
            <div key={item.id}>
              {index > 0 ? <Divider /> : null}
              <Link
                href={item.subjectHref}
                className="group -mx-3 grid min-w-0 grid-cols-1 gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--klient-text-block-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-6"
              >
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-semibold leading-snug text-zinc-900">
                    {item.time ? `${item.time} · ` : null}
                    {item.subject}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-zinc-600">
                    {item.context}
                    <span className="text-zinc-400"> · </span>
                    {formatWeekdayDate(item.date)}
                  </span>
                </span>
                <span className="inline-flex max-w-full md:justify-end md:pl-1">
                  <StatusTag status={item.status} />
                </span>
              </Link>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 border-t border-[var(--klient-border-muted)] pt-3">
        <Link href="/portal/kalender" className={portalQuietLinkClass}>
          Visa hela kalendern →
        </Link>
      </div>
    </Panel>
  );
}

type ActivityItem = {
  id: string;
  clientId: string;
  clientInitials: string;
  label: string;
  detail: string;
  at?: string;
};

export function RecentActivitySection({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <Panel>
      <PortalSectionHeader label="Inkommet" title="Sedan senaste inloggning" />
      <div className="mt-3">
        {items.slice(0, ACTIVITY_PREVIEW).map((item, index) => (
          <div key={item.id}>
            {index > 0 ? <Divider /> : null}
            <RowLink
              href={`/portal/klienter/${item.clientId}`}
              leading={<Avatar initials={item.clientInitials} size="sm" />}
              multiline
              title={item.label}
              subtitle={item.detail}
              meta={item.at ? formatShortDate(item.at) : undefined}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}
