/**
 * Canonical CVB semantic status tones.
 * Aligned with dashboard palette in portal-colors.ts — presentation only.
 */
import type { OperationsStatus } from "@/lib/portal/repository";
import type {
  CommitmentStatus,
  ContractStatus,
  EngagementStatus,
  MilestoneStatus,
  SessionStatus,
} from "@/lib/portal/types";

/** Hex values aligned with portal-colors.ts — static strings for Tailwind JIT. */
export const cvbStatusTone = {
  /** Kräver handling / följ upp */
  action: "border-[#EFD0C8] bg-[#FAECE8] text-[#9E5A4E]",
  /** Förberedelse / planering */
  prep: "border-[#EDD9B8] bg-[#FFF4E5] text-[#8A6535]",
  /** Aktiv klient / öppet åtagande */
  active: "border-[#A898C8]66 bg-[#F0ECF6] text-[#65578A]",
  /** Klar / stabil / genomfört */
  completed: "border-[#B8DDD6] bg-[#DFF0EC] text-[#3F7569]",
  /** Planerad / informationsstatus */
  neutral: "border-[#DCE3E8] bg-[#E9ECEF] text-[#5C6F78]",
  private: "border-[#DCE3E8] bg-[#E9ECEF] text-[#5C6F78]",
} as const;

/** Portal Tag + dashboard badge tones — single source of truth. */
export const portalTagTone = {
  neutral: cvbStatusTone.neutral,
  action: cvbStatusTone.action,
  prep: cvbStatusTone.prep,
  active: cvbStatusTone.active,
  stable: cvbStatusTone.completed,
  ongoing: cvbStatusTone.action,
  completed: cvbStatusTone.completed,
  planning: cvbStatusTone.prep,
  booked: "border-[#B8DDD6] bg-[#E8F4EA] text-[#3F7569]",
  open: cvbStatusTone.active,
  done: cvbStatusTone.completed,
  private: cvbStatusTone.private,
  progress: cvbStatusTone.action,
} as const;

export type PortalTagTone = keyof typeof portalTagTone;

/** Shared badge shell — syskon till klient StatusBadge. */
export const cvbStatusBadgeClass =
  "inline-flex max-w-full shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold uppercase leading-snug tracking-[0.06em] sm:leading-none sm:whitespace-nowrap";

export const portalSoftBadgeClass =
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em]";

export type OperationsVisualState = "action" | "prep" | "active" | "completed" | "neutral";

export const visualStateTone: Record<OperationsVisualState, string> = {
  action: cvbStatusTone.action,
  prep: cvbStatusTone.prep,
  active: cvbStatusTone.active,
  completed: cvbStatusTone.completed,
  neutral: cvbStatusTone.neutral,
};

/** Business status → semantic visual state (separat från label och färg). */
export const operationsStatusVisualState: Record<OperationsStatus, OperationsVisualState> = {
  "Uppföljning krävs": "action",
  "Förberedelse saknas": "prep",
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

export const engagementStatusTagTone: Record<EngagementStatus, PortalTagTone> = {
  planering: "planning",
  pagaende: "stable",
  avslutat: "completed",
};

export const commitmentStatusTagTone: Record<CommitmentStatus, PortalTagTone> = {
  oppet: "open",
  pagar: "ongoing",
  genomfort: "completed",
};

export const sessionStatusTagTone: Record<SessionStatus, PortalTagTone> = {
  kommande: "booked",
  genomford: "completed",
};

export const milestoneStatusTagTone: Record<MilestoneStatus, PortalTagTone> = {
  kommande: "planning",
  pagaende: "ongoing",
  genomford: "completed",
};

export const clientMomentumTagTone = {
  STABIL: "stable",
  AKTIV: "active",
  PLANERA: "planning",
  "FÖLJ UPP": "action",
} as const;

export function getClientMomentumTone(status: string): PortalTagTone {
  return clientMomentumTagTone[status as keyof typeof clientMomentumTagTone] ?? "stable";
}

export const contractStatusLabel: Record<ContractStatus, string> = {
  utkast: "Utkast",
  skickat: "Skickat",
  kund_signerad: "Kund signerad",
  signerat: "Signerat",
  arkiverat: "Arkiverat",
};

export const contractStatusTagTone: Record<ContractStatus, PortalTagTone> = {
  utkast: "neutral",
  skickat: "prep",
  kund_signerad: "active",
  signerat: "completed",
  arkiverat: "private",
};

export function getOperationsStatusPresentation(status: OperationsStatus) {
  const visualState = operationsStatusVisualState[status];
  return {
    label: operationsStatusLabel[status],
    visualState,
    toneClass: visualStateTone[visualState],
  };
}
