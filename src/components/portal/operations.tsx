import Link from "next/link";
import type { OperationsItem, OperationsStatus } from "@/lib/portal/repository";
import { actionMetaLine } from "@/lib/portal/operations-priority";
import { formatShortDate, formatWeekdayDate } from "@/lib/portal/format";
import { cvbStatusBadgeClass, getOperationsStatusPresentation } from "@/lib/portal/status-tones";

export function StatusTag({ status }: { status: OperationsStatus }) {
  const { label, toneClass } = getOperationsStatusPresentation(status);
  return (
    <span className={`${cvbStatusBadgeClass} ${toneClass}`}>
      <span className="min-w-0 break-words sm:break-normal">{label}</span>
    </span>
  );
}

function mobileScheduleLabel(item: OperationsItem, showDate: boolean, variant: "default" | "priority") {
  if (variant === "priority" && item.date) {
    return item.time ? `${item.time} · ${formatShortDate(item.date)}` : formatShortDate(item.date);
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
  const isPriority = variant === "priority" && Boolean(today);
  const meta = isPriority
    ? actionMetaLine(item, today!, { priority: true })
    : today
      ? actionMetaLine(item, today, { priority: false })
      : showDate && item.date
        ? `${item.kind} · ${formatShortDate(item.date)}`
        : item.kind;

  const mobileSchedule = mobileScheduleLabel(item, showDate, variant);
  const showLeftDate = isPriority ? Boolean(item.date) : showDate || isPriority;

  return (
    <Link
      href={item.subjectHref}
      className="group -mx-3 grid min-w-0 grid-cols-1 gap-2 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-[var(--klient-text-block-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-start sm:gap-x-3 lg:grid-cols-[4.5rem_minmax(0,1fr)_auto] lg:gap-x-4"
    >
      <span className="min-w-0 sm:pt-0.5">
        {mobileSchedule ? (
          <span className="mb-1 block text-[0.8125rem] font-medium tabular-nums text-zinc-500 sm:hidden">
            {mobileSchedule}
          </span>
        ) : null}
        <span className="hidden sm:block">
          {item.time && !isPriority ? (
            <span className="block text-[0.8125rem] font-medium tabular-nums text-zinc-900">
              {item.time}
            </span>
          ) : null}
          {showLeftDate && item.date ? (
            <span
              className={`block tabular-nums text-zinc-500 ${
                item.time && !isPriority
                  ? "mt-0.5 text-[0.75rem]"
                  : "text-[0.8125rem] font-medium text-zinc-600"
              }`}
            >
              {formatShortDate(item.date)}
            </span>
          ) : item.time && !isPriority ? null : (
            <span className="block text-[0.8125rem] font-medium tabular-nums text-zinc-400">—</span>
          )}
        </span>
      </span>

      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-semibold leading-snug text-zinc-900 sm:text-base">
          {item.subject}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-zinc-600">
          {item.context}
        </span>
        {meta ? (
          <span className="mt-1.5 block text-[0.8125rem] leading-snug text-zinc-500">{meta}</span>
        ) : null}
        <span className="mt-2 inline-flex max-w-full lg:hidden">
          <StatusTag status={item.status} />
        </span>
      </span>

      <span className="hidden min-w-0 justify-end self-start pt-0.5 lg:flex">
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
          <dt className="break-words text-[0.8125rem] font-medium text-zinc-500">{metric.label}</dt>
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
