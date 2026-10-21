import { isKnownAiHeading, parseAiText } from "@/lib/ai/format";
import { SESSION_SUMMARY_SECTIONS } from "@/lib/portal/session-summary-draft";
import { getSession, type PortalRepositoryData } from "@/lib/portal/repository";
import { EMPTY_DEMO_STATE } from "@/lib/portal/store/demo-state";
import type { SessionSummary } from "@/lib/portal/types";

export type ParsedSessionSummaryDraft = Pick<
  SessionSummary,
  | "focus"
  | "insights"
  | "awareness"
  | "newPerspectives"
  | "commitments"
  | "followUp"
  | "possibleNextFocus"
>;

const SECTION_FIELDS: Record<string, keyof ParsedSessionSummaryDraft> = Object.fromEntries(
  SESSION_SUMMARY_SECTIONS.map((section) => [section.heading.toLowerCase(), section.key]),
);

const LIST_FIELDS = new Set<keyof ParsedSessionSummaryDraft>(
  SESSION_SUMMARY_SECTIONS.filter((section) => section.list).map((section) => section.key),
);

function emptyDraft(): ParsedSessionSummaryDraft {
  return {
    focus: "",
    insights: [],
    awareness: "",
    newPerspectives: [],
    commitments: [],
    followUp: [],
    possibleNextFocus: "",
  };
}

/**
 * Tolkar ett utkast — från AI-stödet, mötesläget eller den manuella mallen —
 * till fält som matchar session_summaries.
 *
 * En kort rad som bara ser ut som en rubrik (t.ex. "Ledarskap i ny roll")
 * räknas som innehåll i det avsnitt den står i, så att det coachen ser i
 * utkastet också är det som delas. Endast de sju avsnittsrubrikerna och
 * AI-stödets övriga kända rubriker byter avsnitt.
 */
export function parseSessionSummaryDraft(raw: string): ParsedSessionSummaryDraft {
  const draft = emptyDraft();
  let currentField: keyof ParsedSessionSummaryDraft | null = null;

  for (const block of parseAiText(raw)) {
    if (block.type === "heading") {
      const field = SECTION_FIELDS[block.text.replace(/:$/, "").trim().toLowerCase()];
      if (field) {
        currentField = field;
        continue;
      }
      if (!currentField || isKnownAiHeading(block.text)) {
        currentField = null;
        continue;
      }
    }
    if (!currentField) continue;

    if (LIST_FIELDS.has(currentField)) {
      const list = draft[currentField] as string[];
      if (block.type === "bullet") {
        list.push(block.text);
      } else if (block.text.trim()) {
        list.push(block.text);
      }
      continue;
    }

    const text = block.text.trim();
    if (!text) continue;
    if (currentField === "focus") {
      draft.focus = draft.focus ? `${draft.focus}\n${text}`.trim() : text;
    } else if (currentField === "awareness") {
      draft.awareness = draft.awareness ? `${draft.awareness}\n${text}`.trim() : text;
    } else if (currentField === "possibleNextFocus") {
      draft.possibleNextFocus = draft.possibleNextFocus
        ? `${draft.possibleNextFocus}\n${text}`.trim()
        : text;
    }
  }

  return draft;
}

export function hasSessionSummaryContent(draft: ParsedSessionSummaryDraft): boolean {
  return Boolean(
    draft.focus.trim() ||
      draft.awareness.trim() ||
      draft.possibleNextFocus.trim() ||
      draft.insights.length ||
      draft.newPerspectives.length ||
      draft.commitments.length ||
      draft.followUp.length,
  );
}

/** Coach får endast godkänna sammanfattningar för sessioner hen äger. */
export function coachCanApproveSessionSummary(
  coachId: string,
  clientId: string,
  sessionId: string,
  data: PortalRepositoryData,
): boolean {
  return getSession(coachId, clientId, sessionId, EMPTY_DEMO_STATE, data) !== null;
}

/** Klientvy visar endast godkända sammanfattningar. */
export function sessionSummaryVisibleToClient(summary: SessionSummary | undefined): SessionSummary | undefined {
  return summary?.approved ? summary : undefined;
}
