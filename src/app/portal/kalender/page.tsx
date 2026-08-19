import Link from "next/link";
import { readCoachSession } from "@/lib/portal/session";
import { getOperationsOverview } from "@/lib/portal/repository";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { CompactCalendar, MetricGrid } from "@/components/portal/operations";
import { EmptyState, PageHeading, Panel, PanelHeading } from "@/components/portal/ui";

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

  return (
    <div className="space-y-7">
      <div>
        <PageHeading label="Kalender" title="Planerade insatser" />
        <p className="mt-3.5 text-[0.875rem] leading-relaxed text-zinc-500">
          {formatWeekdayDate(today)}
        </p>
        <nav aria-label="Period" className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(ranges) as RangeKey[]).map((key) => (
            <Link
              key={key}
              href={key === "vecka" ? "/portal/kalender" : `/portal/kalender?period=${key}`}
              aria-current={key === active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4] ${
                key === active
                  ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {ranges[key].label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-7 lg:grid-cols-12 lg:items-start lg:gap-x-8">
      <div className="min-w-0 lg:order-2 lg:col-span-4">
      <Panel className="lg:sticky lg:top-24">
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

      </div>

      <div className="min-w-0 lg:order-1 lg:col-span-8">
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
      </div>
      </div>
    </div>
  );
}
