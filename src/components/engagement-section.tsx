"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EngagementBentoGrid from "@/components/engagement-bento-grid";
import type { Locale } from "@/lib/i18n/config";
import { HOME_DISPLAY } from "@/lib/homepage-typography";
import {
  homeTravel,
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
  /**
   * "standalone" bär sin egen yta och sitt eget luftrum — så ligger scenen på /en.
   * "field" lägger scenen på ett gemensamt fält som sidan själv målar, och låter
   * rubriken börja i samma vänsterkant som sidans övriga aktrubriker.
   */
  variant?: "standalone" | "field";
};

export default function EngagementSection({ locale, variant = "standalone" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const field = variant === "field";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fältvarianten (startsidan) avtäcker etikett och rubrik; processtexten
    // har en egen entré i EngagementBentoGrid. Fristående variant: hela blocket.
    const headingParts = el.querySelectorAll<HTMLElement>("[data-engagement-heading]");
    const targets = headingParts.length ? [...headingParts] : [el];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (headingParts.length) {
        const travel = homeTravel();
        gsap.set(headingParts, { autoAlpha: 0, y: travel.y, force3D: true });
        gsap.to(headingParts, {
          autoAlpha: 1,
          y: 0,
          duration: motion.home.duration.heading,
          ease: motion.home.ease.heading,
          stagger: motion.home.stagger.text,
          force3D: true,
          scrollTrigger: revealScrollTrigger(headingParts[headingParts.length - 1]),
        });
      } else {
        gsap.set(el, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.long,
          ease: motion.ease.reveal,
          force3D: true,
          scrollTrigger: revealScrollTrigger(el, { start: "top 84%" }),
        });
      }
      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <section
      id="uppdrag"
      data-parallax-section
      className={
        field ? "scroll-mt-24 md:scroll-mt-32" : "bg-[#f1f0ec] py-24 md:py-32 lg:py-40"
      }
    >
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-6 md:px-10"
      >
        {field ? (
          <>
            <p
              data-engagement-heading
              className="text-xs font-medium tabular-nums tracking-[0.32em] text-zinc-900"
            >
              05
            </p>
            <h2
              data-engagement-heading
              className={`mt-10 max-w-3xl ${HOME_DISPLAY} text-zinc-900 md:mt-14`}
            >
              {titles[locale]}
            </h2>
          </>
        ) : (
          <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <p className="text-xs font-medium tabular-nums tracking-[0.32em] text-zinc-900 md:col-span-2">
              05
            </p>
            <h2 className="max-w-4xl font-serif text-[clamp(3rem,7vw,7rem)] font-medium leading-[1.12] tracking-[-0.045em] text-zinc-900 md:col-span-8 md:col-start-5">
              {titles[locale]}
            </h2>
          </div>
        )}
        <div className={field ? "mt-16 md:mt-24" : "mt-20 md:mt-28"}>
          <EngagementBentoGrid locale={locale} />
        </div>
      </div>
    </section>
  );
}
