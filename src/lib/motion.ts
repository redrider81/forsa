import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isMobile = (): boolean =>
  typeof window !== "undefined" && window.innerWidth < 768;

export const motion = {
  ease: {
    reveal: "power3.out",
    revealSoft: "power2.out",
    image: "sine.out",
    editorial: "power3.inOut",
    exit: "power2.in",
    drift: "none",
  },
  duration: {
    short: 0.55,
    medium: 0.75,
    long: 0.9,
    hero: 0.95,
    image: 1.25,
  },
  reveal: {
    start: "top 88%",
    startImage: "top 90%",
    startImageMobile: "top 96%",
    y: 22,
    ySoft: 14,
    yImage: 26,
    yImageMobile: 34,
    x: 18,
  },
  opacity: {
    imageFrom: 0.65,
    imageFromMobile: 0.55,
    heroFrom: 0.8,
  },
  scale: {
    imageFrom: 1.02,
    heroFrom: 1.015,
  },
  parallax: {
    imageYPercent: { mobile: 6, desktop: 6 },
    imageYPercentNested: { mobile: 4, desktop: 4 },
    scrubImage: { mobile: 0.85, desktop: 1 },
    imageScale: 1.14,
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

/** Refresh ScrollTriggers and complete reveals already in the viewport. */
export function refreshScrollTriggers(): void {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
  ScrollTrigger.getAll().forEach((st) => {
    if (!st.vars.once || !st.animation) return;
    const trigger = st.trigger;
    if (!(trigger instanceof Element)) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      st.animation.progress(1);
    }
  });
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
