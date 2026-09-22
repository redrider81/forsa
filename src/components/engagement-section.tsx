"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EngagementBentoGrid from "@/components/engagement-bento-grid";
import type { Locale } from "@/lib/i18n/config";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

const titles: Record<Locale, string> = {
  sv: "Så går det till",
  en: "How it works",
};

type Props = {
  locale: Locale;
};

export default function EngagementSection({ locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      showTargets(el);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: motion.duration.long,
        ease: motion.ease.reveal,
        force3D: true,
        scrollTrigger: revealScrollTrigger(el, { start: "top 84%" }),
      });
      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx.revert();
      showTargets(el);
    };
  }, []);

  return (
    <section
      id="uppdrag"
      data-parallax-section
      className="bg-[#f1f0ec] py-24 md:py-32 lg:py-40"
    >
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-6 md:px-10"
      >
        <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
          <p className="text-xs font-medium tabular-nums tracking-[0.32em] text-[#967844] md:col-span-2">
            04
          </p>
          <h2 className="max-w-4xl font-serif text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.94] tracking-[-0.045em] text-zinc-900 md:col-span-8 md:col-start-5">
            {titles[locale]}
          </h2>
        </div>
        <div className="mt-20 md:mt-28">
          <EngagementBentoGrid locale={locale} />
        </div>
      </div>
    </section>
  );
}
