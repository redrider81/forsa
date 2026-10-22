import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Endast publika, indexerbara sidor. Inloggning, portal och arkiverade villkorsversioner ingår inte. */
const PUBLIC_PATHS = [
  "",
  "/coaching",
  "/individuell-coaching",
  "/business-coaching",
  "/om-oss",
  "/kontakt",
  "/integritet",
  "/villkor",
  "/cvb-base-villkor",
  "/cookies",
];

/** Varje sida listas på båda språken med ömsesidiga hreflang-kopplingar. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languagesFor = (path: string) => ({
    "sv-SE": `${SITE_URL}${path || "/"}`,
    en: `${SITE_URL}/en${path}`,
  });
  return [
    ...PUBLIC_PATHS.map((path) => ({
      url: `${SITE_URL}${path || "/"}`,
      alternates: { languages: languagesFor(path) },
    })),
    ...PUBLIC_PATHS.map((path) => ({
      url: `${SITE_URL}/en${path}`,
      alternates: { languages: languagesFor(path) },
    })),
  ];
}
