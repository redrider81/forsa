"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

type Variant = "fadeUp" | "splitColumn" | "staggerList" | "ctaStack";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: Variant;
};

const childSelectors =
  "[data-list-item], [data-cta-heading], [data-cta-body], [data-cta-actions], [data-col-left], [data-col-right], [data-col-paragraph]";

export default function ScrollReveal({
  children,
  variant = "fadeUp",
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const childrenTargets = el.querySelectorAll(childSelectors);

    if (prefersReducedMotion()) {
      showTargets([el, ...childrenTargets]);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (variant === "fadeUp") {
        gsap.set(el, { autoAlpha: 0, y: motion.reveal.y, force3D: true });
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.long,
          ease: motion.ease.reveal,
          force3D: true,
          scrollTrigger: revealScrollTrigger(el),
        });
      }

      if (variant === "splitColumn") {
        const left = el.querySelector<HTMLElement>("[data-col-left]");
        const right = el.querySelector<HTMLElement>("[data-col-right]");
        const paragraphs = right?.querySelectorAll<HTMLElement>("[data-col-paragraph]");
        const rightHasCards = Boolean(right?.querySelector("[data-card]"));
        const rightHasListItems = Boolean(right?.querySelector("[data-list-item]"));

        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(el) });

        if (left) {
          gsap.set(left, { autoAlpha: 0, x: -motion.reveal.x, force3D: true });
          tl.to(left, {
            autoAlpha: 1,
            x: 0,
            duration: motion.duration.long,
            ease: motion.ease.reveal,
            force3D: true,
          });
        }

        if (right && !rightHasCards && !rightHasListItems) {
          if (paragraphs?.length) {
            gsap.set(paragraphs, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
            tl.to(
              paragraphs,
              {
                autoAlpha: 1,
                y: 0,
                duration: motion.duration.medium,
                ease: motion.ease.reveal,
                stagger: 0.1,
                force3D: true,
              },
              left ? "-=0.45" : 0,
            );
          } else {
            gsap.set(right, { autoAlpha: 0, y: motion.reveal.ySoft + 2, force3D: true });
            tl.to(
              right,
              {
                autoAlpha: 1,
                y: 0,
                duration: motion.duration.medium,
                ease: motion.ease.reveal,
                force3D: true,
              },
              left ? "-=0.45" : 0,
            );
          }
        }
      }

      if (variant === "staggerList") {
        const items = el.querySelectorAll<HTMLElement>("[data-list-item]");
        if (items.length) {
          gsap.set(items, { autoAlpha: 0, x: -12, force3D: true });
          gsap.to(items, {
            autoAlpha: 1,
            x: 0,
            duration: motion.duration.medium,
            ease: motion.ease.reveal,
            stagger: 0.08,
            force3D: true,
            scrollTrigger: revealScrollTrigger(el),
          });
        }
      }

      if (variant === "ctaStack") {
        const heading = el.querySelector<HTMLElement>("[data-cta-heading]");
        const body = el.querySelector<HTMLElement>("[data-cta-body]");
        const actions = el.querySelector<HTMLElement>("[data-cta-actions]");

        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(el) });

        if (heading) {
          gsap.set(heading, { autoAlpha: 0, y: motion.reveal.y, force3D: true });
          tl.to(heading, {
            autoAlpha: 1,
            y: 0,
            duration: motion.duration.long,
            ease: motion.ease.reveal,
            force3D: true,
          });
        }
        if (body) {
          gsap.set(body, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
          tl.to(
            body,
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.duration.medium,
              ease: motion.ease.reveal,
              force3D: true,
            },
            "-=0.48",
          );
        }
        if (actions) {
          gsap.set(actions, { autoAlpha: 0, y: 10, force3D: true });
          tl.to(
            actions,
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.duration.short,
              ease: motion.ease.revealSoft,
              force3D: true,
            },
            "-=0.35",
          );
        }
      }

      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx?.revert();
      showTargets([el, ...childrenTargets]);
    };
  }, [variant]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
