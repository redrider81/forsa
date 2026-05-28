"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

type Variant = "fadeUp" | "splitColumn" | "staggerList" | "ctaStack";

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
        const paragraphs = right?.querySelectorAll<HTMLElement>("[data-col-paragraph]");
        const rightHasCards = Boolean(right?.querySelector("[data-card]"));

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });

        if (left) {
          tl.from(left, {
            opacity: 0,
            x: -22,
            duration: 0.75,
            ease: "power3.out",
          });
        }

        if (right && !rightHasCards) {
          if (paragraphs?.length) {
            tl.from(
              paragraphs,
              {
                opacity: 0,
                y: 16,
                duration: 0.55,
                ease: "power3.out",
                stagger: 0.1,
              },
              "-=0.4",
            );
          } else {
            tl.from(
              right,
              {
                opacity: 0,
                y: 20,
                duration: 0.65,
                ease: "power3.out",
              },
              "-=0.4",
            );
          }
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

      if (variant === "ctaStack") {
        const heading = el.querySelector<HTMLElement>("[data-cta-heading]");
        const body = el.querySelector<HTMLElement>("[data-cta-body]");
        const actions = el.querySelector<HTMLElement>("[data-cta-actions]");

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });

        if (heading) {
          tl.from(heading, {
            opacity: 0,
            y: 26,
            duration: 0.75,
            ease: "power3.out",
          });
        }

        if (body) {
          tl.from(
            body,
            {
              opacity: 0,
              y: 18,
              duration: 0.6,
              ease: "power3.out",
            },
            "-=0.4",
          );
        }

        if (actions) {
          tl.from(
            actions,
            {
              opacity: 0,
              y: 14,
              duration: 0.55,
              ease: "power2.out",
            },
            "-=0.32",
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
