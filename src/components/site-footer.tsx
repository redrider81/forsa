"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { localeFromPathname, toLocalePath } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const isPortal =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/klient") ||
    pathname.startsWith("/logga-in") ||
    pathname.startsWith("/coach-login") ||
    pathname.startsWith("/klient-login");
  const href = (path: string) => toLocalePath(path, locale);
  const services =
    locale === "sv"
      ? [
          { href: "/executive-coaching", label: "Executive coaching" },
          { href: "/ledningsgruppscoaching", label: "Ledningsgruppscoaching" },
          { href: "/individuell-coaching", label: "Individuell coaching" },
          { href: "/team-coaching", label: t.footer.teamCoaching },
          { href: "/coachande-ledarskap", label: "Coachande ledarskap" },
        ]
      : [
          { href: "/executive-coaching", label: "Executive Coaching" },
          { href: "/ledningsgruppscoaching", label: "Executive Team Coaching" },
          { href: "/individuell-coaching", label: "Individual Coaching" },
          { href: "/team-coaching", label: t.footer.teamCoaching },
          { href: "/coachande-ledarskap", label: "Coaching Leadership" },
        ];
  const about =
    locale === "sv"
      ? [
          { href: "/om-oss", label: "Om oss" },
          { href: "/kontakt", label: "Kontakt" },
        ]
      : [
          { href: "/om-oss", label: "About us" },
          { href: "/kontakt", label: "Contact" },
        ];

  if (isPortal) return null;

  return (
    <footer className="mt-auto border-t border-zinc-300 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">

          <div className="md:col-span-5">
            <LogoMark className="h-14 w-auto" />
            <p className="mt-7 max-w-xs text-sm leading-relaxed text-zinc-600">
              {t.footer.description}
            </p>
            <div className="mt-5">
              <a
                href="mailto:kontakt@cvbcoaching.se"
                className="inline-block text-sm text-zinc-700 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
              >
                kontakt@cvbcoaching.se
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              {t.footer.services}
            </p>
            <ul className="mt-4 space-y-2.5">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              {t.footer.about}
            </p>
            <ul className="mt-4 space-y-2.5">
              {about.map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6">
          <p className="text-xs text-zinc-400">{t.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/klient-login"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              {t.footer.clientPortal}
            </Link>
            <Link
              href="/coach-login"
              className="text-xs text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              {t.footer.coachLogin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
