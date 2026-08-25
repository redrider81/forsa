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
        lead={`${week.activeClients} aktiva klienter · ${week.sessions} sessioner nästa 7 dagar`}
      />

      <ExecutiveKPIStrip
        completedCount={completedLast30}
        commitmentCompletedPct={commitmentCompletedPct}
        clientsWithNextSession={clientsWithFutureSessions}
        totalActiveClients={activeClientsLast30}
        pendingBookingsCount={pendingBookingsCount}
        allSessions={repositoryData.sessions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <PrimaryAnalyticsZone
            allSessions={repositoryData.sessions}
            activeClientsLast30={activeClientsLast30}
            clientsWithFutureSessions={clientsWithFutureSessions}
            today={today}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-zinc-200/80 rounded-lg p-6 bg-white">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Sessioner planerade</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-zinc-900">{clientsWithFutureSessions}</div>
                <div className="text-[0.8125rem] text-zinc-600 mt-1">av {activeClientsLast30} aktiva</div>
              </div>
              <div className="flex-1 ml-6">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="8"
                    strokeDasharray={`${(clientsWithFutureSessions / activeClientsLast30) * 283} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-sm font-bold" fill="#111827">
                    {Math.round((clientsWithFutureSessions / activeClientsLast30) * 100)}%
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <ManagementAnalyticsZone allCommitments={repositoryData.commitments} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          <TodayAgendaSection items={operations.today} today={today} />
        </div>

        <div>
          <RequiresActionSection items={operations.requiresAction} today={today} />
        </div>
      </div>

      {bookingRequests.length > 0 && (
        <div className="mt-6">
          <DashboardBookingRequests bookingRequests={bookingRequests} />
        </div>
      )}

      <StartMeetingPanel clients={meetableClients} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          <UpcomingSection items={operations.calendar} />
        </div>

        <div>
          <ClientOverview
            allClients={listClients(session.coachId, state, repositoryData)}
            allSessions={repositoryData.sessions}
            allCommitments={repositoryData.commitments}
            today={today}
          />
        </div>
      </div>

      {data.clientActivity.length > 0 && (
        <div className="mt-6">
          <RecentActivitySection items={data.clientActivity} />
        </div>
      )}
    </div>
  );
}
