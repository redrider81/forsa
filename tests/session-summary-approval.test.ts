import { describe, expect, it } from "vitest";
import {
  coachCanApproveSessionSummary,
  hasSessionSummaryContent,
  parseSessionSummaryDraft,
  sessionSummaryVisibleToClient,
} from "@/lib/portal/session-summary";
import {
  buildClientPerspective,
  SEED_REPOSITORY_DATA,
  type PortalRepositoryData,
} from "@/lib/portal/repository";
import { EMPTY_DEMO_MATERIALS_STATE } from "@/lib/portal/store/demo-materials-state";
import { EMPTY_DEMO_STATE } from "@/lib/portal/store/demo-state";
import type { CoachingSession, SessionSummary } from "@/lib/portal/types";

const coachId = "coach-cvb";
const emma = "klient-emma-lind";
const johan = "klient-johan-bergstrom";

const sampleDraft = [
  "Fokus för sessionen",
  "Delegering och styrelsekontakt.",
  "Klientens viktigaste insikter",
  "- Jag behöver låta teamet äga sina beslut.",
  "Ökad medvetenhet",
  "Hon ser nu när hon tar tillbaka ansvar.",
  "Klientens åtaganden",
  "- Boka styrelsemötet innan fredag.",
  "Möjligt nästa fokus",
  "Vad som händer om hon faktiskt avstår.",
].join("\n");

function baseSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    focus: "Delegering",
    insights: ["Insikt ett"],
    awareness: "Ökad tydlighet",
    newPerspectives: [],
    commitments: ["Åtagande ett"],
    followUp: [],
    possibleNextFocus: "Nästa fokus",
    approved: false,
    ...overrides,
  };
}

function withSessionSummary(
  sessionId: string,
  summary: SessionSummary | undefined,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): PortalRepositoryData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId ? { ...session, summary } : session,
    ),
  };
}

describe("parseSessionSummaryDraft", () => {
  it("tolkar AI-utkast till strukturerade fält", () => {
    const parsed = parseSessionSummaryDraft(sampleDraft);
    expect(parsed.focus).toContain("Delegering");
    expect(parsed.insights).toContain("Jag behöver låta teamet äga sina beslut.");
    expect(parsed.awareness).toContain("Hon ser nu");
    expect(parsed.commitments).toContain("Boka styrelsemötet innan fredag.");
    expect(parsed.possibleNextFocus).toContain("Vad som händer");
    expect(hasSessionSummaryContent(parsed)).toBe(true);
  });
});

describe("klient synlighet", () => {
  it("A — ogodkänd sammanfattning är inte tillgänglig för klienten", () => {
    const session = SEED_REPOSITORY_DATA.sessions.find(
      (item) => item.clientId === emma && item.status === "genomford",
    ) as CoachingSession;
    const data = withSessionSummary(session.id, baseSummary({ approved: false }));
    const view = buildClientPerspective(coachId, emma, EMPTY_DEMO_STATE, EMPTY_DEMO_MATERIALS_STATE, data);
    const visible = view!.sessions.find((item) => item.id === session.id);
    expect(visible?.summary).toBeUndefined();
    expect(sessionSummaryVisibleToClient(baseSummary({ approved: false }))).toBeUndefined();
  });

  it("D — godkänd sammanfattning blir synlig för klienten", () => {
    const session = SEED_REPOSITORY_DATA.sessions.find(
      (item) => item.clientId === emma && item.status === "genomford",
    ) as CoachingSession;
    const approved = baseSummary({ approved: true, approvedAt: "2026-05-22" });
    const data = withSessionSummary(session.id, approved);
    const view = buildClientPerspective(coachId, emma, EMPTY_DEMO_STATE, EMPTY_DEMO_MATERIALS_STATE, data);
    const visible = view!.sessions.find((item) => item.id === session.id);
    expect(visible?.summary?.approved).toBe(true);
    expect(visible?.summary?.focus).toBe("Delegering");
  });
});

describe("coach godkännande", () => {
  it("C — strukturerat utkast innehåller fält som persisteras vid godkännande", () => {
    const parsed = parseSessionSummaryDraft(sampleDraft);
    expect(hasSessionSummaryContent(parsed)).toBe(true);
    expect(parsed.focus).toBeTruthy();
    expect(parsed.insights.length).toBeGreaterThan(0);
  });

  it("B — auktoriserad coach kan godkänna sin egen klientsession", () => {
    const session = SEED_REPOSITORY_DATA.sessions.find((item) => item.clientId === emma)!;
    expect(coachCanApproveSessionSummary(coachId, emma, session.id, SEED_REPOSITORY_DATA)).toBe(true);
  });

  it("F — okänd coach eller fel session nekas", () => {
    const session = SEED_REPOSITORY_DATA.sessions.find((item) => item.clientId === emma)!;
    expect(coachCanApproveSessionSummary("coach-okand", emma, session.id, SEED_REPOSITORY_DATA)).toBe(false);
    expect(coachCanApproveSessionSummary(coachId, emma, "session-finns-inte", SEED_REPOSITORY_DATA)).toBe(false);
    expect(coachCanApproveSessionSummary(coachId, johan, session.id, SEED_REPOSITORY_DATA)).toBe(false);
  });

  it("G — godkännande för en klient påverkar inte en annan", () => {
    const emmaSession = SEED_REPOSITORY_DATA.sessions.find((item) => item.clientId === emma)!;
    const emmaOnlyMarker = "ENDAST EMMA GODKÄND SAMMANFATTNING";
    const data = withSessionSummary(
      emmaSession.id,
      baseSummary({ approved: true, focus: emmaOnlyMarker, approvedAt: "2026-06-01" }),
    );
    const johanView = buildClientPerspective(
      coachId,
      johan,
      EMPTY_DEMO_STATE,
      EMPTY_DEMO_MATERIALS_STATE,
      data,
    );
    expect(JSON.stringify(johanView)).not.toContain(emmaOnlyMarker);
  });
});

describe("auktorisation", () => {
  it("E — klientgodkännande hanteras inte i coachauktoriseringslagret", () => {
    expect(coachCanApproveSessionSummary("klient-emma-lind", emma, "session-1", SEED_REPOSITORY_DATA)).toBe(
      false,
    );
  });
});
