import type { OperationsItem } from "@/lib/portal/repository";
import { formatShortDate } from "@/lib/portal/format";

function dayOffset(date: string, today: string): number {
  const a = new Date(`${date}T00:00:00Z`).getTime();
  const b = new Date(`${today}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86_400_000);
}

/** Lägre poäng = högre prioritet. Deterministisk sortering för åtgärdslistan. */
export function actionPriorityScore(item: OperationsItem, today: string): number {
  const offset = dayOffset(item.date, today);
  const overdue = offset < 0;

  if (item.status === "Uppföljning krävs") {
    return overdue ? -1_000 + offset : 100 + offset;
  }
  if (item.status === "Session idag") {
    return 150;
  }
  if (item.status === "Förberedelse saknas") {
    if (offset >= 0 && offset <= 7) return 200 + offset;
    return 350 + Math.max(offset, 0);
  }
  if (item.status === "Underlag mottaget") {
    return 180 + Math.max(offset, 0);
  }
  if (item.status === "Sammanfattning för granskning") {
    return 220 + Math.max(offset, 0);
  }
  if (item.kind === "Programgenomgång") {
    return 400 + Math.max(offset, 0);
  }
  return 500 + Math.max(offset, 0);
}

export function sortActionItems(items: OperationsItem[], today: string): OperationsItem[] {
  return [...items].sort((a, b) => {
    const score = actionPriorityScore(a, today) - actionPriorityScore(b, today);
    if (score !== 0) return score;
    return `${a.date}${a.time}${a.id}`.localeCompare(`${b.date}${b.time}${b.id}`);
  });
}

export function actionMetaLine(item: OperationsItem, today: string): string {
  const offset = dayOffset(item.date, today);
  const kind = item.kind.toUpperCase();

  if (item.status === "Uppföljning krävs" && offset < 0) {
    return `${kind} · Försenad sedan ${formatShortDate(item.date)}`;
  }
  if (item.status === "Förberedelse saknas" && offset >= 0 && offset <= 7) {
    return offset === 0
      ? `${kind} · Session idag`
      : `${kind} · Inom ${offset} ${offset === 1 ? "dag" : "dagar"}`;
  }
  if (item.status === "Session idag") {
    return `${kind} · Idag`;
  }
  if (item.date) {
    return `${kind} · ${formatShortDate(item.date)}`;
  }
  return kind;
}
