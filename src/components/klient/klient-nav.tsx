"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/klient", label: "Översikt", exact: true },
  { href: "/klient/reflektioner", label: "Reflektioner", exact: false },
  { href: "/klient/sessioner", label: "Sessioner", exact: false },
  { href: "/klient/profil", label: "Profil", exact: false },
] as const;

function Icon({ name, active }: { name: string; active: boolean }) {
  const common = {
    fill: "none",
    stroke: active ? "#92753a" : "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.3rem] w-[1.3rem]">
      {name === "Översikt" && <path d="M4 12.5 12 5l8 7.5M6.5 11v8h11v-8" {...common} />}
      {name === "Reflektioner" && (
        <path d="M5 5.5h14v10.5H10l-4 3.5v-3.5H5zM9 9.5h6M9 12.5h4" {...common} />
      )}
      {name === "Sessioner" && (
        <path d="M6.5 4.5h11v15h-11zM9.5 8.5h5M9.5 12h5M9.5 15.5h3" {...common} />
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

export function KlientBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portalnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e2d8] bg-[#fbfaf7]/96 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[0.6875rem] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7] ${
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

export function KlientDesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Portalnavigation" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7] ${
                  active
                    ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(24,24,27,0.06)]"
                    : "text-zinc-600 hover:text-zinc-900"
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
      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f4]"
    >
      {busy ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}
