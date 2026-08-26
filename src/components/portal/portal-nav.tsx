"use client";

import { LogoMark } from "@/components/brand/logo";
import { portalPrimaryButtonClass } from "@/components/portal/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";

const items = [
  { href: "/cvb-base", label: "Översikt", exact: true },
  { href: "/cvb-base/kalender", label: "Kalender", exact: false },
  { href: "/cvb-base/klienter", label: "Klienter", exact: false },
  { href: "/cvb-base/uppdrag", label: "Uppdrag", exact: false },
  { href: "/cvb-base/avtal", label: "Avtal", exact: false },
  { href: "/cvb-base/dokument", label: "Dokument", exact: false },
  { href: "/cvb-base/profil", label: "Profil", exact: false },
] as const;

function isActive(pathname: string, item: (typeof items)[number]): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1.125rem] w-[1.125rem] text-current"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
    >
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

const mobileMenuTriggerClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--klient-border-muted)] bg-white text-zinc-800 shadow-[0_1px_3px_rgba(24,24,27,0.06)] transition-[color,background-color] duration-200 hover:border-zinc-400 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]";

const mobileNavLinkClass =
  "block rounded-md px-1 py-4 text-[1.0625rem] font-medium leading-[1.35] tracking-[-0.01em] text-zinc-900 transition-colors hover:text-[var(--klient-accent-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]";

export function PortalMobileNav() {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const overlay = (
    <div
      data-portal
      className={`fixed inset-0 z-50 md:hidden motion-reduce:transition-none transition-[visibility,opacity] duration-200 ease-out ${
        open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
      inert={open ? undefined : true}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Stäng meny"
        className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <nav
        id={menuId}
        aria-label="Portalnavigation"
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22.5rem)] flex-col border-l border-zinc-900/8 bg-[var(--klient-page-bg)]/98 shadow-[-16px_0_48px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--klient-border-muted)] px-5 py-4">
          <LogoMark className="h-8 w-auto" />
          <button
            type="button"
            aria-label="Stäng meny"
            onClick={() => setOpen(false)}
            className={mobileMenuTriggerClass}
          >
            <MenuIcon open />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-6">
          <ul className="divide-y divide-[var(--klient-border-muted)]">
            {items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`${mobileNavLinkClass} ${active ? "text-[var(--klient-accent-gold)]" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto border-t border-[var(--klient-border-muted)] pt-6">
            <LogoutButton className="w-full" />
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Stäng meny" : "Öppna meny"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className={mobileMenuTriggerClass}
      >
        <MenuIcon open={open} />
      </button>
      {mounted ? createPortal(overlay, document.body) : null}
    </div>
  );
}

export function PortalDesktopNav() {
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
                    ? "bg-white text-zinc-900 shadow-[0_1px_4px_rgba(24,24,27,0.08)] ring-1 ring-[#e6e2d8]"
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

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/portal/auth/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/coach-login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy || pending}
      className={cn(portalPrimaryButtonClass, "disabled:opacity-60", className)}
    >
      {busy || pending ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}
