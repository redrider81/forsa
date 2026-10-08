import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isMobile = (): boolean =>
  typeof window !== "undefined" && window.innerWidth < 768;

export const motion = {
  ease: {
    reveal: "power4.out",
    revealSoft: "power3.out",
    image: "power2.out",
    editorial: "power2.inOut",
    exit: "power2.in",
    drift: "none",
    hero: "expo.out",
  },
  duration: {
    short: 0.48,
    medium: 0.62,
    long: 0.78,
    hero: 1.08,
    image: 1.15,
  },
  reveal: {
    start: "top 86%",
    startImage: "top 88%",
    startImageMobile: "top 94%",
    y: 18,
    ySoft: 11,
    yImage: 22,
    yImageMobile: 28,
    x: 14,
    scaleFrom: 0.985,
  },
  opacity: {
    imageFrom: 0.72,
    imageFromMobile: 0.62,
    heroFrom: 0.88,
  },
  scale: {
    imageFrom: 1.02,
    heroFrom: 1.045,
  },
  parallax: {
    imageYPercent: { mobile: 5, desktop: 7 },
    imageYPercentNested: { mobile: 3.5, desktop: 5 },
    scrubImage: { mobile: 1.1, desktop: 1.35 },
    imageScale: 1.09,
    heroContentScrub: 0.9,
  },
  /**
   * Startsidan: tydligare men fortfarande redaktionella entréer. Övriga sidor
   * använder de mjukare grundvärdena ovan.
   */
  home: {
    y: { desktop: 34, mobile: 20 },
    yText: { desktop: 24, mobile: 14 },
    x: 26,
    duration: { heading: 1.05, text: 0.9, item: 0.75, media: 1.3 },
    stagger: { text: 0.12, item: 0.08, card: 0.16 },
    ease: { heading: "power4.out", text: "power3.out", media: "power3.inOut", settle: "power2.out" },
    mediaScaleFrom: 1.07,
  },
} as const;

/** Startsidans förflyttningar: kortare på mobil, där innehållet staplas. */
export function homeTravel() {
  const mobile = isMobile();
  return {
    mobile,
    y: mobile ? motion.home.y.mobile : motion.home.y.desktop,
    yText: mobile ? motion.home.yText.mobile : motion.home.yText.desktop,
    /** Horisontell entré används bara när kolumnerna faktiskt står bredvid varandra. */
    x: mobile ? 0 : motion.home.x,
  };
}

/** Bild som avtäcks nedifrån; ramen och beskärningen är oförändrade i slutläget. */
export function homeMediaReveal(media: HTMLElement, scaleImage = true): gsap.core.Timeline {
  const img = scaleImage ? media.querySelector<HTMLElement>("img") : null;
  const tl = gsap.timeline();
  tl.fromTo(
    media,
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: motion.home.duration.media,
      ease: motion.home.ease.media,
      clearProps: "clipPath",
    },
    0,
  );
  if (img) {
    tl.fromTo(
      img,
      { scale: motion.home.mediaScaleFrom },
      {
        scale: 1,
        duration: motion.home.duration.media + 0.35,
        ease: motion.home.ease.settle,
        force3D: true,
        clearProps: "transform",
      },
      0,
    );
  }
  return tl;
}

export function revealScrollTrigger(
  trigger: Element | string,
  overrides?: Partial<ScrollTrigger.Vars>,
): ScrollTrigger.Vars {
  // Ingen fastScrollEnd: vid snabb scroll uppåt förbi start satte den
  // entréanimationen till progress(0) och pausade den, så att innehåll längst
  // ned på sidan (som aldrig når sitt slutläge) blev dolt igen.
  return {
    trigger,
    start: motion.reveal.start,
    once: true,
    ...overrides,
  };
}

export function parallaxScrollTrigger(
  trigger: Element | string,
  overrides?: Partial<ScrollTrigger.Vars>,
): ScrollTrigger.Vars {
  return {
    trigger,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    invalidateOnRefresh: true,
    ...overrides,
  };
}

/** Ensure elements are never left invisible after unmount / failed tween. */
export function showTargets(targets: gsap.TweenTarget): void {
  gsap.set(targets, { autoAlpha: 1, y: 0, x: 0, scale: 1, clearProps: "transform,opacity,visibility" });
}

/** Reset window scroll without smooth-scroll side effects. */
export function resetRouteScroll(): void {
  if (typeof window === "undefined") return;

  const html = document.documentElement;
  const body = document.body;
  const previousHtml = html.style.scrollBehavior;
  const previousBody = body.style.scrollBehavior;

  html.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  html.scrollTop = 0;
  body.scrollTop = 0;
  window.scrollTo(0, 0);

  html.style.scrollBehavior = previousHtml;
  body.style.scrollBehavior = previousBody;
}

/**
 * Refresh ScrollTriggers and make sure reveals that are already in the viewport,
 * or were passed without scrolling (hash links, restored positions), never stay hidden.
 */
export function refreshScrollTriggers(): void {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh(true);

  ScrollTrigger.getAll().forEach((st) => {
    const animation = st.animation;
    if (!st.vars.once || !animation) return;
    // Already playing or finished: let it complete naturally instead of snapping.
    if (animation.progress() > 0) return;

    const trigger = st.trigger;
    if (trigger instanceof Element) {
      // Use live geometry, not st.start: a timeline-attached ScrollTrigger reports
      // start = end = 0 until GSAP's next tick, which previously made every
      // timeline reveal on the page look "scrolled past" at mount and complete
      // off-screen before the visitor ever reached it.
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom <= 0) {
        animation.progress(1);
      } else if (rect.top < window.innerHeight * 0.92) {
        animation.play();
      }
      return;
    }

    const positionsReady = st.end > st.start;
    if (positionsReady && st.scroll() >= st.start) animation.play();
  });
}

/** Run reveal completion after layout, fonts and late-loading media. */
export function scheduleScrollRevealRefresh(): void {
  refreshScrollTriggers();
  requestAnimationFrame(() => {
    refreshScrollTriggers();
  });
  if (document.readyState === "complete") {
    requestAnimationFrame(() => refreshScrollTriggers());
  } else {
    window.addEventListener("load", () => refreshScrollTriggers(), { once: true });
  }
}

export function bindParallaxRefresh(onRefresh: () => void, delayMs = 200): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastWidth = window.innerWidth;

  const handler = () => {
    // Ignore mobile URL-bar show/hide, which only changes viewport height while
    // scrolling. Reacting to those would re-run refresh logic mid-scroll.
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    if (timer) clearTimeout(timer);
    timer = setTimeout(onRefresh, delayMs);
  };

  window.addEventListener("resize", handler);
  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener("resize", handler);
  };
}
