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

  const allClients = listClients(session.coachId, state, repositoryData).filter(
    (client) => (client.status ?? "aktiv") === "aktiv"
  );

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
    <>
      <div aria-hidden className="portal-dashboard-bg" />
      <div className="portal-dashboard min-w-0 max-w-full overflow-x-clip">
      <div className="portal-dash-section portal-dash-section--0">
      <PageHeading
        title="Översikt"
        stats={[
          { value: totalActiveClients, label: "aktiva klienter" },
          { value: week.sessions, label: "sessioner nästa 7 dagar" },
        ]}
      />
      </div>

      <div className="mt-5 portal-dash-section portal-dash-section--1">
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
        <div className="mt-5 portal-dash-section portal-dash-section--2">
          <DashboardBookingRequests bookingRequests={bookingRequests} />
        </div>
      )}


      <div className="mt-5 grid grid-cols-1 items-start gap-4 lg:grid-cols-12 portal-dash-section portal-dash-section--3">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <TodayAgendaSection
            items={operations.today}
            today={today}
            meetableClients={meetableClients}
          />
          <UpcomingSection items={operations.calendar} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <RequiresActionSection items={operations.requiresAction} today={today} />
          <ClientOverview
            allClients={allClients}
            allSessions={repositoryData.sessions}
            allCommitments={repositoryData.commitments}
            today={today}
          />
        </div>
      </div>

      {data.clientActivity.length > 0 && (
        <div className="mt-5 portal-dash-section portal-dash-section--4">
          <RecentActivitySection items={data.clientActivity} />
        </div>
      )}
    </div>
    </>
  );
}
