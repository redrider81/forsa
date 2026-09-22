"use client";

import { Mail } from "lucide-react";
import { Footer } from "@/components/ui/footer-section";
import { localeFromPathname, toLocalePath } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";

/** Publik kontakt — samma adress som i strukturerad data (json-ld). */
const PUBLIC_EMAIL = "info@cvbcoaching.se";
const PUBLIC_MAILTO = "mailto:info@cvbcoaching.se";

export default function SiteFooter() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const isPortal =
    pathname.startsWith("/cvb-base") ||
    pathname.startsWith("/klient") ||
    pathname.startsWith("/logga-in") ||
    pathname.startsWith("/coach-login") ||
    pathname.startsWith("/carolina") ||
    pathname.startsWith("/klient-login");
  const href = (path: string) => toLocalePath(path, locale);

  if (isPortal) return null;

  const columns =
    locale === "sv"
      ? [
          {
            label: "Coaching",
            links: [
              { title: "Individuell coaching", href: href("/individuell-coaching") },
              { title: "Business coaching", href: href("/business-coaching") },
              { title: "Så fungerar coaching", href: href("/coaching") },
            ],
          },
          {
            label: "Om",
            links: [{ title: "Om CVB Coaching", href: href("/om-oss") }],
          },
          {
            label: "Praktiskt",
            links: [
              { title: "Kontakt", href: href("/kontakt") },
              { title: "Boka inledande samtal", href: href("/kontakt") },
            ],
          },
          {
            label: "Direkt",
            links: [
              {
                title: PUBLIC_EMAIL,
                href: PUBLIC_MAILTO,
                external: true,
                icon: Mail,
              },
              { title: t.nav.login, href: "/klient-login" },
            ],
          },
        ]
      : [
          {
            label: "Coaching",
            links: [
              { title: "Individual coaching", href: href("/individuell-coaching") },
              { title: "Business coaching", href: href("/business-coaching") },
              { title: "How coaching works", href: href("/coaching") },
            ],
          },
          {
            label: "About",
            links: [{ title: "About Carolina", href: href("/om-oss") }],
          },
          {
            label: "Practical",
            links: [
              { title: "Contact", href: href("/kontakt") },
              { title: "Book an introductory call", href: href("/kontakt") },
            ],
          },
          {
            label: "Contact",
            links: [
              {
                title: PUBLIC_EMAIL,
                href: PUBLIC_MAILTO,
                external: true,
                icon: Mail,
              },
              { title: t.nav.login, href: "/klient-login" },
            ],
          },
        ];

  return (
    <Footer
      columns={columns}
      copyright={t.footer.copyright}
    />
  );
}
