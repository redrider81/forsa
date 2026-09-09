import { describe, expect, it } from "vitest";
import { faqCategories } from "@/components/klient/faq-content";

const byId = (id: string) => {
  const category = faqCategories.find((item) => item.id === id);
  if (!category) throw new Error(`Saknar FAQ-kategori: ${id}`);
  return category;
};

const answerOf = (categoryId: string, question: string): string => {
  const entry = byId(categoryId).entries.find((item) => item.question === question);
  if (!entry) throw new Error(`Saknar FAQ-fråga: ${categoryId} / ${question}`);
  return entry.answer.join(" ");
};

describe("klient-FAQ struktur", () => {
  it("låser de åtta kategorierna och deras ordning", () => {
    expect(faqCategories.map((item) => item.title)).toEqual([
      "Översikt",
      "Förberedelse inför nästa session",
      "Åtaganden",
      "Reflektioner",
      "Sessioner",
      "Material",
      "Avtal och profil",
      "Integritet och hjälp",
    ]);
  });

  it("har unika id:n och minst tre frågor per kategori", () => {
    const ids = faqCategories.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const category of faqCategories) {
      expect(category.entries.length).toBeGreaterThanOrEqual(3);
      expect(category.summary.length).toBeGreaterThan(0);
      for (const entry of category.entries) {
        expect(entry.answer.length).toBeGreaterThan(0);
        expect(entry.answer.every((paragraph) => paragraph.trim().length > 0)).toBe(true);
      }
    }
  });

  it("undviker backend-terminologi i svaren", () => {
    const forbidden = [
      /\bRPC\b/i,
      /\bAPI\b/i,
      /\bdatabas/i,
      /\brepository\b/i,
      /\bendpoint\b/i,
      /\bstatusobjekt\b/i,
      /\bSupabase\b/i,
    ];
    for (const category of faqCategories) {
      for (const entry of category.entries) {
        const text = `${entry.question} ${entry.answer.join(" ")}`;
        for (const pattern of forbidden) {
          expect(text, `${category.id} / ${entry.question}`).not.toMatch(pattern);
        }
      }
    }
  });
});

/**
 * Integritetskritisk copy. Svaren nedan måste stämma med implementationen:
 * förberedelse, åtaganden och reflektioner delas med Carolina, coachens
 * arbetsanteckningar exponeras aldrig och sammanfattningar visas först när
 * de är godkända och delade.
 */
describe("klient-FAQ integritetscopy", () => {
  it("säger att förberedelsen delas med Carolina", () => {
    expect(answerOf("forberedelse", "Kan Carolina se min förberedelse?")).toMatch(/^Ja\./);
    expect(answerOf("forberedelse", "Vad händer när jag sparar min förberedelse?")).toContain(
      "delas med Carolina",
    );
  });

  it("säger att uppdaterade åtaganden ingår i det gemensamma underlaget", () => {
    expect(answerOf("ataganden", "Kan Carolina se mina uppdateringar?")).toMatch(/^Ja\./);
  });

  it("säger att reflektioner delas med Carolina, aldrig att de är privata", () => {
    const answer = answerOf("reflektioner", "Kan Carolina läsa mina reflektioner?");
    expect(answer).toMatch(/^Ja\./);
    expect(answer).toContain("delas med Carolina");
    expect(answer).not.toContain("Endast du kan se");
  });

  it("säger nej om coachens arbetsanteckningar", () => {
    expect(answerOf("sessioner", "Kan jag se Carolinas arbetsanteckningar?")).toMatch(/^Nej\./);
    expect(answerOf("integritet-och-hjalp", "Vad ser jag inte som klient?")).toContain(
      "arbetsanteckningar",
    );
  });

  it("kopplar sammanfattningar till godkänd delning", () => {
    expect(answerOf("sessioner", "Varför saknar en session ibland en sammanfattning?")).toContain(
      "godkänd och delad",
    );
  });

  it("håller isär materialets delningsetiketter", () => {
    expect(answerOf("material", 'Vad betyder "Privat för mig"?')).toContain("når aldrig Carolina");
    expect(answerOf("material", 'Vad betyder "Delat med Carolina"?')).toContain("klientvy");
    expect(answerOf("integritet-och-hjalp", "Hur vet jag om material är privat eller delat?")).toContain(
      "Delat av Carolina",
    );
  });

  it("använder den operativa kontaktadressen och inte avsändaradressen", () => {
    const entry = byId("integritet-och-hjalp").entries.find(
      (item) => item.question === "Hur kontaktar jag Carolina?",
    );
    expect(entry?.contactEmail).toBe("carolina@cvbcoaching.se");

    const allText = JSON.stringify(faqCategories);
    expect(allText).not.toContain("bokning@mail.cvbcoaching.se");
  });
});
