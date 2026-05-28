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
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

const coachingPaths = [
  "/executive-coaching",
  "/ledningsgruppscoaching",
  "/individuell-coaching",
  "/team-coaching",
  "/coachande-ledarskap",
] as const;

const coachingAudiences = [
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
] as const;

const coachingServices = [
  { href: "/ledningsgruppscoaching", label: "Ledningsgruppscoaching" },
  { href: "/executive-coaching", label: "Executive coaching" },
  { href: "/individuell-coaching", label: "Individuell coaching" },
  { href: "/team-coaching", label: "Team coaching" },
  { href: "/coachande-ledarskap", label: "Coachande ledarskap" },
] as const;

const mobileCoachingLinks = [
  ...coachingAudiences.map((item) => ({ href: item.href, label: item.label })),
  ...coachingServices.map((item) => ({ href: item.href, label: item.label })),
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
  const headerRef = useRef<HTMLElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const coachingTabRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachingMenuId = useId();
  const [megaOpen, setMegaOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const coachingActive = isCoachingActive(pathname);
  const isHome = pathname === "/";

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

  const headerSurface = isHome
    ? megaOpen
      ? "border-zinc-900/10 bg-white/40"
      : "border-transparent bg-transparent"
    : "border-zinc-200/80 bg-zinc-50/90";

  const logoRingOffset = isHome
    ? "focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-zinc-100";

  return (
    <header
      ref={headerRef}
      className={`isolate z-[100] w-full backdrop-blur-[2px] transition-[background-color,border-color] duration-150 ${
        isHome ? `absolute left-0 right-0 top-0 ${headerSurface}` : `sticky top-0 border-b ${headerSurface}`
      }`}
    >
      <div className="hidden w-full items-center justify-between px-6 py-5 md:flex md:px-10 lg:px-14 lg:py-6">
        <Link
          href="/"
          className={`shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          <span className="block text-lg font-semibold tracking-[0.22em] text-zinc-900 lg:text-xl">FORSA</span>
        </Link>

        <nav aria-label="Huvudnavigation" className="ml-auto">
          <DesktopNavTabs pathname={pathname} coachingActive={coachingActive}>
            {({ listRef, setPosition }) => (
              <>
                <NavHoverTarget
                  as="link"
                  href="/"
                  aria-current={pathname === "/" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={pathname === "/"}
                  className={navTabClass(pathname === "/", isHome)}
                >
                  Start
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
                      Coaching
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
                    <p className={sectionLabelClass()}>För ledningen</p>
                    <ul className="mt-4 space-y-5">
                      {coachingAudiences.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={pathname === item.href ? "page" : undefined}
                            className={megaBlockLink}
                          >
                            <span
                              className={`${megaBlockTitle} ${
                                pathname === item.href ? "text-[#92753a]" : ""
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
                    <p className={sectionLabelClass()}>Coaching</p>
                    <ul className="mt-4 space-y-2.5">
                      {coachingServices.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={pathname === item.href ? "page" : undefined}
                            className={megaTextLink}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex max-w-[16rem] flex-col md:max-w-none">
                    <p className={sectionLabelClass()}>Börja här</p>
                    <p className="mt-4 text-sm font-medium leading-snug tracking-tight text-zinc-900">
                      Osäker på vilket stöd som passar?
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      Boka ett första konfidentiellt samtal så ringar vi in var ledningen behöver
                      mest klarhet.
                    </p>
                    <div className="mt-6">
                      <CtaLink href="/kontakt" variant="secondary">
                        Boka ett första samtal →
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
                  href="/om-forsa"
                  aria-current={pathname === "/om-forsa" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={pathname === "/om-forsa"}
                  className={navTabClass(pathname === "/om-forsa", isHome)}
                >
                  Om Forsa
                </NavHoverTarget>

                <li aria-hidden="true" className="flex list-none items-center px-0.5">
                  <span className="h-4 w-px bg-zinc-900/15" />
                </li>

                <NavHoverTarget
                  as="link"
                  href="/kontakt"
                  aria-current={pathname === "/kontakt" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={pathname === "/kontakt"}
                  className={navTabClass(pathname === "/kontakt", isHome)}
                >
                  Kontakt
                </NavHoverTarget>
              </>
            )}
          </DesktopNavTabs>
        </nav>
      </div>

      <div className="flex w-full items-center justify-between border-b border-zinc-900/5 px-6 py-5 md:hidden md:px-10">
        <Link
          href="/"
          className={`text-lg font-semibold tracking-[0.22em] text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          FORSA
        </Link>
      </div>

      <nav
        aria-label="Mobil navigation"
        className={`border-t px-6 py-4 md:hidden ${
          isHome ? "border-zinc-900/10 bg-white/30 backdrop-blur-sm" : "border-zinc-300"
        }`}
      >
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`inline-flex rounded-full px-3 py-1.5 ${
                pathname === "/"
                  ? "bg-zinc-200 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              Start
            </Link>
          </li>
          <li>
            <details className="group">
              <summary
                className={`cursor-pointer list-none rounded-full px-3 py-1.5 marker:content-none ${
                  coachingActive
                    ? "bg-zinc-200 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  Coaching
                  <span
                    aria-hidden="true"
                    className="text-xs text-zinc-500 transition group-open:rotate-180"
                  >
                    ▾
                  </span>
                </span>
              </summary>
              <ul className="mt-2 space-y-1 border-l border-zinc-300 pl-4">
                {mobileCoachingLinks.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`inline-flex rounded-full px-3 py-1.5 ${
                        pathname === item.href
                          ? "bg-zinc-200 text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <Link
              href="/om-forsa"
              aria-current={pathname === "/om-forsa" ? "page" : undefined}
              className={`inline-flex rounded-full px-3 py-1.5 ${
                pathname === "/om-forsa"
                  ? "bg-zinc-200 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              Om Forsa
            </Link>
          </li>
          <li>
            <Link
              href="/kontakt"
              aria-current={pathname === "/kontakt" ? "page" : undefined}
              className={`inline-flex rounded-full px-3 py-1.5 ${
                pathname === "/kontakt"
                  ? "bg-zinc-200 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              Kontakt
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
