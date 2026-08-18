import { describe, expect, it } from "vitest";
import { buildClientContext, buildEngagementContext } from "@/lib/ai/context";
import {
  getClientDossier,
  getClientPerspective,
  getEngagementOverview,
  listClientsForEngagement,
} from "@/lib/portal/repository";

const coachId = "coach-cvb";

describe("accesskontroll", () => {
  it("nekar okänd coach", () => {
    expect(getClientDossier("coach-okand", "klient-emma-lind")).toBeNull();
    expect(getEngagementOverview("coach-okand", "eng-bergstrom")).toBeNull();
    expect(buildClientContext("coach-okand", "klient-emma-lind")).toBeNull();
  });

  it("nekar okänd klient och okänt uppdrag", () => {
    expect(getClientDossier(coachId, "klient-finns-inte")).toBeNull();
    expect(buildEngagementContext(coachId, "eng-finns-inte")).toBeNull();
  });

  it("håller deltagare inom rätt uppdrag", () => {
    const bergstrom = listClientsForEngagement(coachId, "eng-bergstrom");
    expect(bergstrom.length).toBe(4);
    expect(bergstrom.every((client) => client.engagementId === "eng-bergstrom")).toBe(true);
  });
});

describe("AI-kontext för klient", () => {
  const context = buildClientContext(coachId, "klient-emma-lind");

  it("innehåller endast den valda klienten", () => {
    expect(context).not.toBeNull();
    expect(context!.text).toContain("Emma Lind");
    for (const otherName of [
      "Johan Bergström",
      "Sara Nyqvist",
      "Helena Waller",
      "Markus Ek",
      "Nordic Industrial Group",
      "Bergström Logistik",
    ]) {
      expect(context!.text).not.toContain(otherName);
    }
  });

  it("innehåller aldrig coachens privata anteckningar", () => {
    expect(context!.text).not.toContain("gick in i väggen");
    expect(context!.text).not.toContain("Hon undvek styrelsefrågan tre gånger");
    expect(context!.text).not.toContain("Egen reflektion");
  });

  it("innehåller klientens egna formuleringar och åtaganden", () => {
    expect(context!.text).toContain("KLIENTENS EGNA REFLEKTIONER");
    expect(context!.text).toContain("KLIENTENS ÅTAGANDEN");
    expect(context!.sources.join(" ")).toMatch(/genomförda sessioner/);
  });
});

describe("AI-kontext för organisation", () => {
  const context = buildEngagementContext(coachId, "eng-bergstrom");

  it("innehåller uppdragets deltagare men inget samtalsinnehåll", () => {
    expect(context).not.toBeNull();
    expect(context!.text).toContain("Johan Bergström");
    expect(context!.text).not.toContain("KLIENTENS EGNA REFLEKTIONER");
    expect(context!.text).not.toContain("Testade att spegla hans ordval");
    expect(context!.text).not.toContain("Ett beslut utan ansvarig är ett förslag.");
  });

  it("blandar inte in andra organisationer", () => {
    for (const other of ["Northline Studio", "Nordic Industrial Group", "Emma Lind", "Helena Waller"]) {
      expect(context!.text).not.toContain(other);
    }
  });
});

describe("klientvy", () => {
  const view = getClientPerspective(coachId, "klient-emma-lind");

  it("saknar coachanteckningar", () => {
    expect(view).not.toBeNull();
    const serialised = JSON.stringify(view);
    expect(serialised).not.toContain("Hon undvek styrelsefrågan tre gånger");
    expect(serialised).not.toContain("coachNotes");
  });

  it("visar endast godkända sammanfattningar", () => {
    const withSummary = view!.sessions.filter((session) => session.summary);
    expect(withSummary.every((session) => session.summary?.approved)).toBe(true);
  });

  it("döljer dokument på coachens privata nivå", () => {
    expect(view!.documents.every((document) => document.visibility !== "coach")).toBe(true);
  });
});
