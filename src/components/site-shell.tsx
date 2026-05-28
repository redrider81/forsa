"use client";

import { usePathname } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { stripLocaleFromPath } from "@/lib/i18n/config";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const isHome = stripLocaleFromPath(usePathname()) === "/";

  return (
    <>
      {!isHome && <SiteNavigation />}
      {children}
    </>
  );
}
