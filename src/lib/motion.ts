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
} as const;

export function revealScrollTrigger(
  trigger: Element | string,
  overrides?: Partial<ScrollTrigger.Vars>,
): ScrollTrigger.Vars {
  return {
    trigger,
    start: motion.reveal.start,
    once: true,
    fastScrollEnd: true,
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

/** Refresh ScrollTriggers and complete reveals already in the viewport or passed on scroll. */
export function refreshScrollTriggers(): void {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh(true);

  ScrollTrigger.getAll().forEach((st) => {
    if (!st.vars.once || !st.animation) return;

    const scroll = st.scroll();
    const start = st.start;
    const trigger = st.trigger;

    let intersectsViewport = false;
    if (trigger instanceof Element) {
      const rect = trigger.getBoundingClientRect();
      intersectsViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    }

    const scrolledPastStart = typeof start === "number" && scroll >= start;

    if (intersectsViewport || scrolledPastStart) {
      st.animation.progress(1);
    }
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
