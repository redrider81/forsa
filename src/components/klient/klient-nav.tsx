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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--klient-border-muted)] bg-[var(--klient-page-bg)]/98 pb-4 backdrop-blur-md md:hidden"
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
                className={`flex min-h-11 items-center justify-center rounded-full border bg-white px-2 py-2.5 text-[0.625rem] font-semibold leading-tight shadow-[0_1px_3px_rgba(24,24,27,0.06)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] ${
                  active
                    ? "border-zinc-900 text-zinc-900"
                    : "border-[var(--klient-border-muted)] text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
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
      <ul className="flex items-stretch gap-1 rounded-2xl border border-[var(--klient-border-muted)] bg-[var(--klient-surface-inset)] p-1">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] ${
                  active
                    ? "bg-white text-[#7d6432] shadow-[0_1px_4px_rgba(24,24,27,0.08)] ring-1 ring-[#e6e2d8]"
                    : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900"
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
