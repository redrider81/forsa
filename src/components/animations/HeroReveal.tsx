"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { isMobile, motion, prefersReducedMotion, showTargets } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const heroSelectors =
  "[data-hero-line], [data-hero-label], [data-hero-headline], [data-hero-body], [data-hero-cta]";

export default function HeroReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const line = el.querySelector<HTMLElement>("[data-hero-line]");
    const label = el.querySelector<HTMLElement>("[data-hero-label]");
    const headline = el.querySelector<HTMLElement>("[data-hero-headline]");
    const body = el.querySelector<HTMLElement>("[data-hero-body]");
    const ctas = el.querySelectorAll<HTMLElement>("[data-hero-cta]");
    const all = el.querySelectorAll(heroSelectors);

    if (prefersReducedMotion()) {
      showTargets(all);
      return;
    }

    const mobile = isMobile();
    const ctx = gsap.context(() => {
      if (line) gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
      if (label) gsap.set(label, { clipPath: "inset(100% 0 0 0)", autoAlpha: 0 });
      if (headline) {
        if (mobile) {
          gsap.set(headline, { autoAlpha: 0, y: 18, force3D: true });
        } else {
          gsap.set(headline, { clipPath: "inset(0 100% 0 0)", autoAlpha: 1 });
        }
      }
      if (body) gsap.set(body, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
      if (ctas.length) gsap.set(ctas, { autoAlpha: 0, y: 12, force3D: true });

      const tl = gsap.timeline({ defaults: { ease: motion.ease.reveal } });

      if (line) {
        tl.to(line, { scaleX: 1, duration: 0.72, ease: motion.ease.editorial }, 0);
      }
      if (label) {
        tl.to(
          label,
          {
            clipPath: "inset(0% 0 0 0)",
            autoAlpha: 1,
            duration: 0.58,
            ease: motion.ease.revealSoft,
          },
          0.1,
        );
      }
      if (headline) {
        if (mobile) {
          tl.to(
            headline,
            { autoAlpha: 1, y: 0, duration: motion.duration.long, ease: motion.ease.reveal },
            0.2,
          );
        } else {
          tl.to(
            headline,
            {
              clipPath: "inset(0 0% 0 0)",
              duration: motion.duration.hero,
              ease: motion.ease.editorial,
            },
            0.26,
          );
        }
      }
      if (body) {
        tl.to(
          body,
          { autoAlpha: 1, y: 0, duration: motion.duration.medium, ease: motion.ease.reveal },
          mobile ? 0.48 : 0.85,
        );
      }
      if (ctas.length) {
        tl.to(
          ctas,
          {
            autoAlpha: 1,
            y: 0,
            duration: motion.duration.short,
            ease: motion.ease.reveal,
            stagger: 0.09,
          },
          mobile ? 0.62 : 1,
        );
      }
    }, ref);

    return () => {
      ctx?.revert();
      showTargets(all);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
