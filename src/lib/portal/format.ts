import type { CommitmentStatus, MilestoneStatus, SessionStatus } from "@/lib/portal/types";

const MONTHS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

const WEEKDAYS = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];

function parse(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

/** "18 augusti 2026" */
export function formatDate(iso: string, withYear = true): string {
  const date = parse(iso);
  const base = `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
  return withYear ? `${base} ${date.getUTCFullYear()}` : base;
}

/** "torsdag 19 augusti" */
export function formatWeekdayDate(iso: string): string {
  const date = parse(iso);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** "19 aug" */
export function formatShortDate(iso: string): string {
  const date = parse(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()].slice(0, 3)}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** "om 2 dagar", "idag", "i morgon", "för 3 veckor sedan" */
export function relativeDayLabel(iso: string, referenceIso = todayIso()): string {
  const diffDays = Math.round(
    (parse(iso).getTime() - parse(referenceIso).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "idag";
  if (diffDays === 1) return "i morgon";
  if (diffDays === -1) return "i går";
  if (diffDays > 1 && diffDays < 14) return `om ${diffDays} dagar`;
  if (diffDays >= 14 && diffDays < 60) return `om ${Math.round(diffDays / 7)} veckor`;
  if (diffDays >= 60) return `om ${Math.round(diffDays / 30)} månader`;
  if (diffDays < -1 && diffDays > -14) return `för ${Math.abs(diffDays)} dagar sedan`;
  if (diffDays <= -14 && diffDays > -60) return `för ${Math.round(Math.abs(diffDays) / 7)} veckor sedan`;
  return `för ${Math.round(Math.abs(diffDays) / 30)} månader sedan`;
}

export const sessionStatusLabel: Record<SessionStatus, string> = {
  genomford: "Genomförd",
  kommande: "Kommande",
};

export const commitmentStatusLabel: Record<CommitmentStatus, string> = {
  oppet: "Öppet",
  pagar: "Pågår",
  genomfort: "Genomfört",
};

export const milestoneStatusLabel: Record<MilestoneStatus, string> = {
  genomford: "Genomförd",
  pagaende: "Pågående",
  kommande: "Kommande",
};

export const engagementStatusLabel = {
  planering: "I planering",
  pagaende: "Pågående",
  avslutat: "Avslutat",
} as const;

/** Hälsningsfras utifrån tid på dygnet. */
export function greeting(hour: number): string {
  if (hour < 10) return "God morgon";
  if (hour < 17) return "God dag";
  return "God kväll";
}
