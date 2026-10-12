"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { klientButtonClass } from "@/components/klient/klient-ui";
import { useLogout } from "@/components/portal/use-logout";

const items = [
  { href: "/klient", label: "Översikt", exact: true },
  { href: "/klient/reflektioner", label: "Reflektioner", exact: false },
  { href: "/klient/sessioner", label: "Sessioner", exact: false },
  { href: "/klient/avtal", label: "Avtal", exact: false },
  { href: "/klient/material", label: "Material", exact: false },
  { href: "/klient/profil", label: "Profil", exact: false },
  { href: "/klient/faq", label: "FAQ", exact: false },
] as const;

type NavItem = (typeof items)[number];

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const mobileMenuTriggerClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--klient-border-hairline)] bg-white/55 text-stone-700 transition-[background-color,border-color,color,box-shadow] duration-200 hover:bg-white/90 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] motion-reduce:transition-none";

/**
 * Mobilmenyn under md: samma högerlåda som coachportalens, men byggd på
 * `<dialog>` med `showModal()`. Webbläsaren gör då bakgrunden inert, håller
 * fokus i menyn och stänger på Escape. Från md finns samma destinationer i
 * `KlientDesktopNav`.
 */
export function KlientMobileMenu() {
  const pathname = usePathname();
  const menuId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  function closeMenu() {
    dialogRef.current?.close();
  }

  function openMenu() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  // Stänger även när routen byts utan klick i menyn, t.ex. via bakåtknappen.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    // Menyn finns bara under md. Breddas eller vrids vyn förbi gränsen
    // stängs den, annars låg en osynlig modal kvar över sidan.
    const desktop = window.matchMedia("(min-width: 48rem)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    desktop.addEventListener("change", handleChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", handleChange);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Öppna meny"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={openMenu}
        className={mobileMenuTriggerClass}
      >
        <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <dialog
        ref={dialogRef}
        id={menuId}
        aria-label="Meny"
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        // Ett klick utanför lådan landar på själva dialogen (dess ::backdrop).
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
        className="my-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[min(100%,22.5rem)] overflow-hidden border-0 border-l border-[var(--klient-border-hairline)] bg-[var(--klient-page-bg)] p-0 text-zinc-900 shadow-[-16px_0_48px_-28px_rgba(72,60,44,0.32)] backdrop:bg-stone-950/30 backdrop:backdrop-blur-[2px]"
      >
        <div
          className="flex h-full flex-col"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* Samma mått som toppraden, så att stängknappen hamnar där
              menyknappen satt. */}
          <div
            className="klient-topbar flex shrink-0 items-center justify-between gap-x-3 px-5 pb-2.5"
            style={{ paddingTop: "calc(0.625rem + env(safe-area-inset-top, 0px))" }}
          >
            <LogoMark className="order-1 h-9 w-auto shrink-0" />
            <button
              type="button"
              aria-label="Stäng meny"
              onClick={closeMenu}
              className={mobileMenuTriggerClass}
            >
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-6 pt-5">
            <nav aria-label="Portalnavigation">
              <ul className="flex flex-col gap-1">
                {items.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={closeMenu}
                        className={`flex min-h-12 items-center rounded-full border px-5 py-3 text-[1rem] font-medium tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] motion-reduce:transition-none ${
                          active
                            ? "klient-navitem--active border-[var(--klient-accent-gold-line)] text-[var(--klient-accent-gold-muted)]"
                            : "border-transparent text-stone-700 hover:bg-white/70 hover:text-stone-900"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto border-t border-[var(--klient-border-hairline)] pt-6">
              <KlientLogoutButton />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export function KlientDesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Portalnavigation">
      {/* Från md krymper raden till innehållets bredd och centreras, i
          stället för att sträcka sju etiketter över hela vyn — då kapas
          ingen etikett på surfplatta. */}
      <ul className="klient-navbar flex w-full items-stretch gap-1 p-1.5 md:mx-auto md:w-fit">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="min-w-0 flex-1 md:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-[0.8125rem] font-medium tracking-[-0.005em] transition-[background-color,color,box-shadow,border-color] duration-200 xl:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] motion-reduce:transition-none ${
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
        {/* Sista posten. Etiketten syns från xl; under det räcker raden bara
            till ikonen och etiketten blir knappens tillgängliga namn. */}
        <li className="min-w-0 flex-none">
          <KlientDesktopLogout />
        </li>
      </ul>
    </nav>
  );
}

function KlientDesktopLogout() {
  const { logout, working, label } = useLogout("/klient-login");
  return (
    <button
      type="button"
      onClick={logout}
      disabled={working}
      title={label}
      className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-transparent px-3.5 py-2.5 text-[0.8125rem] font-medium tracking-[-0.005em] text-stone-600 transition-[background-color,color,box-shadow,border-color] duration-200 hover:bg-white/60 hover:text-stone-900 xl:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] disabled:opacity-60 motion-reduce:transition-none"
    >
      <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span aria-live="polite" className="sr-only whitespace-nowrap xl:not-sr-only">
        {label}
      </span>
    </button>
  );
}

export function KlientLogoutButton() {
  const { logout, working, label } = useLogout("/klient-login");

  return (
    <button
      type="button"
      disabled={working}
      onClick={logout}
      className={`w-full ${klientButtonClass}`}
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}
