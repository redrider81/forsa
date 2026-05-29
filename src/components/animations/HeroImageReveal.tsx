"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { motion, prefersReducedMotion } from "@/lib/motion";

const HERO_IMAGE_FROM = motion.opacity.heroFrom;
const HERO_SCALE_FROM = motion.scale.heroFrom;

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
      gsap.set(el, { opacity: 1, scale: 1, clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: HERO_IMAGE_FROM, scale: HERO_SCALE_FROM },
        {
          opacity: 1,
          scale: 1,
          duration: motion.duration.hero,
          ease: motion.ease.revealSoft,
          force3D: true,
          clearProps: "transform",
        },
      );
    }, ref);

    return () => {
      ctx?.revert();
      gsap.set(el, { opacity: 1, scale: 1, clearProps: "transform" });
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: HERO_IMAGE_FROM, transform: `scale(${HERO_SCALE_FROM})` }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
