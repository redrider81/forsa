export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isMobile = (): boolean =>
  typeof window !== "undefined" && window.innerWidth < 768;
