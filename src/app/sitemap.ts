import type { MetadataRoute } from "next";

const SITE_URL = "https://cvbcoaching.se";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}${path || "/"}` })),
    ...PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}/en${path}` })),
  ];
}
