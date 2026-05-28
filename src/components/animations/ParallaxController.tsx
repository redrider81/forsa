"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  bindParallaxRefresh,
  isMobile,
  motion,
  parallaxScrollTrigger,
  prefersReducedMotion,
  refreshScrollTriggers,
} from "@/lib/motion";

type Props = {
  children: ReactNode;
};

export default function ParallaxController({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    let ctx: gsap.Context | undefined;

    ctx = gsap.context(() => {
      const mobile = isMobile();
      const shift = mobile
        ? motion.parallax.imageYPercent.mobile
        : motion.parallax.imageYPercent.desktop;
      const nestedShift = mobile
        ? motion.parallax.imageYPercentNested.mobile
        : motion.parallax.imageYPercentNested.desktop;
      const scrub = mobile
        ? motion.parallax.scrubImage.mobile
        : motion.parallax.scrubImage.desktop;

      root.querySelectorAll<HTMLElement>("[data-parallax-image]:not([data-hero-image])").forEach(
        (block) => {
          const inner = block.querySelector<HTMLElement>("[data-editorial-image]");
          if (!inner) return;

          const nested = Boolean(block.closest("[data-parallax-section]"));
          const amount = nested ? nestedShift : shift;

          gsap.set(inner, { yPercent: -amount, force3D: true });
          gsap.to(inner, {
            yPercent: amount,
            ease: motion.ease.drift,
            force3D: true,
            scrollTrigger: parallaxScrollTrigger(block, { scrub }),
          });
        },
      );

      refreshScrollTriggers();
    }, root);

    const unbindRefresh = bindParallaxRefresh(() => refreshScrollTriggers());

    return () => {
      unbindRefresh();
      ctx?.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
