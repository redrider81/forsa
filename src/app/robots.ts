import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Snedstrecket på slutet är avsiktligt: /cvb-base-villkor och /klient-login är publika.
      disallow: ["/api/", "/cvb-base/", "/klient/"],
    },
    sitemap: "https://cvbcoaching.se/sitemap.xml",
  };
}
