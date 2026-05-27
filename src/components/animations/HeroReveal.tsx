"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion, isMobile } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function HeroReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const mobile = isMobile();
    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
    ctx = gsap.context(() => {
      const line = el.querySelector<HTMLElement>("[data-hero-line]");
      const label = el.querySelector<HTMLElement>("[data-hero-label]");
      const headline = el.querySelector<HTMLElement>("[data-hero-headline]");
      const body = el.querySelector<HTMLElement>("[data-hero-body]");
      const ctas = el.querySelectorAll<HTMLElement>("[data-hero-cta]");

      const tl = gsap.timeline();

      if (line) {
        tl.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.7, ease: "power3.inOut" },
          0
        );
      }

      if (label) {
        tl.fromTo(
          label,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.55, ease: "power3.out" },
          0.15
        );
      }

      if (headline) {
        if (mobile) {
          tl.fromTo(
            headline,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
            0.25
          );
        } else {
          tl.fromTo(
            headline,
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "power3.inOut" },
            0.3
          );
        }
      }

      if (body) {
        tl.fromTo(
          body,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          mobile ? 0.55 : 0.88
        );
      }

      if (ctas.length) {
        tl.fromTo(
          ctas,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.09 },
          mobile ? 0.7 : 1.08
        );
      }
    }, ref);
    }, 32);

    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
