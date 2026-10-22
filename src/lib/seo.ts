import type { Metadata } from "next";

/**
 * Kanonisk värd. Sajten serveras utan www — alla URL:er i metadata, sitemap
 * och strukturerad data ska använda exakt denna värd så att Google inte delar
 * upp signalerna på två domänvarianter.
 */
export const SITE_URL = "https://cvbcoaching.se";

export type SiteLocale = "sv" | "en";

/**
 * Canonical + hreflang för en publik sida som finns på både svenska och engelska.
 * `path` anges utan språkprefix, t.ex. "" för startsidan eller "/coaching".
 */
export function pageAlternates(path: string, locale: SiteLocale): Metadata["alternates"] {
  const sv = path || "/";
  const en = `/en${path}`;
  return {
    canonical: locale === "sv" ? sv : en,
    languages: {
      "sv-SE": sv,
      en,
      "x-default": sv,
    },
  };
}
