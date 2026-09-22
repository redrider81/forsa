"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/lib/i18n/config";
import { motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

type Step = {
  index: string;
  title: string;
  body: string;
};

const stepsSv: Step[] = [
  {
    index: "01",
    title: "Första samtalet",
    body: "Konfidentiellt. Du berättar om din situation, och tillsammans ser vi om coaching är rätt stöd och om vi fungerar bra ihop.",
  },
  {
    index: "02",
    title: "Vad du vill bli klarare i",
    body: "Jag hjälper dig att sätta ord på vad du vill bli klarare i och vad du vill kunna göra annorlunda.",
  },
  {
    index: "03",
    title: "Samtalen",
    body: "Du och jag bestämmer rytmen tillsammans. Varje samtal avslutas med något du tar med dig vidare.",
  },
  {
    index: "04",
    title: "Avslut",
    body: "Du och jag stämmer av mot det du ville uppnå och ser tillsammans om arbetet är klart eller ska fortsätta.",
  },
];

const stepsEn: Step[] = [
  {
    index: "01",
    title: "The first conversation",
    body: "Confidential. We talk about your situation and work out together whether coaching is the right support and whether we are a good fit.",
  },
  {
    index: "02",
    title: "What you want to get clearer about",
    body: "We put into words what needs to be different for the conversations to make a real difference.",
  },
  {
    index: "03",
    title: "The sessions",
    body: "We set the rhythm together. Every conversation ends with something you take further.",
  },
  {
    index: "04",
    title: "Closing",
    body: "We look back at what you set out to do, and decide whether the work is finished or continues.",
  },
];

const footnotes: Record<Locale, string> = {
  sv: "Upplägget följer frågan och vad du vill få ut av samtalen.",
  en: "The shape of the work follows the question and what you want to get out of the sessions.",
};

type Props = {
  locale: Locale;
};

/**
 * Alla fyra stegen tonas in en gång när sektionen kommer in i vyn och blir
 * sedan kvar. Tidigare låg korten 2–4 bakom en scrub-styrd tidslinje på
 * desktop, vilket gjorde att de kunde stå kvar dolda — innehållet får inte
 * vara beroende av hur långt besökaren har hunnit rulla.
 */
function buildStepsReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  footnote: HTMLElement | null,
) {
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(cards, { autoAlpha: 0, y: motion.reveal.y, force3D: true });
  if (footnote) {
    gsap.set(footnote, { autoAlpha: 0, y: 10, force3D: true });
  }

  const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(panel) });

  tl.to(
    cards,
    {
      autoAlpha: 1,
      y: 0,
      duration: motion.duration.long,
      ease: motion.ease.reveal,
      stagger: 0.1,
      force3D: true,
    },
    0,
  );
  tl.to(
    lines,
    { scaleX: 1, duration: motion.duration.long, ease: motion.ease.editorial, stagger: 0.08, force3D: true },
    0.05,
  );
  if (footnote) {
    tl.to(
      footnote,
      { autoAlpha: 1, y: 0, duration: motion.duration.medium, ease: motion.ease.reveal },
      0.12,
    );
  }
}

export default function EngagementBentoGrid({ locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const steps = locale === "en" ? stepsEn : stepsSv;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const progressLines = panel.querySelectorAll<HTMLElement>("[data-progress-line]");
    const cards = panel.querySelectorAll<HTMLElement>("[data-bento-card]");
    const footnote = panel.querySelector<HTMLElement>("[data-bento-footnote]");

    const targets = [...progressLines, ...cards, footnote].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      buildStepsReveal(panel, cards, progressLines, footnote);
      refreshScrollTriggers();
    }, root);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <div ref={panelRef}>
        <ol className="border-t border-zinc-300">
            {steps.map((step) => (
              <li
                key={step.index}
                data-bento-card
                className="relative border-b border-zinc-300 py-10 md:py-14"
              >
                <span
                  data-progress-line
                  aria-hidden="true"
                  className="absolute left-0 top-[-1px] h-px w-full origin-left bg-zinc-400/70"
                />
                <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-x-8">
                  <span
                    data-progress-step
                    aria-hidden="true"
                    className="whitespace-nowrap font-serif tabular-nums text-[clamp(3.25rem,6vw,5.75rem)] leading-[0.88] tracking-[-0.06em] text-zinc-500 md:col-span-2"
                  >
                    {step.index}
                  </span>
                  <h3 className="text-xl font-medium leading-[1.3] tracking-tight text-zinc-900 md:col-span-4 md:col-start-3 md:text-2xl">
                    {step.title}
                  </h3>
                  <div className="md:col-span-5 md:col-start-8">
                    <p className="max-w-xl text-[1.02rem] font-[450] leading-[1.7] text-zinc-600 md:text-[1.0625rem]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
        </ol>

            <p
              data-bento-footnote
              className="ml-auto mt-10 max-w-xl border-l border-zinc-300 pl-6 text-[0.98rem] font-[450] leading-[1.7] text-zinc-600 md:mt-14 md:pl-8 md:text-[1.02rem]"
            >
              {footnotes[locale]}
            </p>
      </div>
    </div>
  );
}
