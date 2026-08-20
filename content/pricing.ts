/** Prisplatshållare — sätt belopp när de är fastställda. null döljer prisblocket. */
export const PRIS_INDIVIDUELL = null as number | null;
export const PRIS_LEDNINGSGRUPP = null as number | null;
export const PRIS_PROGRAM_FRAN = null as number | null;
export const PRIS_ENSKILT_SAMTAL = null as number | null;

export function formatPrice(amount: number | null, locale: "sv" | "en"): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}
