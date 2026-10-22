"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import {
  bindParallaxGaps,
  bindParallaxRefresh,
  isMobile,
  prefersReducedMotion,
  scheduleScrollRevealRefresh,
} from "@/lib/motion";

export type FooterLink = {
  title: string;
  href: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

export type FooterColumn = {
  label: string;
  links: FooterLink[];
};

type FooterProps = {
  columns: FooterColumn[];
  copyright: string;
};

export function Footer({ columns, copyright }: FooterProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      bindParallaxGaps(root, isMobile());
      scheduleScrollRevealRefresh();
    }, root);

    const unbindRefresh = bindParallaxRefresh(() => ScrollTrigger.refresh());

    return () => {
      unbindRefresh();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="mt-auto w-full">
      <div data-parallax-gap aria-hidden="true" className="relative z-0 w-full">
        <div
          data-parallax-gap-surface
          className="relative z-0 h-14 w-full bg-[#f4f3ef] md:h-20 lg:h-24"
        />
      </div>
      <div
        data-parallax-cover
        data-parallax-cover-end
        className="relative z-10 w-full bg-surface-dark pt-10 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] text-zinc-100 shadow-[0_48px_0_0_var(--surface-dark)] md:pt-20 lg:pt-24"
      >
      <footer className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-10 pt-4 md:px-10 md:pb-12 md:pt-6">
        <div className="grid w-full grid-cols-2 gap-8 md:grid-cols-4 md:gap-x-8">
            {columns.map((section, index) => (
              <AnimatedContainer key={section.label} delay={0.1 + index * 0.1} className="min-w-0">
                <div className="mb-10 md:mb-0">
                  <h3 className="text-sm font-medium tracking-[0.06em] text-zinc-100 md:text-base">
                    {section.label}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      const isMailto = link.external && link.href.startsWith("mailto:");
                      const className = [
                        "inline-flex items-center transition-colors duration-300 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark",
                        isMailto ? "text-zinc-300" : "",
                      ].join(" ");

                      return (
                        <li key={`${section.label}-${link.title}`}>
                          {link.external ? (
                            <a href={link.href} className={className}>
                              {Icon ? <Icon className="me-1 size-4 shrink-0" aria-hidden /> : null}
                              {link.title}
                            </a>
                          ) : (
                            <Link href={link.href} className={className}>
                              {Icon ? <Icon className="me-1 size-4 shrink-0" aria-hidden /> : null}
                              {link.title}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
        </div>
      </footer>

      <AnimatedContainer
        delay={0.45}
        className="w-full border-t border-white/10 px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10"
      >
        <p className="mx-auto max-w-6xl text-xs text-zinc-400">{copyright}</p>
      </AnimatedContainer>
      </div>
    </div>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ delay, duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
