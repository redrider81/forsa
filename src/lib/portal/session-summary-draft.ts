import type { SessionSummary } from "@/lib/portal/types";

/**
 * Textformatet för ett sessionssammanfattningsutkast (CVB-CR-20261021-01).
 *
 * Samma sju rubriker används av AI-stödet, av utkastet från mötesläget och
 * av den manuella mallen, så att alla tre vägarna godkänns genom samma
 * route och tolkas av samma parseSessionSummaryDraft. Ren modul utan
 * serverberoenden — kan användas i klientkomponenter och enhetstestas.
 */

export type SessionSummaryDraftFields = Pick<
  SessionSummary,
  | "focus"
  | "insights"
  | "awareness"
  | "newPerspectives"
  | "commitments"
  | "followUp"
  | "possibleNextFocus"
>;

type SectionKey = keyof SessionSummaryDraftFields;

/** Rubrikerna i den ordning de skrivs ut. */
export const SESSION_SUMMARY_SECTIONS: ReadonlyArray<{ key: SectionKey; heading: string; list: boolean }> = [
  { key: "focus", heading: "Fokus för sessionen", list: false },
  { key: "insights", heading: "Klientens viktigaste insikter", list: true },
  { key: "awareness", heading: "Ökad medvetenhet", list: false },
  { key: "newPerspectives", heading: "Nya perspektiv", list: true },
  { key: "commitments", heading: "Klientens åtaganden", list: true },
  { key: "followUp", heading: "Att följa upp", list: true },
  { key: "possibleNextFocus", heading: "Möjligt nästa fokus", list: false },
];

export type SessionSummaryDraftSource = "ai" | "mote" | "manuell";

function oneLine(value: string): string {
  return value.replace(/\s*\r?\n\s*/g, " ").trim();
}

/**
 * Skriver fälten som redigerbar text med de sju rubrikerna. Listfält blir
 * punkter; textfält behåller sina rader. Omvänd mot parseSessionSummaryDraft.
 */
export function serializeSessionSummaryDraft(summary: Partial<SessionSummaryDraftFields>): string {
  return SESSION_SUMMARY_SECTIONS.map(({ key, heading, list }) => {
    const value = summary[key];
    let body: string[] = [];
    if (list) {
      body = (Array.isArray(value) ? value : [])
        .map((item) => oneLine(String(item)))
        .filter(Boolean)
        .map((item) => `- ${item}`);
    } else if (typeof value === "string") {
      body = value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
    return [heading, ...body].join("\n");
  }).join("\n\n");
}

/** Tom mall för en sammanfattning som coachen skriver själv. */
export const EMPTY_SESSION_SUMMARY_TEMPLATE = serializeSessionSummaryDraft({});
