"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
};

export default function ParallaxController({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        const mobile = isMobile();

        const sections = root.querySelectorAll<HTMLElement>(
          "[data-parallax-section]:not([data-hero-reveal-first])"
        );
        sections.forEach((section) => {
          const shift = mobile ? 8 : 14;
          const scrubDelay = mobile ? 1 : 1.35;
          gsap.fromTo(
            section,
            { y: shift },
            {
              y: -shift,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: scrubDelay,
              },
            }
          );
        });
      }, root);

      ScrollTrigger.refresh();
    }, 32);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
