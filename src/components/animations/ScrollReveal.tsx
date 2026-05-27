"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

type Variant = "fadeUp" | "splitColumn" | "staggerList";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: Variant;
};

export default function ScrollReveal({
  children,
  variant = "fadeUp",
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
    ctx = gsap.context(() => {
      if (variant === "fadeUp") {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          }
        );
      }

      if (variant === "splitColumn") {
        const left = el.querySelector<HTMLElement>("[data-col-left]");
        const right = el.querySelector<HTMLElement>("[data-col-right]");

        if (left) {
          gsap.fromTo(
            left,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            }
          );
        }

        if (right) {
          gsap.fromTo(
            right,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              delay: 0.15,
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            }
          );
        }
      }

      if (variant === "staggerList") {
        const items = el.querySelectorAll<HTMLElement>("[data-list-item]");
        if (items.length) {
          gsap.fromTo(
            items,
            { opacity: 0, x: -16 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              ease: "power2.out",
              stagger: 0.07,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }
          );
        }
      }
    }, ref);
    }, 32);

    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, [variant]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
