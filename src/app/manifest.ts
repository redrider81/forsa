import type { MetadataRoute } from "next";

const themeGray = "#71717a";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CVB Coaching",
    short_name: "CVB Coaching",
    description:
      "Individuell coaching och coaching i arbetslivet i Göteborg — CVB Coaching.",
    start_url: "/",
    display: "browser",
    background_color: themeGray,
    theme_color: themeGray,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
