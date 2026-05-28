"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Fires when the element has entered the viewport (not before). */
const visibleStart = "top 88%";

export default function EditorialRowsReveal({ children, className, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        const heading = el.querySelector<HTMLElement>("[data-section-heading]");
        const rows = el.querySelectorAll<HTMLElement>("[data-editorial-row]");
        if (!heading && !rows.length) return;

        const scrollConfig = {
          start: visibleStart,
          once: true,
          toggleActions: "play none none none" as const,
        };

        if (heading) {
          gsap.from(heading, {
            opacity: 0,
            y: 22,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              ...scrollConfig,
            },
          });
        }

        rows.forEach((row) => {
          const index = row.querySelector<HTMLElement>("[data-row-index]");
          const title = row.querySelector<HTMLElement>("[data-row-title]");
          const body = row.querySelector<HTMLElement>("[data-row-body]");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              ...scrollConfig,
            },
          });

          if (index) {
            tl.from(index, { opacity: 0, x: -10, duration: 0.45, ease: "power2.out" });
          }
          if (title) {
            tl.from(
              title,
              { opacity: 0, y: 14, duration: 0.5, ease: "power3.out" },
              "-=0.28",
            );
          }
          if (body) {
            tl.from(
              body,
              { opacity: 0, y: 18, duration: 0.55, ease: "power3.out" },
              "-=0.22",
            );
          }
        });

        ScrollTrigger.refresh();
      }, ref);
    }, 32);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      clearTimeout(id);
      window.removeEventListener("load", onLoad);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
