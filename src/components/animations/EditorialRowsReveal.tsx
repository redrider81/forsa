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

export default function EditorialRowsReveal({ children, className, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const heading = el.querySelector<HTMLElement>("[data-section-heading]");
    const rows = el.querySelectorAll<HTMLElement>("[data-editorial-row]");
    const rowParts = el.querySelectorAll(
      "[data-row-index], [data-row-title], [data-row-body]",
    );

    if (prefersReducedMotion()) {
      showTargets([heading, ...rows, ...rowParts].filter(Boolean));
      return;
    }

    if (!heading && !rows.length) return;

    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;

    ctx = gsap.context(() => {
      if (heading) {
        gsap.set(heading, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
        gsap.to(heading, {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.long,
          ease: motion.ease.reveal,
          force3D: true,
          scrollTrigger: revealScrollTrigger(heading),
        });
      }

      rows.forEach((row) => {
        const index = row.querySelector<HTMLElement>("[data-row-index]");
        const title = row.querySelector<HTMLElement>("[data-row-title]");
        const body = row.querySelector<HTMLElement>("[data-row-body]");

        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(row) });

        if (index) {
          gsap.set(index, { autoAlpha: 0, x: -8, force3D: true });
          tl.to(index, {
            autoAlpha: 1,
            x: 0,
            duration: motion.duration.short,
            ease: motion.ease.revealSoft,
            force3D: true,
          });
        }
        if (title) {
          gsap.set(title, { autoAlpha: 0, y: 10, force3D: true });
          tl.to(
            title,
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.duration.medium,
              ease: motion.ease.reveal,
              force3D: true,
            },
            "-=0.3",
          );
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
            "-=0.26",
          );
        }
      });

      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx?.revert();
      showTargets([heading, ...rows, ...rowParts].filter(Boolean));
    };
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
