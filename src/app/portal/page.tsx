import { readCoachSession } from "@/lib/portal/session";
import { getDashboardData, getOperationsOverview } from "@/lib/portal/repository";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import {
  ExecutiveSummaryBand,
  RecentActivitySection,
  TodayAgendaSection,
  UpcomingSection,
  WeekStatusModule,
} from "@/components/portal/dashboard-sections";
import { RequiresActionSection } from "@/components/portal/requires-action-section";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

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
    <div className={`${portalPageStackClass} portal-dashboard min-w-0 max-w-full overflow-x-clip`}>
      <PageHeading
        title="Översikt"
        lead={`${formatWeekdayDate(today)} · ${week.activeClients} klienter · ${week.activeEngagements} uppdrag`}
      />

      <ExecutiveSummaryBand
        todayCount={operations.today.length}
        actionCount={operations.requiresAction.length}
        weekSessions={week.sessions}
        activeClients={week.activeClients}
        activeEngagements={week.activeEngagements}
      />

      <TodayAgendaSection items={operations.today} />

      <RequiresActionSection items={operations.requiresAction} today={today} />

      <UpcomingSection items={operations.calendar} />

      <WeekStatusModule week={week} />

      <RecentActivitySection items={data.clientActivity} />
    </div>
  );
}
