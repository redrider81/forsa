import { toLocalePath, type Locale } from "@/lib/i18n/config";

/** Swedish paths of the legal pages. English lives under /en via toLocalePath. */
export const LEGAL_PATHS = {
  privacy: "/integritet",
  terms: "/villkor",
  baseTerms: "/cvb-base-villkor",
  cookies: "/cookies",
} as const;

export type LegalPageKey = keyof typeof LEGAL_PATHS;

const TITLES: Record<Locale, Record<LegalPageKey, string>> = {
  sv: {
    privacy: "Integritet",
    terms: "Villkor",
    baseTerms: "CVB Base-villkor",
    cookies: "Cookies",
  },
  en: {
    privacy: "Privacy",
    terms: "Terms",
    baseTerms: "CVB Base terms",
    cookies: "Cookies",
  },
};

export function legalHref(key: LegalPageKey, locale: Locale): string {
  return toLocalePath(LEGAL_PATHS[key], locale);
}

export function legalLinks(
  locale: Locale,
  keys: readonly LegalPageKey[] = ["privacy", "terms", "baseTerms", "cookies"],
): Array<{ key: LegalPageKey; title: string; href: string }> {
  return keys.map((key) => ({ key, title: TITLES[locale][key], href: legalHref(key, locale) }));
}
