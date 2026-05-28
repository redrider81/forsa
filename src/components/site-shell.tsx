"use client";

import { usePathname } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === "/";

  return (
    <>
      {!isHome && <SiteNavigation />}
      {children}
    </>
  );
}
