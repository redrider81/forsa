"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { localeFromPathname, stripLocaleFromPath } from "@/lib/i18n/config";
import { refreshScrollTriggers, resetRouteScroll } from "@/lib/motion";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isHome = stripLocaleFromPath(pathname) === "/";
  // Portalen och inloggningen har egen navigation och egen ram.
  const isPortal =
    pathname.startsWith("/cvb-base") ||
    pathname.startsWith("/klient") ||
    pathname.startsWith("/logga-in") ||
    pathname.startsWith("/coach-login") ||
    pathname.startsWith("/klient-login");

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target instanceof HTMLElement) {
        const html = document.documentElement;
        const previous = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        target.scrollIntoView({ block: "start" });
        html.style.scrollBehavior = previous;
        return;
      }
    }

    resetRouteScroll();
  }, [pathname]);

  useEffect(() => {
    resetRouteScroll();

    const frame = requestAnimationFrame(() => {
      refreshScrollTriggers();
      resetRouteScroll();
      requestAnimationFrame(resetRouteScroll);
    });

    const timeout = window.setTimeout(resetRouteScroll, 50);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
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
