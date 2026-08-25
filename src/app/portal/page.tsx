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
import { AnalyticsBento, ClientOverview } from "@/components/portal/dashboard-analytics";
import StartMeetingPanel from "@/components/portal/start-meeting-panel";
import { PageHeading } from "@/components/portal/ui";

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

  const allClients = listClients(session.coachId, state, repositoryData);

  const meetableClients = allClients
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

  // Single active-client population used consistently across the dashboard.
  const totalActiveClients = allClients.length;
  const todayDate = new Date(today);

  const clientsWithNextSession = allClients.filter((client) =>
    repositoryData.sessions.some(
      (s) => s.clientId === client.id && s.status === "kommande" && new Date(s.date) > todayDate
    )
  ).length;

  const clientsNeedingPlanning = allClients.filter(
    (client) =>
      !repositoryData.sessions.some(
        (s) => s.clientId === client.id && s.status === "kommande" && new Date(s.date) > todayDate
      )
  ).length;

  return (
    <div className="portal-dashboard min-w-0 max-w-full overflow-x-clip">
      <PageHeading
        title="Översikt"
        lead={`${totalActiveClients} aktiva klienter · ${week.sessions} sessioner nästa 7 dagar`}
      />

      <div className="mt-5">
        <AnalyticsBento
          allSessions={repositoryData.sessions}
          allCommitments={repositoryData.commitments}
          allClients={allClients}
          totalActiveClients={totalActiveClients}
          clientsWithNextSession={clientsWithNextSession}
          clientsNeedingPlanning={clientsNeedingPlanning}
          pendingBookingsCount={pendingBookingsCount}
          today={today}
        />
      </div>

      {bookingRequests.length > 0 && (
        <div className="mt-5">
          <DashboardBookingRequests bookingRequests={bookingRequests} />
        </div>
      )}

      <div className="mt-3 mb-1">
        <StartMeetingPanel clients={meetableClients} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-5">
        <div className="lg:col-span-5">
          <TodayAgendaSection items={operations.today} today={today} />
        </div>

        <div className="lg:col-span-7">
          <RequiresActionSection items={operations.requiresAction} today={today} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-5">
        <div className="lg:col-span-5">
          <UpcomingSection items={operations.calendar} />
        </div>

        <div className="lg:col-span-7">
          <ClientOverview
            allClients={allClients}
            allSessions={repositoryData.sessions}
            allCommitments={repositoryData.commitments}
            today={today}
          />
        </div>
      </div>

      {data.clientActivity.length > 0 && (
        <div className="mt-5">
          <RecentActivitySection items={data.clientActivity} />
        </div>
      )}
    </div>
  );
}
