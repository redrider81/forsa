"use client";

import CtaLink from "@/components/cta-link";
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
import { prefersReducedMotion } from "@/lib/motion";
import { localeFromPathname, stripLocaleFromPath, toLocalePath, type Locale } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";

const coachingPaths = [
  "/executive-coaching",
  "/ledningsgruppscoaching",
  "/individuell-coaching",
  "/team-coaching",
  "/coachande-ledarskap",
] as const;

type CursorPosition = { left: number; width: number; opacity: number };

const navCursorClass =
  "pointer-events-none absolute top-1 z-0 h-[calc(100%-0.5rem)] rounded-full bg-[#f2f2f2]/65 backdrop-blur-sm motion-reduce:transition-none transition-[left,width,opacity] duration-200 ease-out";

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
      className="relative flex w-fit items-center gap-0.5 rounded-full p-1"
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
      className={`h-2.5 w-2.5 shrink-0 opacity-50 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
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
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-800 transition-[color,background-color] duration-200 hover:bg-white/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

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
  "inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[0.6875rem] font-medium tracking-[0.18em] text-zinc-800/90 transition-[color,background-color] duration-200 hover:bg-white/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

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
  "block rounded-md px-0.5 py-3.5 text-[1.0625rem] font-medium leading-[1.35] tracking-[-0.01em] text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]";

const mobileSubLinkClass =
  "block rounded-md py-2.5 pl-3 text-[0.9375rem] leading-[1.45] text-zinc-600 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3] aria-[current=page]:font-medium aria-[current=page]:text-[#92753a]";

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
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-900/80 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium tracking-wide text-white transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100"
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

const megaTextLink = `group -mx-2 block rounded-sm px-2 py-1.5 text-[0.9375rem] leading-6 text-zinc-900 transition-[color,transform] duration-200 ease-out motion-reduce:transition-colors motion-reduce:hover:translate-x-0 hover:translate-x-0.5 hover:text-[#92753a] aria-[current=page]:text-[#92753a] aria-[current=page]:translate-x-0 ${megaItemFocus}`;

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
            href: "/ledningsgruppscoaching",
            label: "För ledningsgrupper",
            text: "När ansvar, riktning och beslut behöver skärpas.",
          },
          {
            href: "/executive-coaching",
            label: "För vd & grundare",
            text: "Konfidentiellt stöd i komplexa beslut.",
          },
        ]
      : [
          {
            href: "/ledningsgruppscoaching",
            label: "For leadership teams",
            text: "When accountability, direction, and decisions need sharper focus.",
          },
          {
            href: "/executive-coaching",
            label: "For CEOs & founders",
            text: "Confidential support for complex decisions.",
          },
        ];
  const coachingServices =
    locale === "sv"
      ? [
          { href: "/ledningsgruppscoaching", label: "Ledningsgruppscoaching" },
          { href: "/executive-coaching", label: "Executive coaching" },
          { href: "/individuell-coaching", label: "Individuell coaching" },
          { href: "/team-coaching", label: "Team coaching" },
          { href: "/coachande-ledarskap", label: "Coachande ledarskap" },
        ]
      : [
          { href: "/ledningsgruppscoaching", label: "Leadership Team Coaching" },
          { href: "/executive-coaching", label: "Executive Coaching" },
          { href: "/individuell-coaching", label: "Individual Coaching" },
          { href: "/team-coaching", label: "Team Coaching" },
          { href: "/coachande-ledarskap", label: "Coaching Leadership" },
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
    if (!el || prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { y: -14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" }
        );
      });
    }, 32);

    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (!megaOpen) return;

    updatePanelTop();
    window.addEventListener("resize", updatePanelTop);
    window.addEventListener("scroll", updatePanelTop, true);

    return () => {
      window.removeEventListener("resize", updatePanelTop);
      window.removeEventListener("scroll", updatePanelTop, true);
    };
  }, [megaOpen, updatePanelTop]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const panel = megaPanelRef.current;
    if (!panel) return;

    let ctx: gsap.Context | undefined;

    if (megaOpen) {
      ctx = gsap.context(() => {
        gsap.killTweensOf(panel);
        gsap.set(panel, { visibility: "visible", pointerEvents: "auto" });

        if (prefersReducedMotion()) {
          gsap.set(panel, { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          panel,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" }
        );
      });
    } else {
      ctx = gsap.context(() => {
        gsap.killTweensOf(panel);

        if (prefersReducedMotion()) {
          gsap.set(panel, { opacity: 0, y: 0, visibility: "hidden", pointerEvents: "none" });
          return;
        }

        gsap.to(panel, {
          opacity: 0,
          y: -8,
          duration: 0.28,
          ease: "power2.in",
          overwrite: "auto",
          onComplete: () => {
            gsap.set(panel, { visibility: "hidden", pointerEvents: "none" });
          },
        });
      });
    }

    return () => {
      ctx?.revert();
    };
  }, [megaOpen]);

  const openMega = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePanelTop();
    setMegaOpen(true);
  };

  const closeMega = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setMegaOpen(false);
  };

  const scheduleCloseMega = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setMegaOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  const handleMegaBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && megaMenuRef.current?.contains(next)) return;
    closeMega();
  };

  const handleLanguageChange = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    router.push(toLocalePath(pathname, nextLocale));
    setMobileOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => {
      if (!prev) {
        setMobileCoachingOpen(coachingActive);
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const handlePopState = () => {
      setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mobileOpen]);

  const headerSurface = isHome
    ? megaOpen || mobileOpen
      ? "border-zinc-900/10 bg-white/40"
      : "border-transparent bg-transparent"
    : "border-zinc-200/80 bg-zinc-50/90";

  const mobileHeaderSurface = isHome
    ? mobileOpen
      ? "border-zinc-900/10 bg-white/90 backdrop-blur-md"
      : "border-transparent bg-transparent"
    : "border-b border-zinc-200/80 bg-zinc-50/95 backdrop-blur-sm";

  const logoRingOffset = isHome
    ? "focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-zinc-100";

  return (
    <>
    <header
      ref={headerRef}
      className={`isolate z-[100] w-full backdrop-blur-[2px] transition-[background-color,border-color] duration-150 ${
        isHome ? `absolute left-0 right-0 top-0 ${headerSurface}` : `sticky top-0 border-b ${headerSurface}`
      }`}
    >
      <div className="hidden w-full items-center justify-between px-6 py-5 md:flex md:px-10 lg:px-14 lg:py-6">
        <Link
          href={localizedHref("/")}
          className={`shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          <span className="block text-lg font-semibold tracking-[0.22em] text-zinc-900 lg:text-xl">FORSA</span>
        </Link>

        <nav aria-label={t.nav.mainAria} className="ml-auto">
          <DesktopNavTabs pathname={pathname} coachingActive={coachingActive}>
            {({ listRef, setPosition }) => (
              <>
                <NavHoverTarget
                  as="link"
                  href={localizedHref("/")}
                  aria-current={barePathname === "/" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/"}
                  className={navTabClass(barePathname === "/", isHome)}
                >
                  {t.nav.home}
                </NavHoverTarget>

                <li
                  ref={coachingTabRef}
                  data-nav-active={coachingActive ? "true" : undefined}
                  className="relative list-none"
                  onMouseEnter={() => {
                    if (coachingTabRef.current) {
                      syncCursorFromElement(coachingTabRef.current, listRef.current, setPosition);
                    }
                  }}
                >
                  <div
                    ref={megaMenuRef}
                    className="relative"
                    onMouseEnter={() => {
                      openMega();
                      if (coachingTabRef.current) {
                        syncCursorFromElement(coachingTabRef.current, listRef.current, setPosition);
                      }
                    }}
                    onMouseLeave={scheduleCloseMega}
                    onFocus={openMega}
                    onBlur={handleMegaBlur}
                  >
                    <button
                      type="button"
                      aria-expanded={megaOpen}
                      aria-controls={coachingMenuId}
                      className={`gap-1.5 ${navTabClass(coachingActive, isHome)}`}
                      onFocus={() => {
                        if (coachingTabRef.current) {
                          syncCursorFromElement(coachingTabRef.current, listRef.current, setPosition);
                        }
                      }}
                    >
                      {t.nav.coaching}
                      <NavChevron open={megaOpen} />
                    </button>

                    <div
                      ref={megaPanelRef}
                      id={coachingMenuId}
                      role="region"
                      aria-label="Coaching"
                      aria-hidden={!megaOpen}
                      style={{ top: Math.max(0, panelTop - 10) }}
                      className="pointer-events-none fixed inset-x-0 z-[100] hidden pt-2.5 opacity-0 md:block"
                    >
              <div className="border-t border-zinc-900/10 bg-zinc-50/95 shadow-[0_12px_40px_-28px_rgba(24,24,27,0.28)] backdrop-blur-md">
              <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-9">
                <div className="grid gap-8 md:grid-cols-[1fr_1.2fr_0.7fr] md:gap-10">
                  <div>
                    <p className={sectionLabelClass()}>{t.nav.leadershipLabel}</p>
                    <ul className="mt-4 space-y-5">
                      {coachingAudiences.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={localizedHref(item.href)}
                            aria-current={barePathname === item.href ? "page" : undefined}
                            className={megaBlockLink}
                          >
                            <span
                              className={`${megaBlockTitle} ${
                                barePathname === item.href ? "text-[#92753a]" : ""
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className={megaBlockDesc}>{item.text}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className={sectionLabelClass()}>{t.nav.coachingLabel}</p>
                    <ul className="mt-4 space-y-2.5">
                      {coachingServices.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={localizedHref(item.href)}
                            aria-current={barePathname === item.href ? "page" : undefined}
                            className={megaTextLink}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex max-w-[16rem] flex-col md:max-w-none">
                    <p className={sectionLabelClass()}>{t.nav.startHereLabel}</p>
                    <p className="mt-4 text-sm font-medium leading-snug tracking-tight text-zinc-900">
                      {t.nav.unsureTitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {t.nav.unsureBody}
                    </p>
                    <div className="mt-6">
                      <CtaLink href={localizedHref("/kontakt")} variant="secondary">
                        {t.nav.bookFirstCall}
                      </CtaLink>
                    </div>
                  </div>
                </div>
              </div>
              </div>
                    </div>
                  </div>
                </li>

                <NavHoverTarget
                  as="link"
                  href={localizedHref("/om-forsa")}
                  aria-current={barePathname === "/om-forsa" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/om-forsa"}
                  className={navTabClass(barePathname === "/om-forsa", isHome)}
                >
                  {t.nav.about}
                </NavHoverTarget>

                <li aria-hidden="true" className="flex list-none items-center px-0.5">
                  <span className="h-4 w-px bg-zinc-900/15" />
                </li>

                <NavHoverTarget
                  as="link"
                  href={localizedHref("/kontakt")}
                  aria-current={barePathname === "/kontakt" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/kontakt"}
                  className={navTabClass(barePathname === "/kontakt", isHome)}
                >
                  {t.nav.contact}
                </NavHoverTarget>
                <li className="ml-2 list-none">
                  <LanguageMenu
                    locale={locale}
                    onSelect={handleLanguageChange}
                    ariaLabel={t.languageSwitcher.ariaLabel}
                    align="right"
                  />
                </li>
              </>
            )}
          </DesktopNavTabs>
        </nav>
      </div>

      <div
        className={`relative z-[120] flex w-full items-center gap-3 px-5 py-4 md:hidden md:px-10 ${mobileHeaderSurface}`}
      >
        <Link
          href={localizedHref("/")}
          className={`min-w-0 shrink-0 text-[1.05rem] font-semibold tracking-[0.24em] text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          FORSA
        </Link>
        <div className={mobileHeaderControlCluster + " ml-auto"}>
          <MobileHeaderLanguageDropdown locale={locale} pathname={pathname} />
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-zinc-900/12" />
          <button
            type="button"
            aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={toggleMobileMenu}
            className={mobileHeaderIconButton}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>
    </header>

    <div
      className={`fixed inset-0 z-[110] md:hidden motion-reduce:transition-none transition-[visibility,opacity] duration-200 ease-out ${
        mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      }`}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        tabIndex={mobileOpen ? 0 : -1}
        aria-label={t.nav.menuClose}
        className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[2px]"
        onClick={closeMobileMenu}
      />
      <nav
        id={mobileMenuId}
        aria-label={t.nav.mobileAria}
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22.5rem)] flex-col border-l border-zinc-900/8 bg-[#f7f6f3]/98 shadow-[-16px_0_48px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-900/6 px-6 py-5">
          <span className="text-[0.8125rem] font-semibold tracking-[0.24em] text-zinc-900">FORSA</span>
          <button
            type="button"
            aria-label={t.nav.menuClose}
            onClick={closeMobileMenu}
            className={`${mobileHeaderIconButton} border border-zinc-900/10 bg-white/60`}
          >
            <MenuIcon open />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-7">
          <ul className="divide-y divide-zinc-900/6">
            <li>
              <Link
                href={localizedHref("/")}
                aria-current={barePathname === "/" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/" ? "text-[#92753a]" : ""}`}
              >
                {t.nav.home}
              </Link>
            </li>
            <li className="py-1">
              <button
                type="button"
                aria-expanded={mobileCoachingOpen}
                onClick={() => setMobileCoachingOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-1 py-3 text-left text-[1.0625rem] font-medium leading-snug text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 ${
                  coachingActive ? "text-[#92753a]" : ""
                }`}
              >
                {t.nav.coaching}
                <NavChevron open={mobileCoachingOpen} />
              </button>
              <div
                className={`overflow-hidden motion-reduce:transition-none transition-[max-height,opacity] duration-200 ease-out ${
                  mobileCoachingOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-4 pl-1">
                  <p className={`${sectionLabelClass()} pt-2`}>{t.nav.leadershipLabel}</p>
                  <ul className="mt-2 space-y-0.5">
                    {coachingAudiences.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={localizedHref(item.href)}
                          aria-current={barePathname === item.href ? "page" : undefined}
                          onClick={closeMobileMenu}
                          className={mobileSubLinkClass}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className={`${sectionLabelClass()} mt-5`}>{t.nav.coachingLabel}</p>
                  <ul className="mt-2 space-y-0.5">
                    {coachingServices.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={localizedHref(item.href)}
                          aria-current={barePathname === item.href ? "page" : undefined}
                          onClick={closeMobileMenu}
                          className={mobileSubLinkClass}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
            <li>
              <Link
                href={localizedHref("/om-forsa")}
                aria-current={barePathname === "/om-forsa" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/om-forsa" ? "text-[#92753a]" : ""}`}
              >
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link
                href={localizedHref("/kontakt")}
                aria-current={barePathname === "/kontakt" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/kontakt" ? "text-[#92753a]" : ""}`}
              >
                {t.nav.contact}
              </Link>
            </li>
          </ul>

          <div className="mt-10 border-t border-zinc-900/6 pt-8 pb-2">
            <CtaLink href={localizedHref("/kontakt")} variant="primary" onClick={closeMobileMenu}>
              {t.nav.bookFirstCall}
            </CtaLink>
          </div>
        </div>
      </nav>
    </div>
    </>
  );
}
