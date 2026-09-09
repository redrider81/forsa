"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { klientButtonClass } from "@/components/klient/klient-ui";

const items = [
  { href: "/klient", label: "Översikt", exact: true },
  { href: "/klient/reflektioner", label: "Reflektioner", exact: false },
  { href: "/klient/sessioner", label: "Sessioner", exact: false },
  { href: "/klient/avtal", label: "Avtal", exact: false },
  { href: "/klient/material", label: "Material", exact: false },
  { href: "/klient/profil", label: "Profil", exact: false },
] as const;

function isActive(pathname: string, item: (typeof items)[number]): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function KlientBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portalnavigation"
      className="klient-bottombar fixed inset-x-0 bottom-0 z-40 pb-4 md:hidden"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch gap-1.5 px-3 py-2.5">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-full border px-2 py-2.5 text-[0.625rem] font-semibold leading-tight transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] motion-reduce:transition-none ${
                  active
                    ? "klient-navitem--active border-[var(--klient-accent-gold-line)] text-[var(--klient-accent-gold-muted)]"
                    : "border-transparent bg-white/45 text-stone-600 hover:bg-white/80 hover:text-stone-900"
                }`}
              >
                <span className="max-w-full truncate px-0.5">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function KlientDesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Portalnavigation">
      <ul className="klient-navbar flex w-full items-stretch gap-1 p-1.5 lg:w-auto">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="min-w-0 flex-1 lg:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-[0.8125rem] font-medium tracking-[-0.005em] transition-[background-color,color,box-shadow,border-color] duration-200 lg:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] motion-reduce:transition-none ${
                  active
                    ? "klient-navitem--active !border-[var(--klient-accent-gold-line)] text-[var(--klient-accent-gold-muted)]"
                    : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                }`}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function KlientLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/portal/auth/logout", { method: "POST" });
        router.replace("/klient-login");
        router.refresh();
      }}
      className={`w-full ${klientButtonClass}`}
    >
      {busy ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}
