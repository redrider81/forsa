# 01b — Shared public navigation (part 1 of 2)

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

`src/components/site-navigation.tsx` lines 1–520. Continues in 01c. Split only because the file exceeds the 35 KB per-file limit; content is unmodified.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/components/site-navigation.tsx (lines 1–520)

### Affected route(s)
shared — all public routes

Lines 1–520 of 1037.

### Current source

```tsx
"use client";

import CtaLink from "@/components/cta-link";
import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { motion, prefersReducedMotion, showTargets } from "@/lib/motion";
import { localeFromPathname, stripLocaleFromPath, toLocalePath, type Locale } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";

const coachingPaths = [
  "/individuell-coaching",
  "/business-coaching",
] as const;

type CursorPosition = { left: number; width: number; opacity: number };

const navCursorClass =
  "pointer-events-none absolute top-1 z-0 h-[calc(100%-0.5rem)] rounded-full bg-zinc-300/95 backdrop-blur-sm motion-reduce:transition-none transition-[left,width,opacity] duration-200 ease-out";

function navTabClass(isActive: boolean, overlay = false) {
  const ringOffset = overlay
    ? "focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";
  const tone = isActive
    ? "text-zinc-950"
    : overlay
      ? "text-zinc-800 hover:text-zinc-950"
      : "text-zinc-700 hover:text-zinc-900";
  return `relative z-10 inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm font-medium ${tone} ${ringOffset} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900`;
}

function syncCursorFromElement(
  el: HTMLElement | null,
  listEl: HTMLUListElement | null,
  setPosition: (position: CursorPosition) => void
) {
  if (!el || !listEl) return;
  setPosition({
    left: el.offsetLeft,
    width: el.offsetWidth,
    opacity: 1,
  });
}

function DesktopNavTabs({
  pathname,
  coachingActive,
  children,
}: {
  pathname: string;
  coachingActive: boolean;
  children: (api: {
    listRef: React.RefObject<HTMLUListElement | null>;
    setPosition: (position: CursorPosition) => void;
  }) => ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<CursorPosition>({ left: 0, width: 0, opacity: 0 });

  const restToActive = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const active = listEl.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (active) {
      syncCursorFromElement(active, listEl, setPosition);
      return;
    }
    setPosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  useEffect(() => {
    restToActive();
  }, [pathname, coachingActive, restToActive]);

  return (
    <ul
      ref={listRef}
      className="relative flex w-fit items-center gap-2 rounded-full p-1"
      onMouseLeave={restToActive}
    >
      {children({ listRef, setPosition })}
      <li
        aria-hidden="true"
        className={navCursorClass}
        style={{
          left: position.left,
          width: position.width,
          opacity: position.opacity,
        }}
      />
    </ul>
  );
}

function NavHoverTarget({
  listRef,
  setPosition,
  className,
  dataNavActive,
  children,
  ...props
}: {
  listRef: React.RefObject<HTMLUListElement | null>;
  setPosition: (position: CursorPosition) => void;
  className: string;
  dataNavActive?: boolean;
  children: ReactNode;
} & (
  | { as: "link"; href: string; "aria-current"?: "page" | undefined }
  | { as: "button"; type: "button"; "aria-expanded"?: boolean; "aria-controls"?: string }
)) {
  const itemRef = useRef<HTMLLIElement>(null);

  const handleEnter = () => {
    if (!itemRef.current) return;
    syncCursorFromElement(itemRef.current, listRef.current, setPosition);
  };

  return (
    <li
      ref={itemRef}
      data-nav-active={dataNavActive ? "true" : undefined}
      className="relative list-none"
      onMouseEnter={handleEnter}
      onFocus={handleEnter}
    >
      {props.as === "link" ? (
        <Link
          href={props.href}
          aria-current={props["aria-current"]}
          className={className}
          onFocus={handleEnter}
        >
          {children}
        </Link>
      ) : (
        <button
          type={props.type}
          aria-expanded={props["aria-expanded"]}
          aria-controls={props["aria-controls"]}
          className={className}
          onFocus={handleEnter}
        >
          {children}
        </button>
      )}
    </li>
  );
}

function NavChevron({ open }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 shrink-0 opacity-75 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2.5 4.5 6 8 9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const mobileHeaderControlCluster =
  "flex shrink-0 items-center gap-0 rounded-full border border-zinc-900/10 bg-white/50 p-0.5 shadow-[0_1px_3px_rgba(24,24,27,0.08)] backdrop-blur-md";

const mobileHeaderIconButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-800 transition-[color,background-color] duration-200 hover:bg-white/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function LoginIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0 text-current"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" />
      <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H3" strokeLinecap="round" />
    </svg>
  );
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

const mobileHeaderLangTrigger =
  "inline-flex h-11 items-center gap-1 rounded-full px-3 text-[0.6875rem] font-medium tracking-[0.18em] text-zinc-800/90 transition-[color,background-color] duration-200 hover:bg-white/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function MobileHeaderLanguageDropdown({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const t = getDictionaryForOptionalLocale(locale);

  const languageOptions: { code: Locale; shortLabel: string; ariaLabel: string }[] = [
    { code: "sv", shortLabel: "SV", ariaLabel: t.languageSwitcher.swedish },
    { code: "en", shortLabel: "EN", ariaLabel: t.languageSwitcher.english },
  ];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative px-0.5">
      <button
        type="button"
        aria-label={t.languageSwitcher.ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className={mobileHeaderLangTrigger}
      >
        {locale === "sv" ? "SV" : "EN"}
        <NavChevron open={open} />
      </button>
      <div
        id={menuId}
        role="listbox"
        aria-label={t.languageSwitcher.ariaLabel}
        className={`absolute right-0 top-[calc(100%+0.375rem)] z-[130] min-w-[4.5rem] overflow-hidden rounded-xl border border-zinc-900/10 bg-white/95 py-1 shadow-[0_8px_28px_-14px_rgba(24,24,27,0.28)] backdrop-blur-md ${
          open ? "block" : "hidden"
        }`}
      >
        {languageOptions.map((option) => {
          const isActive = locale === option.code;
          const optionClass =
            "block px-3 py-2 text-center text-[0.6875rem] font-medium tracking-[0.18em]";

          if (isActive) {
            return (
              <span
                key={option.code}
                role="option"
                aria-selected="true"
                aria-label={option.ariaLabel}
                className={`${optionClass} text-zinc-950`}
              >
                {option.shortLabel}
              </span>
            );
          }

          return (
            <Link
              key={option.code}
              href={toLocalePath(pathname, option.code)}
              role="option"
              aria-selected="false"
              aria-label={option.ariaLabel}
              onClick={() => setOpen(false)}
              className={`${optionClass} text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900/40`}
            >
              {option.shortLabel}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const mobileNavLinkClass =
  "block rounded-md px-0.5 py-4 text-[1.0625rem] font-medium leading-[1.35] tracking-[-0.01em] text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]";

const mobileAudienceLinkClass =
  "block rounded-md py-3.5 pl-3 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3] aria-[current=page]:text-[#92753a]";

const mobileAudienceTitleClass =
  "block text-[0.9375rem] font-medium leading-[1.45] text-zinc-900 aria-[current=page]:text-[#92753a]";

const mobileAudienceDescClass = "mt-1 block text-sm leading-6 text-zinc-600";

function LanguageMenu({
  locale,
  onSelect,
  ariaLabel,
  align = "right",
}: {
  locale: Locale;
  onSelect: (nextLocale: Locale) => void;
  ariaLabel: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const alignClass = align === "left" ? "left-0" : "right-0";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/90 bg-zinc-700/90 px-3 py-1.5 text-xs font-medium tracking-wide text-white transition-colors hover:bg-zinc-600 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100"
      >
        {locale === "en" ? "EN" : "SV"}
        <NavChevron open={open} />
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label={ariaLabel}
        className={`absolute ${alignClass} z-[120] mt-2 min-w-[5rem] rounded-xl border border-zinc-900/20 bg-zinc-950/95 p-1.5 shadow-lg backdrop-blur ${
          open ? "block" : "hidden"
        }`}
      >
        <button
          type="button"
          role="menuitemradio"
          aria-checked={locale === "en"}
          onClick={() => {
            onSelect("en");
            setOpen(false);
          }}
          className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium tracking-wide transition-colors ${
            locale === "en" ? "bg-zinc-800 text-white" : "text-zinc-200 hover:bg-zinc-800/70"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={locale === "sv"}
          onClick={() => {
            onSelect("sv");
            setOpen(false);
          }}
          className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium tracking-wide transition-colors ${
            locale === "sv" ? "bg-zinc-800 text-white" : "text-zinc-200 hover:bg-zinc-800/70"
          }`}
        >
          SV
        </button>
      </div>
    </div>
  );
}

function isCoachingActive(pathname: string) {
  return coachingPaths.some((path) => pathname === path);
}

function sectionLabelClass() {
  return "text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]";
}

const megaItemFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50";

const megaBlockLink = `group -mx-2 block rounded-sm px-2 py-1.5 transition-[color,transform] duration-200 ease-out ${megaItemFocus}`;

const megaBlockTitle =
  "block text-sm font-medium text-zinc-900 transition-colors duration-200 group-hover:text-[#92753a]";

const megaBlockDesc =
  "mt-1 block text-sm leading-6 text-zinc-600 transition-colors duration-200 group-hover:text-zinc-700";

export default function SiteNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = localeFromPathname(pathname);
  const barePathname = stripLocaleFromPath(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const localizedHref = (path: string) => toLocalePath(path, locale);
  const coachingAudiences =
    locale === "sv"
      ? [
          {
            href: "/individuell-coaching",
            label: "Individuell coaching",
            text: "För dig som står inför ett vägval, en förändring eller ett beslut som väger.",
          },
          {
            href: "/business-coaching",
            label: "Business coaching",
            text: "För medarbetare och ledare i arbetslivet.",
          },
        ]
      : [
          {
            href: "/individuell-coaching",
            label: "Individual coaching",
            text: "For anyone facing a choice, a change or a decision that carries weight.",
          },
          {
            href: "/business-coaching",
            label: "Business coaching",
            text: "For employees and leaders in working life.",
          },
        ];
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCoachingOpen, setMobileCoachingOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const coachingTabRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachingMenuId = useId();
  const [megaOpen, setMegaOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const coachingActive = isCoachingActive(barePathname);
  const isHome = barePathname === "/";

  const updatePanelTop = useCallback(() => {
    if (headerRef.current) {
      setPanelTop(headerRef.current.getBoundingClientRect().bottom);
    }
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      showTargets(el);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: -8, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.medium,
```
