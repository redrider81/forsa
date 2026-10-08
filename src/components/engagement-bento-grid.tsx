"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/lib/i18n/config";
import { motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

/**
 * En sammanhängande beskrivning av hur arbetet går till, i stället för
 * numrerade steg.
 */
const explanations: Record<Locale, string> = {
  sv: "Vi börjar med att tydliggöra vad du vill ha ut av coachingen och vilka övergripande mål vi ska arbeta mot. Det ger en gemensam riktning för vårt arbete. Inför varje samtal ringar vi in vad du vill fokusera på och vad du vill få med dig. Vi utforskar frågan tillsammans, ser på olika perspektiv och undersöker vad som kan hjälpa dig vidare. Mellan samtalen kan det finnas något du vill prova, fundera vidare på eller lägga märke till i din vardag. Vid nästa samtal följer vi upp vad du har upptäckt och vad du vill ta med dig vidare.",
  en: "We start by clarifying what you want to get out of the coaching and which overall goals we will work towards. This gives our work a shared direction. Before each session, we narrow down what you want to focus on and what you want to take away. We explore the question together, look at different perspectives and examine what could help you move forward. Between sessions, there may be something you want to try, reflect on further or notice in your everyday life. At the next session, we follow up on what you have discovered and what you want to take forward.",
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
      stagger: 0.085,
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
        <div className="border-t border-zinc-300 pt-10 md:grid md:grid-cols-12 md:gap-x-8 md:pt-14">
          <p
            data-bento-card
            className="max-w-2xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-7 md:col-start-6"
          >
            {explanations[locale]}
          </p>
        </div>
      </div>
    </div>
  );
}
