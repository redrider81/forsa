import { describe, expect, it } from "vitest";
import { coachFaqCategories } from "@/components/portal/coach-faq-content";

const answerOf = (categoryId: string, question: string): string => {
  const category = coachFaqCategories.find((item) => item.id === categoryId);
  const entry = category?.entries.find((item) => item.question === question);
  if (!entry) throw new Error(`Saknar FAQ-fråga: ${categoryId} / ${question}`);
  return entry.answer.join(" ");
};

describe("coach-FAQ struktur", () => {
  it("låser kategorierna och deras ordning", () => {
    expect(coachFaqCategories.map((item) => item.title)).toEqual([
      "Översikt",
      "Kalender och bokningar",
      "Klienter",
      "Sessioner och sammanfattningar",
      "Uppdrag",
      "Avtal",
      "Dokument och material",
      "Profil, integritet och hjälp",
    ]);
  });

  it("har unika id:n, sammanfattningar och minst tre frågor per kategori", () => {
    const ids = coachFaqCategories.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const category of coachFaqCategories) {
      expect(category.summary.trim()).not.toBe("");
      expect(category.entries.length).toBeGreaterThanOrEqual(3);
      expect(category.entries.every((entry) => entry.answer.every((text) => text.trim()))).toBe(true);
    }
  });

  it("undviker backend-terminologi", () => {
    const text = JSON.stringify(coachFaqCategories);
    for (const pattern of [/\bRPC\b/i, /\bAPI\b/i, /\bdatabas/i, /\brepository\b/i, /\bendpoint\b/i, /\bSupabase\b/i]) {
      expect(text).not.toMatch(pattern);
    }
  });
});

describe("coach-FAQ integritetscopy", () => {
  it("håller arbetsanteckningar privata", () => {
    const answer = answerOf("sessioner", "Kan klienten se mina coachanteckningar?");
    expect(answer).toMatch(/^Nej\./);
    expect(answer).toContain("delas aldrig");
  });

  it("säger att utkast inte delas automatiskt", () => {
    expect(answerOf("sessioner", "När kan klienten se sammanfattningen?")).toContain(
      "Inget utkast delas automatiskt",
    );
  });

  it("skyddar klientens privata material", () => {
    const answer = answerOf("dokument", "Kan jag se klientens privata material?");
    expect(answer).toMatch(/^Nej\./);
    expect(answer).toContain("når aldrig Carolina");
  });

  it("utesluter individuellt samtalsinnehåll från uppdragsrapportering", () => {
    expect(answerOf("uppdrag", "Visas individuellt samtalsinnehåll för uppdragsgivaren?")).toContain(
      "aldrig individuellt samtalsinnehåll",
    );
  });
});
