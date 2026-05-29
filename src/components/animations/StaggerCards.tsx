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

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function StaggerCards({ children, className, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    const accents = el.querySelectorAll<HTMLElement>("[data-card-accent]");

    if (prefersReducedMotion()) {
      showTargets(cards);
      if (accents.length) gsap.set(accents, { clearProps: "transform" });
      return;
    }

    if (!cards.length) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0, y: 18, force3D: true });
      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: motion.duration.long,
        ease: motion.ease.reveal,
        stagger: 0.09,
        force3D: true,
        scrollTrigger: revealScrollTrigger(el),
      });

      if (accents.length) {
        gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
        gsap.to(accents, {
          scaleX: 1,
          duration: motion.duration.medium,
          ease: motion.ease.reveal,
          stagger: 0.09,
          force3D: true,
          scrollTrigger: revealScrollTrigger(el),
        });
      }

      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx?.revert();
      showTargets(cards);
    };
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
