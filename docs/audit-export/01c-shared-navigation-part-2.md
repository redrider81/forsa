# 01c — Shared public navigation (part 2 of 2)

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

`src/components/site-navigation.tsx` lines 521–1037. Continued from 01b.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/components/site-navigation.tsx (lines 521–1037)

### Affected route(s)
shared — all public routes

Lines 521–1037 of 1037.

### Current source

```tsx
          ease: motion.ease.reveal,
          force3D: true,
        },
      );
    });

    return () => {
      ctx?.revert();
      showTargets(el);
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
          { opacity: 0, y: -8 },
          {
            opacity: 1,
            y: 0,
            duration: motion.duration.short,
            ease: motion.ease.revealSoft,
            overwrite: "auto",
          },
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
          y: -6,
          duration: 0.26,
          ease: motion.ease.exit,
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
          <LogoMark className="block h-[4.25rem] w-auto translate-y-1 lg:h-20" priority />
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
                <div className="grid gap-8 md:grid-cols-[1fr_0.7fr] md:gap-10">
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

                  <div className="flex max-w-[16rem] flex-col md:max-w-none">
                    <p className={sectionLabelClass()}>{t.nav.startHereLabel}</p>
                    <p className="mt-4 text-sm font-medium leading-snug tracking-tight text-zinc-900">
                      {t.nav.unsureTitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {t.nav.unsureBody}
                    </p>
                    <div className="mt-6">
                      <CtaLink href={localizedHref("/kontakt")} variant="primary">
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
                  href={localizedHref("/om-oss")}
                  aria-current={barePathname === "/om-oss" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/om-oss"}
                  className={navTabClass(barePathname === "/om-oss", isHome)}
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
                  className={navTabClass(barePathname === "/kontakt", isHome)}
                >
                  {t.nav.contact}
                </NavHoverTarget>
                <li className="list-none">
                  <Link
                    href="/klient-login"
                    className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-700 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white transition-colors duration-200 hover:bg-zinc-600 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 ${
                      isHome
                        ? "focus-visible:ring-offset-white/40"
                        : "focus-visible:ring-offset-zinc-100"
                    }`}
                  >
                    <LoginIcon />
                    {t.nav.login}
                  </Link>
                </li>
                <li className="list-none">
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
          className={`min-w-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          <LogoMark className="mt-1 block h-14 w-auto" priority />
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
        className={`absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22.5rem)] flex-col border-l border-zinc-900/8 bg-[#f7f6f3]/98 shadow-[-16px_0_48px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-900/6 px-6 py-5">
          <LogoMark className="h-8 w-auto" />
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
            <span className="block [&>a]:flex [&>a]:w-full [&>a]:min-h-11">
              <CtaLink href={localizedHref("/kontakt")} variant="primary" onClick={closeMobileMenu}>
                {t.nav.bookFirstCall}
              </CtaLink>
            </span>
            <Link
              href="/klient-login"
              onClick={closeMobileMenu}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]"
            >
              <LoginIcon />
              {t.nav.login}
            </Link>
          </div>
        </div>
      </nav>
    </div>
    </>
  );
}
```
