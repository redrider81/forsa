import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import SiteFooter from "@/components/site-footer";
import SiteShell from "@/components/site-shell";
import JsonLd, { professionalServiceSchema } from "@/components/json-ld";
import type { Locale } from "@/lib/i18n/config";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Bas för relativa URL:er i metadata, t.ex. hreflang-alternativ. */
export const siteUrl = new URL("https://www.cvbcoaching.se");

/**
 * Gemensamt dokumentskal för de två rotlayouterna, app/(sv) och app/(en).
 * Sajten har en rotlayout per språk så att <html lang> stämmer med sidans
 * språk redan i serverrenderingen.
 */
export default function RootDocument({
  lang,
  children,
}: Readonly<{
  lang: Locale;
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-100 text-zinc-900">
        <JsonLd data={professionalServiceSchema} />
        <SiteShell>{children}</SiteShell>
        <SiteFooter />
      </body>
    </html>
  );
}
