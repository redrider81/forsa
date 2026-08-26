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
  en: "How an engagement works",
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
    <section id="uppdrag" data-parallax-section className="pt-16 pb-8 md:pt-20 md:pb-10">
      <div
        ref={ref}
        className="grid gap-10 md:grid-cols-12 md:items-start md:gap-x-16"
      >
        <h2 className="text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:col-span-4 md:text-[2.1rem]">
          {titles[locale]}
        </h2>
        <div className="md:col-span-8">
          <EngagementBentoGrid locale={locale} />
        </div>
      </div>
    </section>
  );
}
