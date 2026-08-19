import Link from "next/link";
import type { OperationsItem, OperationsStatus } from "@/lib/portal/repository";
import { formatShortDate, formatWeekdayDate } from "@/lib/portal/format";

/** Statusens vikt styr färgen. Neutralt som standard, guld när något krävs. */
const NEUTRAL = "border-zinc-300 bg-white text-zinc-700";
const ATTENTION = "border-[#92753a]/25 bg-[#92753a]/8 text-[#7d6432]";
const SETTLED = "border-emerald-700/18 bg-emerald-700/7 text-emerald-800";

const statusTone: Record<OperationsStatus, string> = {
  "Förberedelse mottagen": SETTLED,
  "Förberedelse saknas": NEUTRAL,
  "Session planerad": "border-zinc-200 bg-zinc-50 text-zinc-600",
  "Session idag": ATTENTION,
  "Session genomförd": SETTLED,
  "Uppföljning krävs": ATTENTION,
  "Underlag mottaget": SETTLED,
  "Underlag saknas": NEUTRAL,
  Programgenomgång: NEUTRAL,
  "Sammanfattning för granskning": ATTENTION,
  "Åtagande uppdaterat": NEUTRAL,
  "Ny reflektion": NEUTRAL,
};

export function StatusTag({ status }: { status: OperationsStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium ${statusTone[status]}`}
    >
      {status}
    </span>
  );
}

/** En rad i agendan: tid, klient/uppdrag, typ av insats, status. */
export function OperationsRow({
  item,
  showDate = false,
  detailed = false,
}: {
  item: OperationsItem;
  showDate?: boolean;
  /** Visar åtgärdstext på bredare skärm där utrymmet finns. */
  detailed?: boolean;
}) {
  return (
    <Link
      href={item.subjectHref}
      className="group -mx-3 flex gap-4 rounded-xl px-3 py-3.5 transition-colors duration-200 hover:bg-[#f4f2ed]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <span className="w-[3.75rem] shrink-0 pt-0.5">
        <span className="block text-[0.8125rem] font-medium tabular-nums text-zinc-900">
          {item.time || "—"}
        </span>
        {showDate ? (
          <span className="mt-0.5 block text-[0.6875rem] tabular-nums text-zinc-400">
            {formatShortDate(item.date)}
          </span>
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[0.9375rem] font-medium leading-snug text-zinc-900">
          {item.subject}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] leading-snug text-zinc-500">
          {item.context}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-zinc-400">
            {item.kind}
          </span>
          <StatusTag status={item.status} />
          {detailed && item.kind === "Coachingsamtal" ? (
            <span className="hidden text-[0.8125rem] font-medium text-zinc-700 underline underline-offset-4 transition-colors group-hover:text-zinc-900 lg:inline">
              Förbered session
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

/** Kompakt kalender grupperad per dag. */
export function CompactCalendar({
  items,
  detailed = false,
}: {
  items: OperationsItem[];
  detailed?: boolean;
}) {
  const days = new Map<string, OperationsItem[]>();
  for (const item of items) {
    const bucket = days.get(item.date) ?? [];
    bucket.push(item);
    days.set(item.date, bucket);
  }

  return (
    <div className="divide-y divide-zinc-200/80">
      {[...days.entries()].map(([date, dayItems]) => (
        <div key={date} className="py-4 first:pt-0 last:pb-0">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-zinc-400">
            {formatWeekdayDate(date)}
          </p>
          <div className="mt-1.5">
            {dayItems.map((item) => (
              <OperationsRow key={item.id} item={item} detailed={detailed} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricGrid({
  metrics,
  columns = 4,
}: {
  metrics: Array<{ label: string; value: string; note?: string }>;
  /** 2 för smala kolumner på desktop, 4 för full bredd. */
  columns?: 2 | 4;
}) {
  return (
    <dl
      className={`grid gap-x-4 gap-y-5 ${
        columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {metrics.map((metric) => (
        <div key={metric.label}>
          <dt className="text-[0.6875rem] uppercase leading-tight tracking-[0.08em] text-zinc-400 break-words">
            {metric.label}
          </dt>
          <dd className="mt-1.5 text-[1.5rem] font-medium leading-none tabular-nums tracking-tight text-zinc-900">
            {metric.value}
          </dd>
          {metric.note ? (
            <p className="mt-1 text-[0.6875rem] leading-tight text-zinc-400">{metric.note}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
