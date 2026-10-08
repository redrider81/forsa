"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  homeTravel,
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Startsidan: tydligare entréer; på desktop glider index och brödtext in från var sin sida. */
  emphasis?: boolean;
};

export default function EditorialRowsReveal({
  children,
  emphasis = false,
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const label = el.querySelector<HTMLElement>("[data-section-label]");
    const heading = el.querySelector<HTMLElement>("[data-section-heading]");
    const intro = el.querySelector<HTMLElement>("[data-section-intro]");
    const rows = el.querySelectorAll<HTMLElement>("[data-editorial-row]");
    const rowParts = el.querySelectorAll(
      "[data-row-index], [data-row-title], [data-row-body]",
    );
    const targets = [label, heading, intro, ...rows, ...rowParts].filter(Boolean) as Element[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    if (!heading && !rows.length) return;

    // Grundvärdena är oförändrade för övriga sidor; emphasis används på startsidan.
    const travel = homeTravel();
    const v = emphasis
      ? {
          headingY: travel.y,
          headingDuration: motion.home.duration.heading,
          headingEase: motion.home.ease.heading,
          indexX: -(travel.x * 0.7 || 10),
          titleY: travel.y,
          titleScale: 1,
          bodyX: travel.x,
          bodyY: travel.x ? 0 : travel.yText,
          short: motion.home.duration.item,
          medium: motion.home.duration.text,
          ease: motion.home.ease.heading,
          easeSoft: motion.home.ease.text,
          titleAt: "-=0.5",
          bodyAt: "-=0.72",
        }
      : {
          headingY: motion.reveal.ySoft,
          headingDuration: motion.duration.long,
          headingEase: motion.ease.reveal,
          indexX: -8,
          titleY: motion.reveal.ySoft,
          titleScale: motion.reveal.scaleFrom,
          bodyX: 0,
          bodyY: motion.reveal.ySoft,
          short: motion.duration.short,
          medium: motion.duration.medium,
          ease: motion.ease.reveal,
          easeSoft: motion.ease.revealSoft,
          titleAt: "-=0.32",
          bodyAt: "-=0.28",
        };

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (heading) {
        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(label ?? heading) });
        if (label) {
          gsap.set(label, { autoAlpha: 0, y: v.bodyY || v.headingY * 0.5, force3D: true });
          tl.to(label, { autoAlpha: 1, y: 0, duration: v.medium, ease: v.easeSoft, force3D: true }, 0);
        }
        gsap.set(heading, { autoAlpha: 0, y: v.headingY, force3D: true });
        tl.to(
          heading,
          {
            autoAlpha: 1,
            y: 0,
            duration: v.headingDuration,
            ease: v.headingEase,
            force3D: true,
          },
          label ? 0.12 : 0,
        );
      }

      if (intro) {
        gsap.set(intro, { autoAlpha: 0, y: v.titleY * 0.7, force3D: true });
        gsap.to(intro, {
          autoAlpha: 1,
          y: 0,
          duration: v.medium,
          ease: v.easeSoft,
          delay: 0.2,
          force3D: true,
          scrollTrigger: revealScrollTrigger(intro),
        });
      }

      rows.forEach((row) => {
        const index = row.querySelector<HTMLElement>("[data-row-index]");
        const title = row.querySelector<HTMLElement>("[data-row-title]");
        const body = row.querySelector<HTMLElement>("[data-row-body]");

        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(row) });

        if (index) {
          gsap.set(index, { autoAlpha: 0, x: v.indexX, force3D: true });
          tl.to(index, {
            autoAlpha: 1,
            x: 0,
            duration: v.short,
            ease: v.easeSoft,
            force3D: true,
          });
        }
        if (title) {
          gsap.set(title, {
            autoAlpha: 0,
            y: v.titleY,
            scale: v.titleScale,
            force3D: true,
          });
          tl.to(
            title,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: v.medium,
              ease: v.ease,
              force3D: true,
            },
            v.titleAt,
          );
        }
        if (body) {
          gsap.set(body, { autoAlpha: 0, x: v.bodyX, y: v.bodyY, force3D: true });
          tl.to(
            body,
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: v.medium,
              ease: v.easeSoft,
              force3D: true,
            },
            v.bodyAt,
          );
        }
      });

      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx?.revert();
      showTargets(targets);
    };
  }, [emphasis]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
