"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { localeFromPathname, stripLocaleFromPath } from "@/lib/i18n/config";
import { refreshScrollTriggers } from "@/lib/motion";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isHome = stripLocaleFromPath(pathname) === "/";
  // Portalen och inloggningen har egen navigation och egen ram.
  const isPortal =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/klient") ||
    pathname.startsWith("/logga-in") ||
    pathname.startsWith("/coach-login") ||
    pathname.startsWith("/klient-login");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => refreshScrollTriggers());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (isPortal) {
    return (
      <>
        <a href="#main-content" className="skip-link">
          Hoppa till innehåll
        </a>
        {children}
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {locale === "en" ? "Skip to content" : "Hoppa till innehåll"}
      </a>
      {!isHome && <SiteNavigation />}
      {children}
    </>
  );
}
