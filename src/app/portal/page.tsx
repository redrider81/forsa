import { readCoachSession } from "@/lib/portal/session";
import { readDemoState } from "@/lib/portal/store/demo-store";
import {
  fetchPortalRepositoryData,
  getDashboardData,
  getOperationsOverview,
  listClients,
  listSessions,
} from "@/lib/portal/repository";
import { todayIso } from "@/lib/portal/format";
import { listPendingCoachBookings } from "@/lib/portal/booking";
import {
  RecentActivitySection,
  TodayAgendaSection,
  UpcomingSection,
} from "@/components/portal/dashboard-sections";
import { RequiresActionSection } from "@/components/portal/requires-action-section";
import DashboardBookingRequests from "@/components/portal/dashboard-booking-requests";
import { ExecutiveKPIStrip, PrimaryAnalyticsZone, ManagementAnalyticsZone, ClientOverview } from "@/components/portal/dashboard-analytics";
import StartMeetingPanel from "@/components/portal/start-meeting-panel";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function PortalOverviewPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const today = todayIso();
  const [operations, data, state, repositoryData, bookingRequests] = await Promise.all([
    getOperationsOverview(session.coachId, today),
    getDashboardData(session.coachId, today),
    readDemoState(),
    fetchPortalRepositoryData(),
    listPendingCoachBookings(),
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

  const pendingBookingsCount = bookingRequests.filter((br) => br.status === "pending").length;

  // Calculate analytics
  const last30DaysStart = new Date();
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);

  const completedLast30 = repositoryData.sessions.filter(
    (s) => s.status === "genomford" && new Date(s.date) >= last30DaysStart && new Date(s.date) <= new Date(today)
  ).length;

  const totalCommitments = repositoryData.commitments.length;
  const completedCommitments = repositoryData.commitments.filter((c) => c.status === "genomfort").length;
  const commitmentCompletedPct = totalCommitments > 0 ? Math.round((completedCommitments / totalCommitments) * 100) : 0;

  const activeClientsLast30 = new Set(
    repositoryData.sessions
      .filter((s) => new Date(s.date) >= last30DaysStart && new Date(s.date) <= new Date(today))
      .map((s) => s.clientId)
  ).size;

  const clientsWithFutureSessions = new Set(
    repositoryData.sessions.filter((s) => s.status === "kommande" && new Date(s.date) > new Date(today)).map((s) => s.clientId)
  ).size;

  return (
    <div className={`${portalPageStackClass} portal-dashboard min-w-0 max-w-full overflow-x-clip`}>
      <PageHeading
        title="Översikt"
        lead={`${week.activeClients} aktiva klienter · ${pendingBookingsCount} behöver planeras · ${week.sessions} sessioner nästa 7 dagar`}
      />

      <ExecutiveKPIStrip
        completedCount={completedLast30}
        commitmentCompletedPct={commitmentCompletedPct}
        clientsWithNextSession={clientsWithFutureSessions}
        totalActiveClients={activeClientsLast30}
        pendingBookingsCount={pendingBookingsCount}
        allSessions={repositoryData.sessions}
      />

      <PrimaryAnalyticsZone
        allSessions={repositoryData.sessions}
        activeClientsLast30={activeClientsLast30}
        clientsWithFutureSessions={clientsWithFutureSessions}
        today={today}
      />

      <TodayAgendaSection items={operations.today} today={today} />

      <StartMeetingPanel clients={meetableClients} />

      {bookingRequests.length > 0 && <DashboardBookingRequests bookingRequests={bookingRequests} />}

      <ManagementAnalyticsZone allCommitments={repositoryData.commitments} />

      <ClientOverview
        allClients={listClients(session.coachId, state, repositoryData)}
        allSessions={repositoryData.sessions}
        allCommitments={repositoryData.commitments}
        today={today}
      />

      <RequiresActionSection items={operations.requiresAction} today={today} />

      <UpcomingSection items={operations.calendar} />

      <RecentActivitySection items={data.clientActivity} />
    </div>
  );
}
