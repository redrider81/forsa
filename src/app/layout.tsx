import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import SiteFooter from "@/components/site-footer";
import SiteShell from "@/components/site-shell";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Forsa | Executive coaching och ledningsstöd",
  description:
    "Forsa arbetar med vd:ar, grundare och ledningsgrupper när beslut, ansvar och riktning behöver skärpas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-100 text-zinc-900">
        <a href="#main-content" className="skip-link">
          Hoppa till innehåll
        </a>
        <SiteShell>{children}</SiteShell>
        <SiteFooter />
      </body>
    </html>
  );
}
