import { readCoachSession } from "@/lib/portal/session";
import { readDemoState } from "@/lib/portal/store/demo-store";
import {
  fetchPortalRepositoryData,
  getDashboardData,
  getOperationsOverview,
  listClients,
  listSessions,
} from "@/lib/portal/repository";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import {
  ExecutiveSummaryBand,
  RecentActivitySection,
  TodayAgendaSection,
  UpcomingSection,
  WeekStatusModule,
} from "@/components/portal/dashboard-sections";
import { RequiresActionSection } from "@/components/portal/requires-action-section";
import StartMeetingPanel from "@/components/portal/start-meeting-panel";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function PortalOverviewPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const today = todayIso();
  const [operations, data, state, repositoryData] = await Promise.all([
    getOperationsOverview(session.coachId, today),
    getDashboardData(session.coachId, today),
    readDemoState(),
    fetchPortalRepositoryData(),
  ]);

  const { week } = operations;

  const meetableClients = listClients(session.coachId, state, repositoryData)
    .map((client) => ({
      id: client.id,
      name: client.name,
      sessions: listSessions(session.coachId, client.id, state, repositoryData)
        .filter((item) => item.status === "kommande")
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .map((item) => ({ id: item.id, number: item.number, date: item.date, time: item.time })),
    }))
    .filter((client) => client.sessions.length > 0);

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

      <TodayAgendaSection items={operations.today} today={today} />

      <StartMeetingPanel clients={meetableClients} />

      <RequiresActionSection items={operations.requiresAction} today={today} />

      <UpcomingSection items={operations.calendar} />

      <WeekStatusModule week={week} />

      <RecentActivitySection items={data.clientActivity} />
    </div>
  );
}
