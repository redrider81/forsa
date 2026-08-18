/**
 * Kontextlås för AI:n. CVB Coaching Portal har ingen allmän assistent —
 * AI:n får endast arbeta med den aktuella klienten eller det aktuella uppdraget.
 *
 * Modulen är avsiktligt fri från beroenden så att den kan enhetstestas.
 */

export const OUT_OF_SCOPE_REPLY =
  "Jag kan endast hjälpa dig med frågor som rör den aktuella klienten eller det aktuella uppdraget.";

const OUT_OF_SCOPE_PATTERNS: RegExp[] = [
  // Innehållsproduktion utanför coachingarbetet
  /\b(skriv|skriva|skapa|gör|göra|formulera|utforma|ta fram|producera)\b[^?.!]{0,60}\b(linkedin|inlägg|post(en|ning)?|tweet|mail|mejl|e-?post|brev|offert|prisförslag|presentation|powerpoint|slide|pitch|annons|blogg|artikel|pressmeddelande|faktura|avtal|cv|nyhetsbrev|hemsida|webbtext)\b/i,
  /\b(linkedin|instagram|facebook|tiktok)\b/i,
  /\boffert(en|er|förslag)?\b/i,
  /\bpressmeddelande\b/i,
  // Marknad, research och omvärld
  /\b(marknadsanalys|marknadsundersökning|omvärldsanalys|konkurrentanalys|konkurrenter|researcha?|research\b|google|sök upp|slå upp)\b/i,
  /\bcoachingmarknaden\b/i,
  // Egen planering och administration
  /\b(planera|lägg upp|strukturera|organisera)\b[^?.!]{0,40}\b(min|mitt|mina)\b[^?.!]{0,20}\b(vecka|dag|kalender|schema|tid|arbetsdag|to-?do)\b/i,
  /\b(boka|lägg in)\b[^?.!]{0,30}\b(min|mitt|mina)\b/i,
  /\bfakturer(a|ing)\b/i,
  // Privat och allmänt
  /\b(recept|middag\w*|matsedel|lunchtips|träningsprogram|semester\w*|väder|aktietips|skatteråd)\b/i,
  /\b(skämt|dikt|låttext|novell)\b/i,
  // Försök att lämna kontexten
  /\b(ignorera|bortse från|glöm)\b[^?.!]{0,30}\b(instruktion|regler|tidigare|system)/i,
  /\b(alla (dina|era) klienter|andra klienter|övriga klienter|samtliga klienter|jämför med (en )?annan klient)\b/i,
  /\b(visa|lista|berätta om)\b[^?.!]{0,30}\bandra (klienter|uppdrag|företag|organisationer)\b/i,
];

/** Returnerar true om frågan uppenbart ligger utanför aktuell kontext. */
export function isOutOfScope(question: string): boolean {
  const normalised = question.normalize("NFKC").trim();
  if (normalised.length === 0) return false;
  return OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(normalised));
}

/** Enkel längd- och innehållsvalidering av coachens fråga. */
export function validateQuestion(input: unknown): { ok: true; question: string } | { ok: false; error: string } {
  if (typeof input !== "string") {
    return { ok: false, error: "Frågan saknas." };
  }
  const question = input.trim();
  if (question.length < 2) {
    return { ok: false, error: "Skriv en fråga först." };
  }
  if (question.length > 1200) {
    return { ok: false, error: "Frågan är för lång. Korta ner den och försök igen." };
  }
  return { ok: true, question };
}
