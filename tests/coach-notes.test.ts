import { describe, expect, it } from "vitest";
import { buildClientContext, buildEngagementContext } from "@/lib/ai/context";
import { buildClientPerspective } from "@/lib/portal/repository";

const coachId = "coach-cvb";
const emma = "klient-emma-lind";

/** Distinkt fras som bara finns i Carolinas privata anteckningar om Emma. */
const PRIVATE_PHRASE = "Hon undvek styrelsefrågan tre gånger";

describe("coachprivata anteckningar", () => {
  it("ingår när Carolina arbetar med sin egen klient", () => {
    const context = buildClientContext(coachId, emma, undefined, { includeCoachNotes: true });
    expect(context).not.toBeNull();
    expect(context!.text).toContain("COACH PRIVAT");
    expect(context!.text).toContain(PRIVATE_PHRASE);
  });

  it("redovisas som eget underlag för coachen", () => {
    const context = buildClientContext(coachId, emma, undefined, { includeCoachNotes: true });
    expect(context!.sources.join(" ")).toContain("Egna arbetsanteckningar");
  });

  it("instruerar modellen att aldrig dela dem vidare", () => {
    const context = buildClientContext(coachId, emma, undefined, { includeCoachNotes: true });
    expect(context!.text).toContain("aldrig formuleras som något som kan delas");
  });

  it("utelämnas som standard", () => {
    const context = buildClientContext(coachId, emma);
    expect(context!.text).not.toContain(PRIVATE_PHRASE);
    expect(context!.text).toContain("ingår inte i detta underlag");
  });

  it("når aldrig organisationsnivån, ens med coachläge påslaget", () => {
    for (const engagementId of ["eng-northline", "eng-bergstrom", "eng-nordic-industrial"]) {
      const context = buildEngagementContext(coachId, engagementId);
      expect(context).not.toBeNull();
      expect(context!.text).not.toContain("COACH PRIVAT");
      expect(context!.text).not.toContain(PRIVATE_PHRASE);
    }
  });

  it("når aldrig klientens eget perspektiv", () => {
    const view = buildClientPerspective(coachId, emma);
    const serialised = JSON.stringify(view);
    expect(serialised).not.toContain(PRIVATE_PHRASE);
    expect(serialised).not.toContain("COACH PRIVAT");
  });

  it("läcker aldrig till en annan klients kontext", () => {
    const other = buildClientContext(coachId, "klient-johan-bergstrom", undefined, {
      includeCoachNotes: true,
    });
    expect(other!.text).not.toContain(PRIVATE_PHRASE);
    expect(other!.text).not.toContain("Emma");
  });
});

describe("Emmas testhistorik", () => {
  const context = buildClientContext(coachId, emma, undefined, { includeCoachNotes: true })!;

  it("visar den förändrade problemformuleringen över tid", () => {
    expect(context.text).toContain("Jag behöver bli bättre på att delegera");
    expect(context.text).toContain("vilka beslut de faktiskt äger");
    expect(context.text).toContain("När en viktig kund är involverad");
  });

  it("innehåller ett återfall", () => {
    expect(context.text).toContain("Lindqvist");
  });

  it("innehåller minst ett åtagande som inte blivit gjort", () => {
    expect(context.text).toContain("Har skjutit på det tre veckor i rad");
  });
});
