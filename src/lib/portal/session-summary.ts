import { parseAiText } from "@/lib/ai/format";
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

const SECTION_FIELDS: Record<string, keyof ParsedSessionSummaryDraft> = {
  "fokus för sessionen": "focus",
  "klientens viktigaste insikter": "insights",
  "ökad medvetenhet": "awareness",
  "nya perspektiv": "newPerspectives",
  "klientens åtaganden": "commitments",
  "att följa upp": "followUp",
  "möjligt nästa fokus": "possibleNextFocus",
};

const LIST_FIELDS = new Set<keyof ParsedSessionSummaryDraft>([
  "insights",
  "newPerspectives",
  "commitments",
  "followUp",
]);

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

/** Tolkar AI-utkast till fält som matchar session_summaries. */
export function parseSessionSummaryDraft(raw: string): ParsedSessionSummaryDraft {
  const draft = emptyDraft();
  let currentField: keyof ParsedSessionSummaryDraft | null = null;

  for (const block of parseAiText(raw)) {
    if (block.type === "heading") {
      currentField = SECTION_FIELDS[block.text.toLowerCase()] ?? null;
      continue;
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
