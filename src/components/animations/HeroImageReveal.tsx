"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { motion, prefersReducedMotion } from "@/lib/motion";

const HERO_IMAGE_FROM = 0;

type Props = {
  children: ReactNode;
  className?: string;
};

export default function HeroImageReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: HERO_IMAGE_FROM },
        {
          opacity: 1,
          duration: motion.duration.hero,
          ease: motion.ease.revealSoft,
          force3D: true,
        },
      );
    }, ref);

    return () => {
      ctx?.revert();
      gsap.set(el, { opacity: 1 });
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: HERO_IMAGE_FROM }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
