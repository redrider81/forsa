import Link from "next/link";
import type { OperationsItem, OperationsStatus } from "@/lib/portal/repository";
import { actionMetaLine } from "@/lib/portal/operations-priority";
import { formatShortDate, formatWeekdayDate } from "@/lib/portal/format";

/** Läsbara statusfärger med tydlig kontrast. */
const NEUTRAL = "border-zinc-300/90 bg-zinc-50 text-zinc-700";
const ATTENTION = "border-orange-300/90 bg-orange-100 text-orange-900";
const WARNING = "border-amber-300/90 bg-amber-100 text-amber-950";
const PROGRESS = "border-emerald-300/90 bg-emerald-100 text-emerald-900";
const SETTLED = "border-emerald-700/20 bg-emerald-700/8 text-emerald-900";
const PLANNED = "border-zinc-300/80 bg-zinc-50 text-zinc-600";

const statusTone: Record<OperationsStatus, string> = {
  "Förberedelse mottagen": SETTLED,
  "Förberedelse saknas": WARNING,
  "Session planerad": PLANNED,
  "Session idag": ATTENTION,
  "Session genomförd": SETTLED,
  "Uppföljning krävs": ATTENTION,
  "Underlag mottaget": SETTLED,
  "Underlag saknas": NEUTRAL,
  Programgenomgång: PROGRESS,
  "Sammanfattning för granskning": ATTENTION,
  "Åtagande uppdaterat": NEUTRAL,
  "Ny reflektion": NEUTRAL,
};

const statusLabel: Record<OperationsStatus, string> = {
  "Förberedelse mottagen": "Förberedelse mottagen",
  "Förberedelse saknas": "Förberedelse saknas",
  "Session planerad": "Session planerad",
  "Session idag": "Session idag",
  "Session genomförd": "Session genomförd",
  "Uppföljning krävs": "Uppföljning krävs",
  "Underlag mottaget": "Underlag mottaget",
  "Underlag saknas": "Underlag saknas",
  Programgenomgång: "Programgenomgång",
  "Sammanfattning för granskning": "Sammanfattning för granskning",
  "Åtagande uppdaterat": "Åtagande uppdaterat",
  "Ny reflektion": "Ny reflektion",
};

export function StatusTag({ status }: { status: OperationsStatus }) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-md border px-2.5 py-1 text-[0.625rem] font-semibold uppercase leading-snug tracking-[0.04em] sm:text-[0.6875rem] sm:leading-none sm:tracking-[0.05em] sm:whitespace-nowrap ${statusTone[status]}`}
    >
      <span className="min-w-0 break-words sm:break-normal">{statusLabel[status]}</span>
    </span>
  );
}

function mobileScheduleLabel(item: OperationsItem, showDate: boolean, variant: "default" | "priority") {
  if (variant === "priority" && item.date) {
    return formatShortDate(item.date);
  }
  if (item.time && showDate && item.date) {
    return `${item.time} · ${formatShortDate(item.date)}`;
  }
  if (item.time) return item.time;
  if (showDate && item.date) return formatShortDate(item.date);
  return null;
}

/** Operativ rad — används i dashboard och kalender. */
export function ActionRow({
  item,
  variant = "default",
  today,
  showDate = false,
}: {
  item: OperationsItem;
  variant?: "default" | "priority";
  today?: string;
  showDate?: boolean;
}) {
  const meta =
    variant === "priority" && today
      ? actionMetaLine(item, today)
      : `${item.kind.toUpperCase()}${showDate && item.date ? ` · ${formatShortDate(item.date)}` : ""}`;

  const mobileSchedule = mobileScheduleLabel(item, showDate, variant);

  return (
    <Link
      href={item.subjectHref}
      className="group -mx-3 grid min-w-0 grid-cols-1 gap-2 rounded-xl px-3 py-3.5 transition-colors duration-200 hover:bg-[var(--klient-text-block-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-start sm:gap-x-3 lg:grid-cols-[4.5rem_minmax(0,1fr)_auto] lg:gap-x-4"
    >
      <span className="min-w-0 sm:pt-0.5">
        {mobileSchedule ? (
          <span className="mb-1 block text-[0.75rem] font-medium tabular-nums text-zinc-500 sm:hidden">
            {mobileSchedule}
          </span>
        ) : null}
        <span className="hidden sm:block">
          <span className="block text-[0.8125rem] font-medium tabular-nums text-zinc-900">
            {item.time || "—"}
          </span>
          {(showDate || variant === "priority") && item.date ? (
            <span className="mt-0.5 block text-[0.75rem] tabular-nums text-zinc-500">
              {formatShortDate(item.date)}
            </span>
          ) : null}
        </span>
      </span>

      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-semibold leading-snug text-zinc-900 sm:text-[0.9875rem]">
          {item.subject}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-zinc-600">
          {item.context}
        </span>
        <span className="mt-2 block text-[0.75rem] font-medium uppercase tracking-[0.08em] text-zinc-500">
          {meta}
        </span>
        <span className="mt-2 inline-flex max-w-full lg:hidden">
          <StatusTag status={item.status} />
        </span>
      </span>

      <span className="hidden min-w-0 justify-end pt-0.5 lg:flex">
        <StatusTag status={item.status} />
      </span>
    </Link>
  );
}

/** @deprecated Använd ActionRow. Behålls för kalendersidan. */
export function OperationsRow({
  item,
  showDate = false,
  detailed = false,
}: {
  item: OperationsItem;
  showDate?: boolean;
  detailed?: boolean;
}) {
  return (
    <>
      <ActionRow item={item} showDate={showDate} />
      {detailed && item.kind === "Coachingsamtal" ? (
        <p className="-mt-1 px-3 pb-2 text-right text-[0.8125rem] font-medium text-zinc-600 underline underline-offset-4">
          Förbered session
        </p>
      ) : null}
    </>
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
    <div className="divide-y divide-[var(--klient-border-muted)]/80">
      {[...days.entries()].map(([date, dayItems]) => (
        <div key={date} className="py-4 first:pt-0 last:pb-0">
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {formatWeekdayDate(date)}
          </p>
          <div className="mt-1.5">
            {dayItems.map((item) => (
              <OperationsRow key={item.id} item={item} detailed={detailed} showDate />
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
  columns?: 2 | 4;
}) {
  return (
    <dl
      className={`grid gap-x-4 gap-y-5 ${
        columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-0">
          <dt className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-500 break-words">
            {metric.label}
          </dt>
          <dd className="mt-1.5 text-[1.5rem] font-medium leading-none tabular-nums tracking-tight text-zinc-900">
            {metric.value}
          </dd>
          {metric.note ? (
            <p className="mt-1 text-[0.8125rem] leading-tight text-zinc-500">{metric.note}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
