"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalSegmentActiveClass, portalSegmentClass, portalSegmentInactiveClass } from "@/components/portal/ui";

/** Flik-navigation inom en klients detaljvy. Samma segment-mönster som styr klienttyp i "Ny klient". */
export default function ClientDetailNav({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/portal/klienter/${clientId}`, label: "Översikt", exact: true },
    { href: `/portal/klienter/${clientId}/avtal`, label: "Avtal & dokument", exact: false },
  ] as const;

  return (
    <nav aria-label="Klientnavigation" className="flex flex-wrap gap-2.5">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${portalSegmentClass} ${active ? portalSegmentActiveClass : portalSegmentInactiveClass}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
