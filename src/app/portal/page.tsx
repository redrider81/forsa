import Link from "next/link";
import { readCoachSession } from "@/lib/portal/session";
import { getDashboardData, getOperationsOverview } from "@/lib/portal/repository";
import { formatDate, formatWeekdayDate, todayIso } from "@/lib/portal/format";
import {
  CompactCalendar,
  MetricGrid,
  OperationsRow,
} from "@/components/portal/operations";
import {
  Avatar,
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  RowLink,
} from "@/components/portal/ui";

export default async function PortalOverviewPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const today = todayIso();
  const [operations, data] = await Promise.all([
    getOperationsOverview(session.coachId, today),
    getDashboardData(session.coachId, today),
  ]);

  const { week } = operations;

  return (
    <div className="space-y-8">
      <header className="pb-1">
        <h1 className="text-[1.6rem] font-medium leading-[1.2] tracking-tight text-zinc-900 md:text-[1.9rem]">
          Översikt
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          {formatWeekdayDate(today)} · {week.activeClients} klienter · {week.activeEngagements} uppdrag
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-8">
      <div className="min-w-0 space-y-8 lg:col-span-7">
      <Panel>
        <PanelHeading
          label="Dagens agenda"
          title={operations.today.length === 1 ? "1 insats" : `${operations.today.length} insatser`}
        />
        <div className="mt-4">
          {operations.today.length === 0 ? (
            <EmptyState>Inga insatser i dag.</EmptyState>
          ) : (
            operations.today.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <Divider /> : null}
                <OperationsRow item={item} />
              </div>
            ))
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeading
          label="Kräver åtgärd"
          title={
            operations.requiresAction.length === 1
              ? "1 punkt"
              : `${operations.requiresAction.length} punkter`
          }
        />
        <div className="mt-4">
          {operations.requiresAction.length === 0 ? (
            <EmptyState>Inga öppna punkter.</EmptyState>
          ) : (
            operations.requiresAction.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <Divider /> : null}
                <OperationsRow item={item} showDate />
              </div>
            ))
          )}
        </div>
      </Panel>

      </div>

      <div className="min-w-0 space-y-8 lg:col-span-5">
      <Panel>
        <PanelHeading label="Veckostatus" title="Sju dagar framåt" />
        <div className="mt-5">
          <MetricGrid
            columns={2}
            metrics={[
              { label: "Coachingsamtal", value: String(week.sessions) },
              {
                label: "Förberedelser",
                value: String(week.preparationsReceived),
                note: "mottagna",
              },
              { label: "Uppföljningar", value: String(week.followUpsRequired), note: "öppna" },
              {
                label: "Genomgångar",
                value: String(week.programmeReviews),
                note: "program, 21 dgr",
              },
            ]}
          />
        </div>
        <div className="mt-6 border-t border-zinc-200/80 pt-4">
          <MetricGrid
            columns={2}
            metrics={[
              { label: "Genomförda", value: String(week.completedThisPeriod), note: "sessioner totalt" },
              { label: "Uppdrag", value: String(week.activeEngagements), note: "aktiva" },
              { label: "Klienter", value: String(week.activeClients), note: "aktiva" },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeading
          label="Kommande"
          title="Planerade insatser"
          action={
            <Link
              href="/portal/kalender"
              className="text-[0.75rem] text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900"
            >
              Kalender
            </Link>
          }
        />
        <div className="mt-4">
          {operations.calendar.length === 0 ? (
            <EmptyState>Inget planerat.</EmptyState>
          ) : (
            <CompactCalendar items={operations.calendar.slice(0, 6)} />
          )}
        </div>
      </Panel>

      {data.clientActivity.length > 0 ? (
        <Panel>
          <PanelHeading label="Inkommet" title="Sedan senaste inloggning" />
          <div className="mt-4">
            {data.clientActivity.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <Divider /> : null}
                <RowLink
                  href={`/portal/klienter/${item.clientId}`}
                  leading={<Avatar initials={item.clientInitials} />}
                  multiline
                  title={item.label}
                  subtitle={item.detail}
                  meta={item.at ? formatDate(item.at, false) : undefined}
                />
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      </div>
      </div>
    </div>
  );
}
