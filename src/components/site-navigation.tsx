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
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { motion, prefersReducedMotion, showTargets } from "@/lib/motion";
import { localeFromPathname, stripLocaleFromPath, toLocalePath, type Locale } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";
import {
  navHeroPillSurfaceClass,
  SlideTabs,
  slideTabTriggerClass,
  syncSlideTabsCursor,
  type SlideTabsPosition,
} from "@/components/ui/slide-tabs";

const coachingPaths = [
  "/coaching",
  "/individuell-coaching",
  "/business-coaching",
] as const;

function NavHoverTarget({
  listRef,
  setPosition,
  className,
  dataNavActive,
  children,
  ...props
}: {
  listRef: React.RefObject<HTMLUListElement | null>;
  setPosition: (position: SlideTabsPosition) => void;
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
    syncSlideTabsCursor(itemRef.current, setPosition);
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
      className={`h-2.5 w-2.5 shrink-0 opacity-75 transition-transform duration-150 md:h-3 md:w-3 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2.5 4.5 6 8 9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const mobileHeaderControlClusterSolid =
  "flex shrink-0 items-center gap-0 rounded-full border border-zinc-200/75 bg-white/92 p-0 shadow-[0_1px_2px_rgba(24,24,27,0.05)] backdrop-blur-sm";

const mobileHeaderControlClusterHero =
  `flex shrink-0 items-center gap-0 rounded-full p-0 ${navHeroPillSurfaceClass}`;

const mobileHeaderControlCluster = mobileHeaderControlClusterSolid;

const mobileHeaderIconButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-800 transition-[color,background-color] duration-200 hover:bg-zinc-100/90 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const mobileHeaderIconButtonHero =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-white/95 transition-[color,background-color] duration-200 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-current"
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
  "inline-flex h-9 items-center gap-0.5 rounded-md px-2.5 text-[0.625rem] font-medium tracking-[0.18em] text-zinc-800/90 transition-[color,background-color] duration-200 hover:bg-zinc-100/90 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const mobileHeaderLangTriggerHero =
  "inline-flex h-9 items-center gap-0.5 rounded-md px-2.5 text-[0.625rem] font-medium tracking-[0.18em] text-white/95 transition-[color,background-color] duration-200 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function MobileHeaderLanguageDropdown({
  locale,
  pathname,
  onHero = false,
}: {
  locale: Locale;
  pathname: string;
  onHero?: boolean;
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
        className={onHero ? mobileHeaderLangTriggerHero : mobileHeaderLangTrigger}
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

const desktopHeaderActionBase =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 md:px-4 md:py-2 md:text-[0.9375rem]";

const desktopHeaderActionSolidClass = `${desktopHeaderActionBase} border border-zinc-700 bg-zinc-700 hover:border-zinc-600 hover:bg-zinc-600 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100`;

const desktopHeaderActionHeroClass = `${desktopHeaderActionBase} ${navHeroPillSurfaceClass} hover:bg-white/28 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40`;

function desktopHeaderActionClass(onHero: boolean) {
  return onHero ? desktopHeaderActionHeroClass : desktopHeaderActionSolidClass;
}

function LanguageMenu({
  locale,
  onSelect,
  ariaLabel,
  align = "right",
  onHero = false,
}: {
  locale: Locale;
  onSelect: (nextLocale: Locale) => void;
  ariaLabel: string;
  align?: "left" | "right";
  onHero?: boolean;
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
        className={desktopHeaderActionClass(onHero)}
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

const megaBlockLink = `group -mx-2 block rounded-sm px-2 py-1.5 transition-colors duration-200 ease-out ${megaItemFocus}`;

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
  // Översiktssidan finns på båda språken. href är språklös och lokaliseras
  // där länken renderas.
  const coachingOverview = {
    href: "/coaching",
    label: "Coaching",
    text:
      locale === "sv"
        ? "Så fungerar coaching hos CVB: när den kan vara rätt, vad arbetet består av och hur ett samarbete går till."
        : "How coaching works at CVB: when it can be right, what the work involves and how a collaboration works.",
  };
  const coachingSubmenuLabel = (open: boolean) =>
    locale === "sv"
      ? open
        ? "Stäng undermeny för Coaching"
        : "Visa undermeny för Coaching"
      : open
        ? "Close Coaching submenu"
        : "Show Coaching submenu";
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
            label: "Coaching i arbetslivet",
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
  const [portalReady, setPortalReady] = useState(false);
  const coachingActive = isCoachingActive(barePathname);
  const isHome = barePathname === "/";

  const updatePanelTop = useCallback(() => {
    if (headerRef.current) {
      setPanelTop(headerRef.current.getBoundingClientRect().bottom);
    }
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      showTargets(el);
      gsap.set(el, { clearProps: "transform" });
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
          ease: motion.ease.reveal,
          force3D: true,
          onComplete: () => {
            gsap.set(el, { clearProps: "transform" });
          },
        },
      );
    });

    return () => {
      ctx?.revert();
      showTargets(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, []);

  useEffect(() => {
    updatePanelTop();
    window.addEventListener("resize", updatePanelTop);
    return () => window.removeEventListener("resize", updatePanelTop);
  }, [updatePanelTop]);

  useEffect(() => {
    if (!megaOpen) return;
    const raf = requestAnimationFrame(() => {
      updatePanelTop();
    });
    return () => cancelAnimationFrame(raf);
  }, [megaOpen, updatePanelTop]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

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

  const isPointerInMegaZone = (x: number, y: number) => {
    const under = document.elementFromPoint(x, y);
    if (!(under instanceof Node)) return false;
    return (
      megaMenuRef.current?.contains(under) === true ||
      megaPanelRef.current?.contains(under) === true
    );
  };

  const scheduleCloseMega = (pointer?: { x: number; y: number }) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      if (pointer && isPointerInMegaZone(pointer.x, pointer.y)) {
        closeTimerRef.current = null;
        return;
      }
      setMegaOpen(false);
      closeTimerRef.current = null;
    }, 300);
  };

  const leaveMegaHoverZone = (event: React.MouseEvent) => {
    const related = event.relatedTarget;
    if (
      related instanceof Node &&
      (megaMenuRef.current?.contains(related) || megaPanelRef.current?.contains(related))
    ) {
      return;
    }
    scheduleCloseMega({ x: event.clientX, y: event.clientY });
  };

  const handleMegaBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && megaMenuRef.current?.contains(next)) return;
    if (next instanceof Node && megaPanelRef.current?.contains(next)) return;
    scheduleCloseMega();
  };

  useEffect(() => {
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMega();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [megaOpen]);

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
    ? mobileOpen
      ? "border-zinc-200/80 bg-white"
      : "border-transparent bg-transparent"
    : "border-zinc-200/80 bg-white";

  const mobileHeaderSurface = isHome
    ? mobileOpen
      ? "border-zinc-200/80 bg-white"
      : "border-transparent bg-transparent"
    : "border-b border-zinc-200/80 bg-white";

  const logoRingOffset = isHome
    ? "focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-zinc-100";

  const heroLogoOnDark = isHome && !mobileOpen;
  /** Megameny får inte ändra headerhöjd — det gav synligt «wobble» vid hover. */
  const homeHeaderLayout = isHome && !mobileOpen;

  return (
    <>
    <header
      ref={headerRef}
      className={`isolate z-[100] w-full border-b transition-[background-color,border-color] duration-150 ${
        isHome && !mobileOpen ? "backdrop-blur-[2px]" : ""
      } ${isHome ? `absolute left-0 right-0 top-0 ${headerSurface}` : `sticky top-0 ${headerSurface}`}`}
    >
      <div
        className={`hidden w-full items-center justify-between px-6 md:flex md:px-10 lg:px-14 ${
          homeHeaderLayout ? "pb-6 pt-11 lg:pb-7 lg:pt-14" : "py-6 lg:py-7"
        }`}
      >
        <Link
          href={localizedHref("/")}
          className={`shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset} ${
            heroLogoOnDark ? "translate-x-1" : ""
          }`}
        >
          <LogoMark
            className="block h-24 w-auto translate-y-0.5 lg:h-[7rem]"
            onDarkBackground={heroLogoOnDark}
            priority
          />
        </Link>

        <nav
          aria-label={t.nav.mainAria}
          className="ml-auto flex items-center gap-2.5 md:gap-3"
        >
          <SlideTabs
            variant={isHome ? "overlay" : "solid"}
            activeKey={`${pathname}:${coachingActive}`}
          >
            {({ listRef, setPosition }) => (
              <>
                <NavHoverTarget
                  as="link"
                  href={localizedHref("/")}
                  aria-current={barePathname === "/" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/"}
                  className={slideTabTriggerClass(barePathname === "/", isHome)}
                >
                  {t.nav.home}
                </NavHoverTarget>

                <li
                  ref={coachingTabRef}
                  data-nav-active={coachingActive ? "true" : undefined}
                  className="relative list-none"
                  onMouseEnter={() => {
                    openMega();
                    if (coachingTabRef.current) {
                      syncSlideTabsCursor(coachingTabRef.current, setPosition);
                    }
                  }}
                  onMouseLeave={leaveMegaHoverZone}
                >
                  <div
                    ref={megaMenuRef}
                    className="relative"
                    onFocus={openMega}
                    onBlur={handleMegaBlur}
                  >
                    {/* Coaching är en egen sida, inte bara en meny. Ordet är därför
                        en riktig länk till /coaching och chevronen en separat knapp
                        som öppnar panelen. */}
                    <span className="inline-flex items-center">
                      <Link
                        href={localizedHref(coachingOverview.href)}
                        aria-current={barePathname === coachingOverview.href ? "page" : undefined}
                        className={`${slideTabTriggerClass(coachingActive, isHome, isHome && megaOpen)} pr-1.5 md:pr-1.5`}
                        onFocus={() => {
                          if (coachingTabRef.current) {
                            syncSlideTabsCursor(coachingTabRef.current, setPosition);
                          }
                        }}
                      >
                        {t.nav.coaching}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={megaOpen}
                        aria-controls={coachingMenuId}
                        aria-label={coachingSubmenuLabel(megaOpen)}
                        onClick={() => (megaOpen ? closeMega() : openMega())}
                        className={`${slideTabTriggerClass(coachingActive, isHome, isHome && megaOpen)} pl-0.5 pr-2.5 md:pl-0.5 md:pr-3`}
                        onFocus={() => {
                          if (coachingTabRef.current) {
                            syncSlideTabsCursor(coachingTabRef.current, setPosition);
                          }
                        }}
                      >
                        <NavChevron open={megaOpen} />
                      </button>
                    </span>
                  </div>
                </li>

                <NavHoverTarget
                  as="link"
                  href={localizedHref("/om-oss")}
                  aria-current={barePathname === "/om-oss" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/om-oss"}
                  className={slideTabTriggerClass(barePathname === "/om-oss", isHome)}
                >
                  {t.nav.about}
                </NavHoverTarget>

                <NavHoverTarget
                  as="link"
                  href={localizedHref("/kontakt")}
                  aria-current={barePathname === "/kontakt" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/kontakt"}
                  className={slideTabTriggerClass(barePathname === "/kontakt", isHome)}
                >
                  {t.nav.contact}
                </NavHoverTarget>
              </>
            )}
          </SlideTabs>
          <Link
            href="/klient-login"
            aria-label={t.nav.loginAriaLabel}
            className={desktopHeaderActionClass(isHome)}
          >
            {t.nav.login}
          </Link>
          <LanguageMenu
            locale={locale}
            onSelect={handleLanguageChange}
            ariaLabel={t.languageSwitcher.ariaLabel}
            align="right"
            onHero={isHome}
          />
        </nav>
      </div>

      <div
        className={`relative z-[120] flex w-full items-center gap-3 px-5 md:hidden md:px-10 ${
          heroLogoOnDark ? "pb-4 pt-16" : "py-4"
        } ${mobileHeaderSurface}`}
      >
        <Link
          href={localizedHref("/")}
          className={`min-w-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset} ${
            heroLogoOnDark ? "translate-x-1" : ""
          }`}
        >
          <LogoMark
            className="block h-[4.25rem] w-auto"
            onDarkBackground={heroLogoOnDark}
            priority
          />
        </Link>
        <div
          className={`${
            heroLogoOnDark ? mobileHeaderControlClusterHero : mobileHeaderControlCluster
          } ml-auto`}
        >
          <MobileHeaderLanguageDropdown
            locale={locale}
            pathname={pathname}
            onHero={heroLogoOnDark}
          />
          <span
            aria-hidden="true"
            className={`mx-0.5 w-px ${
              heroLogoOnDark ? "h-3.5 bg-white/25" : "h-3.5 bg-zinc-900/12"
            }`}
          />
          <button
            type="button"
            aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={toggleMobileMenu}
            className={heroLogoOnDark ? mobileHeaderIconButtonHero : mobileHeaderIconButton}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>
    </header>

    <div
      className={`fixed inset-0 z-[110] overflow-hidden md:hidden motion-reduce:transition-none transition-[visibility,opacity] duration-200 ease-out ${
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
        className={`absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22.5rem)] flex-col border-l border-zinc-900/8 bg-[#f7f6f3]/98 pt-[env(safe-area-inset-top,0px)] shadow-[-16px_0_48px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-900/6 px-6 pb-5 pt-[clamp(2.25rem,9svh,4.75rem)]">
          <LogoMark className="h-11 w-auto" />
          <button
            type="button"
            aria-label={t.nav.menuClose}
            onClick={closeMobileMenu}
            className={`${mobileHeaderIconButton} border border-zinc-900/10 bg-white/60`}
          >
            <MenuIcon open />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-6">
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
              {/* Samma uppdelning som på desktop: ordet leder till sidan,
                  chevronen fäller ut de två vägarna. */}
              <div className="flex items-stretch">
                <Link
                  href={localizedHref(coachingOverview.href)}
                  aria-current={barePathname === coachingOverview.href ? "page" : undefined}
                  onClick={closeMobileMenu}
                  className={`flex-1 rounded-lg px-1 py-3 text-left text-[1.0625rem] font-medium leading-snug text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 ${
                    coachingActive ? "text-[#92753a]" : ""
                  }`}
                >
                  {t.nav.coaching}
                </Link>
                <button
                  type="button"
                  aria-expanded={mobileCoachingOpen}
                  aria-label={coachingSubmenuLabel(mobileCoachingOpen)}
                  onClick={() => setMobileCoachingOpen((prev) => !prev)}
                  className={`flex w-11 shrink-0 items-center justify-center rounded-lg text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 ${
                    coachingActive ? "text-[#92753a]" : ""
                  }`}
                >
                  <NavChevron open={mobileCoachingOpen} />
                </button>
              </div>
              <div
                className={`overflow-hidden motion-reduce:transition-none transition-[max-height,opacity] duration-200 ease-out ${
                  mobileCoachingOpen ? "max-h-[48rem] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-4 pl-1">
                  <p className={`${sectionLabelClass()} pt-2`}>{t.nav.leadershipLabel}</p>
                  <ul className="mt-2 space-y-1">
                    {coachingAudiences.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={localizedHref(item.href)}
                          aria-current={barePathname === item.href ? "page" : undefined}
                          onClick={closeMobileMenu}
                          className={mobileAudienceLinkClass}
                        >
                          <span className={mobileAudienceTitleClass}>{item.label}</span>
                          <span className={mobileAudienceDescClass}>{item.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-zinc-900/6 pt-6">
                    <p className={sectionLabelClass()}>{t.nav.startHereLabel}</p>
                    <p className="mt-4 text-sm font-medium leading-snug tracking-tight text-zinc-900">
                      {t.nav.unsureTitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{t.nav.unsureBody}</p>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <Link
                href={localizedHref("/om-oss")}
                aria-current={barePathname === "/om-oss" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/om-oss" ? "text-[#92753a]" : ""}`}
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

          <div className="mt-10 flex flex-col gap-3 border-t border-zinc-900/6 pt-8 pb-2">
            <span className="block [&>a]:flex [&>a]:w-full [&>a]:min-h-11 [&>a]:rounded-md">
              <CtaLink href={localizedHref("/kontakt")} variant="primary" onClick={closeMobileMenu}>
                {t.nav.bookFirstCall}
              </CtaLink>
            </span>
            <Link
              href="/klient-login"
              aria-label={t.nav.loginAriaLabel}
              onClick={closeMobileMenu}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]"
            >
              {t.nav.login}
            </Link>
          </div>
        </div>
      </nav>
    </div>

    {portalReady
      ? createPortal(
          <div
            ref={megaPanelRef}
            id={coachingMenuId}
            role="region"
            aria-label="Coaching"
            aria-hidden={!megaOpen}
            inert={megaOpen ? undefined : true}
            style={{ top: Math.max(0, panelTop) }}
            onMouseEnter={openMega}
            onMouseLeave={leaveMegaHoverZone}
            className={`fixed inset-x-0 z-[90] max-md:hidden ${
              megaOpen ? "" : "pointer-events-none hidden"
            }`}
          >
            <div
              aria-hidden="true"
              className="h-2 w-full"
            />
            <div
              className={
                isHome
                  ? "border-t border-white/15 bg-transparent shadow-none"
                  : "border-t border-zinc-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(24,24,27,0.12)]"
              }
            >
            <div
              className={`mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-11 ${
                isHome ? "bg-transparent" : "bg-white"
              }`}
            >
              <div className="grid gap-10 md:grid-cols-12 md:gap-x-10 lg:gap-x-14">
                <div className="md:col-span-7 lg:col-span-7">
                  <div className="mb-9 max-w-2xl lg:max-w-3xl">
                    <Link
                      href={localizedHref(coachingOverview.href)}
                      aria-current={barePathname === coachingOverview.href ? "page" : undefined}
                      className={`${megaBlockLink} ${
                        isHome
                          ? "focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/35"
                          : ""
                      }`}
                    >
                      <span
                        className={`block font-serif text-[1.5rem] font-medium leading-[1.15] tracking-[-0.02em] transition-colors duration-200 ${
                          isHome
                            ? `text-white group-hover:text-[var(--brand-gold)] ${
                                barePathname === coachingOverview.href ? "text-[var(--brand-gold)]" : ""
                              }`
                            : `text-zinc-900 group-hover:text-[#92753a] ${
                                barePathname === coachingOverview.href ? "text-[#92753a]" : ""
                              }`
                        }`}
                      >
                        {coachingOverview.label}
                      </span>
                      <span
                        className={`mt-1 block max-w-xl text-sm leading-6 transition-colors duration-200 lg:max-w-2xl ${
                          isHome
                            ? "text-white/78 group-hover:text-white/90"
                            : `${megaBlockDesc} group-hover:text-zinc-700`
                        }`}
                      >
                        {coachingOverview.text}
                      </span>
                    </Link>
                  </div>
                  <p className={sectionLabelClass()}>{t.nav.leadershipLabel}</p>
                  <ul className="mt-5 space-y-5">
                    {coachingAudiences.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={localizedHref(item.href)}
                          aria-current={barePathname === item.href ? "page" : undefined}
                          className={`${megaBlockLink} ${
                            isHome
                              ? "focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/35"
                              : ""
                          }`}
                        >
                          <span
                            className={
                              isHome
                                ? `block text-sm font-medium transition-colors duration-200 group-hover:text-[var(--brand-gold)] ${
                                    barePathname === item.href
                                      ? "text-[var(--brand-gold)]"
                                      : "text-white"
                                  }`
                                : `${megaBlockTitle} ${
                                    barePathname === item.href ? "text-[#92753a]" : ""
                                  }`
                            }
                          >
                            {item.label}
                          </span>
                          <span
                            className={
                              isHome
                                ? "mt-1 block text-sm leading-6 text-white/75 transition-colors duration-200 group-hover:text-white/88"
                                : megaBlockDesc
                            }
                          >
                            {item.text}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex min-w-0 flex-col md:col-span-5 md:pl-10 lg:col-span-5 lg:pl-14">
                  <p className={`${sectionLabelClass()} opacity-70`}>{t.nav.startHereLabel}</p>
                  <p
                    className={`mt-4 text-[0.9375rem] font-medium leading-snug tracking-tight ${
                      isHome ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {t.nav.unsureTitle}
                  </p>
                  <p
                    className={`mt-3 max-w-md text-[0.9375rem] leading-relaxed lg:max-w-lg ${
                      isHome ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {t.nav.unsureBody}
                  </p>
                  <div className="mt-6 [&>a]:rounded-full">
                    <CtaLink href={localizedHref("/kontakt")} variant="primary">
                      {t.nav.bookFirstCall}
                    </CtaLink>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>,
          document.body,
        )
      : null}
    </>
  );
}
