import type { Metadata } from "next";
import { defaultLocale, locales, toLocalePath, type Locale } from "@/lib/i18n/config";

/**
 * Kanonisk URL och hreflang-alternativ för en publik sida som finns på båda
 * språken. `path` är den språklösa sökvägen, t.ex. "/om-oss" eller "/".
 */
export function localeAlternates(path: string, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, toLocalePath(path, l)]),
  );
  languages["x-default"] = toLocalePath(path, defaultLocale);

  return {
    canonical: toLocalePath(path, locale),
    languages,
  };
}
