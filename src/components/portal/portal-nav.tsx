"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const items = [
  { href: "/portal", label: "Översikt", exact: true },
  { href: "/portal/uppdrag", label: "Uppdrag", exact: false },
  { href: "/portal/klienter", label: "Klienter", exact: false },
  { href: "/portal/profil", label: "Profil", exact: false },
] as const;

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#92753a" : "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.3rem] w-[1.3rem]">
      {name === "Översikt" && <path d="M4 6h7v5H4zM13 6h7v3h-7zM13 11h7v7h-7zM4 13h7v5H4z" {...common} />}
      {name === "Uppdrag" && <path d="M4 8.5h16v10H4zM9 8.5V6.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16" {...common} />}
      {name === "Klienter" && (
        <>
          <circle cx="9.5" cy="9" r="2.75" {...common} />
          <path d="M4 19c0-2.6 2.5-4.5 5.5-4.5S15 16.4 15 19M16 7.2a2.6 2.6 0 0 1 0 5M17.5 14.9c1.6.6 2.5 1.9 2.5 3.6" {...common} />
        </>
      )}
      {name === "Profil" && (
        <>
          <circle cx="12" cy="8.5" r="3.25" {...common} />
          <path d="M5.5 19.5c0-3.1 2.9-5.5 6.5-5.5s6.5 2.4 6.5 5.5" {...common} />
        </>
      )}
    </svg>
  );
}

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portalnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/90 bg-[#faf9f7]/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[0.6875rem] font-medium tracking-[0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7] ${
                  active ? "text-[#92753a]" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Icon name={item.label} active={active} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PortalDesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Portalnavigation" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7] ${
                  active ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(24,24,27,0.06)]" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/portal/auth/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/logga-in");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy || pending}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7] ${className}`}
    >
      {busy || pending ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}
