"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { localeFromPathname, stripLocaleFromPath } from "@/lib/i18n/config";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isHome = stripLocaleFromPath(pathname) === "/";

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
