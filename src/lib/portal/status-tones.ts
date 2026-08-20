/**
 * Canonical CVB semantic status tones.
 * Aligned with klient-ui StatusBadge — presentation only.
 */
import type { OperationsStatus } from "@/lib/portal/repository";

export const cvbStatusTone = {
  /** Kräver handling — klient: oppet */
  action: "border-orange-400 bg-orange-400 text-white",
  /** Aktiv / pågående — klient: pagar */
  active: "border-emerald-500 bg-emerald-500 text-white",
  /** Klar / mottagen — klient: genomfort */
  completed: "border-emerald-700/20 bg-emerald-700/6 text-emerald-900",
  /** Planerad / informationsstatus */
  neutral: "border-zinc-300/80 bg-zinc-50 text-zinc-700",
  private: "border-zinc-300/80 bg-zinc-50 text-zinc-700",
} as const;

/** Shared badge shell — syskon till klient StatusBadge. */
export const cvbStatusBadgeClass =
  "inline-flex max-w-full shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold uppercase leading-snug tracking-[0.06em] sm:leading-none sm:whitespace-nowrap";

export type OperationsVisualState = "action" | "active" | "completed" | "neutral";

export const visualStateTone: Record<OperationsVisualState, string> = {
  action: cvbStatusTone.action,
  active: cvbStatusTone.active,
  completed: cvbStatusTone.completed,
  neutral: cvbStatusTone.neutral,
};

/** Business status → semantic visual state (separat från label och färg). */
export const operationsStatusVisualState: Record<OperationsStatus, OperationsVisualState> = {
  "Uppföljning krävs": "action",
  "Förberedelse saknas": "action",
  "Sammanfattning för granskning": "action",
  "Underlag saknas": "neutral",
  Programgenomgång: "active",
  "Session idag": "active",
  "Förberedelse mottagen": "completed",
  "Session genomförd": "completed",
  "Underlag mottaget": "completed",
  "Session planerad": "neutral",
  "Ny reflektion": "neutral",
  "Åtagande uppdaterat": "neutral",
};

/** Korta display labels — interna statusvärden oförändrade. */
export const operationsStatusLabel: Record<OperationsStatus, string> = {
  "Förberedelse mottagen": "Förberedd",
  "Förberedelse saknas": "Förbered",
  "Session planerad": "Planerad",
  "Session idag": "Idag",
  "Session genomförd": "Genomförd",
  "Uppföljning krävs": "Uppföljning",
  "Underlag mottaget": "Underlag mottaget",
  "Underlag saknas": "Underlag saknas",
  Programgenomgång: "Genomgång",
  "Sammanfattning för granskning": "Granska",
  "Åtagande uppdaterat": "Uppdaterat",
  "Ny reflektion": "Ny reflektion",
};

export function getOperationsStatusPresentation(status: OperationsStatus) {
  const visualState = operationsStatusVisualState[status];
  return {
    label: operationsStatusLabel[status],
    visualState,
    toneClass: visualStateTone[visualState],
  };
}
