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
    editorial: "power3.inOut",
    exit: "power2.in",
    drift: "none",
  },
  duration: {
    short: 0.55,
    medium: 0.75,
    long: 0.9,
    hero: 0.95,
    image: 1,
  },
  reveal: {
    start: "top 88%",
    y: 22,
    ySoft: 14,
    x: 18,
  },
  parallax: {
    imageYPercent: { mobile: 3, desktop: 5 },
    imageYPercentNested: { mobile: 2, desktop: 3.5 },
    scrubImage: { mobile: 0.85, desktop: 1 },
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

  const handler = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onRefresh, delayMs);
  };

  window.addEventListener("resize", handler);
  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener("resize", handler);
  };
}
