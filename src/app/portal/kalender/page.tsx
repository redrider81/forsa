import Link from "next/link";
import BookingPanel from "@/components/portal/booking-panel";
import CalendarSubnav from "@/components/portal/calendar-subnav";
import PublicBookingRequestsPanel from "@/components/portal/public-booking-requests-panel";
import { readCoachSession } from "@/lib/portal/session";
import { readDemoState } from "@/lib/portal/store/demo-store";
import { fetchPortalRepositoryData, getOperationsOverview, listClients } from "@/lib/portal/repository";
import { listPendingCoachBookings } from "@/lib/portal/booking";
import { listAcceptedPublicBookingRequests, listPendingPublicBookingRequests } from "@/lib/portal/availability";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { CompactCalendar, MetricGrid } from "@/components/portal/operations";
import { EmptyState, PageHeading, Panel, PanelHeading, portalPageStackClass, portalSegmentActiveClass, portalSegmentClass, portalSegmentInactiveClass } from "@/components/portal/ui";

const ranges = {
  idag: { label: "Idag", days: 1, title: "Idag" },
  vecka: { label: "Vecka", days: 7, title: "Sju dagar framåt" },
  manad: { label: "Månad", days: 31, title: "Trettio dagar framåt" },
} as const;

type RangeKey = keyof typeof ranges;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await readCoachSession();
  if (!session) return null;

  const { period } = await searchParams;
  const active: RangeKey = period === "idag" || period === "manad" ? period : "vecka";

  const today = todayIso();
  const operations = await getOperationsOverview(session.coachId, today, ranges[active].days);

  const state = await readDemoState();
  const data = await fetchPortalRepositoryData();
  const clients = listClients(session.coachId, state, data).map((client) => ({
    id: client.id,
    name: client.name,
  }));
  const bookings = await listPendingCoachBookings();
  const publicRequests = await listPendingPublicBookingRequests();
  const acceptedPublicRequests = await listAcceptedPublicBookingRequests();

  return (
    <div className={portalPageStackClass}>
      <div>
        <PageHeading title="Planerade insatser" />
        <p className="mt-3.5 text-[0.875rem] leading-relaxed text-zinc-500">
          {formatWeekdayDate(today)}
        </p>
        <div className="mt-5">
          <CalendarSubnav active="kalender" />
        </div>
        <nav aria-label="Period" className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(ranges) as RangeKey[]).map((key) => (
            <Link
              key={key}
              href={key === "vecka" ? "/portal/kalender" : `/portal/kalender?period=${key}`}
              aria-current={key === active ? "page" : undefined}
              className={`${portalSegmentClass} ${
                key === active ? portalSegmentActiveClass : portalSegmentInactiveClass
              }`}
            >
              {ranges[key].label}
            </Link>
          ))}
        </nav>
      </div>

      <Panel>
        <PanelHeading label="Period" title={ranges[active].title} />
        <div className="mt-5">
          <MetricGrid
            columns={2}
            metrics={[
              { label: "Coachingsamtal", value: String(operations.week.sessions), note: "sju dagar" },
              { label: "Genomgångar", value: String(operations.week.programmeReviews), note: "program" },
              { label: "Förberedelser", value: String(operations.week.preparationsReceived), note: "mottagna" },
              { label: "Uppföljningar", value: String(operations.week.followUpsRequired), note: "öppna" },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Schema" title="Dag för dag" />
        <div className="mt-4">
          {operations.calendar.length === 0 ? (
            <EmptyState>Inget planerat i perioden.</EmptyState>
          ) : (
            <CompactCalendar items={operations.calendar} detailed />
          )}
        </div>
      </Panel>

      <PublicBookingRequestsPanel pending={publicRequests} accepted={acceptedPublicRequests} />

      <BookingPanel clients={clients} bookings={bookings} />
    </div>
  );
}
