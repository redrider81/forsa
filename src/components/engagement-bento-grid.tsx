"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/lib/i18n/config";
import { isMobile, motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

type Step = {
  index: string;
  title: string;
  body: string;
  layout: string;
};

const stepsSv: Step[] = [
  {
    index: "01",
    title: "Första samtalet",
    body: "Konfidentiellt. Vi avgör tillsammans om frågan hör hemma här, och om vi fungerar ihop.",
    layout: "md:col-span-6 lg:col-span-7",
  },
  {
    index: "02",
    title: "Vad du vill ha ut",
    body: "Vi sätter ord på vad som ska vara annorlunda när vi är klara. Utan det blir samtal bara samtal.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "03",
    title: "Samtalen",
    body: "Vi bestämmer rytmen tillsammans. Varje samtal slutar med något du tar med dig.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "04",
    title: "Avslut",
    body: "Vi stämmer av mot det du ville uppnå, och avgör om arbetet är klart eller ska fortsätta.",
    layout: "md:col-span-6 lg:col-span-7",
  },
];

const stepsEn: Step[] = [
  {
    index: "01",
    title: "The first conversation",
    body: "Confidential. We work out together whether the question belongs here, and whether we are a good fit.",
    layout: "md:col-span-6 lg:col-span-7",
  },
  {
    index: "02",
    title: "What you want from it",
    body: "We put into words what should be different by the end. Without that, sessions are only sessions.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "03",
    title: "The sessions",
    body: "We set the rhythm together. Every session ends with something you take away with you.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "04",
    title: "Closing",
    body: "We look back at what you set out to do, and decide whether the work is finished or continues.",
    layout: "md:col-span-6 lg:col-span-7",
  },
];

const footnotes: Record<Locale, string> = {
  sv: "Upplägget följer frågan och vad du vill få ut av samtalen.",
  en: "The shape of the work follows the question and what you want to get out of the sessions.",
};

const tileClass =
  "group relative flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_16px_40px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none md:p-7";

type Props = {
  locale: Locale;
};

function buildMobileReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  footnote: HTMLElement | null,
) {
  gsap.set(steps, { autoAlpha: 1, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });
  gsap.set(cards, { autoAlpha: 0, y: 14, force3D: true });
  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  if (footnote) {
    gsap.set(footnote, { autoAlpha: 0, y: 10, force3D: true });
  }

  const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(panel) });

  tl.to(
    cards,
    {
      autoAlpha: 1,
      y: 0,
      duration: motion.duration.medium,
      ease: motion.ease.reveal,
      stagger: 0.07,
      force3D: true,
    },
    0,
  );
  tl.to(
    lines,
    { scaleX: 1, duration: motion.duration.medium, ease: motion.ease.reveal, stagger: 0.05, force3D: true },
    0.05,
  );
  tl.to(steps, { opacity: 1, duration: 0.12, stagger: 0.04, ease: "none" }, 0.08);
  tl.to(
    accents,
    { scaleX: 1, duration: motion.duration.short, ease: motion.ease.reveal, stagger: 0.05, force3D: true },
    0.1,
  );
  if (footnote) {
    tl.to(
      footnote,
      { autoAlpha: 1, y: 0, duration: motion.duration.medium, ease: motion.ease.reveal },
      0.15,
    );
  }
}

function buildProgressTimeline(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  footnote: HTMLElement | null,
) {
  gsap.set(steps, { autoAlpha: 1, y: 0, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });

  cards.forEach((card, index) => {
    if (index === 0) {
      gsap.set(card, { autoAlpha: 1, x: 0, y: 0, force3D: true });
      return;
    }
    gsap.set(card, { autoAlpha: 0, x: -12, y: 16, force3D: true });
  });

  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });

  if (footnote) {
    gsap.set(footnote, { autoAlpha: 0, y: 12, force3D: true });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      start: "top 72%",
      end: "bottom 18%",
      scrub: 0.55,
      invalidateOnRefresh: true,
    },
  });

  cards.forEach((card, index) => {
    if (index === 0) return;

    const segmentStart = (index - 1) * 0.2 + 0.05;

    const line = lines[index - 1];
    if (line) {
      tl.to(line, { scaleX: 1, duration: 0.22, ease: motion.ease.reveal }, segmentStart);
    }

    tl.to(
      steps[index],
      { opacity: 1, duration: 0.1, ease: "none" },
      segmentStart + 0.1,
    );

    tl.to(
      card,
      { autoAlpha: 1, x: 0, y: 0, duration: 0.26, ease: motion.ease.reveal },
      segmentStart + 0.04,
    );

    const accent = accents[index];
    if (accent) {
      tl.to(accent, { scaleX: 1, duration: 0.18, ease: motion.ease.reveal }, segmentStart + 0.1);
    }
  });

  if (footnote) {
    tl.to(
      footnote,
      { autoAlpha: 1, y: 0, duration: 0.24, ease: motion.ease.reveal },
      0.82,
    );
  }

  tl.to({}, { duration: 0.12 });
}

export default function EngagementBentoGrid({ locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const steps = locale === "en" ? stepsEn : stepsSv;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const progressSteps = panel.querySelectorAll<HTMLElement>("[data-progress-step]");
    const progressLines = panel.querySelectorAll<HTMLElement>("[data-progress-line]");
    const cards = panel.querySelectorAll<HTMLElement>("[data-bento-card]");
    const accents = panel.querySelectorAll<HTMLElement>("[data-bento-accent]");
    const footnote = panel.querySelector<HTMLElement>("[data-bento-footnote]");

    const targets = [
      ...progressSteps,
      ...progressLines,
      ...cards,
      ...accents,
      footnote,
    ].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (isMobile()) {
        buildMobileReveal(panel, cards, progressSteps, progressLines, accents, footnote);
      } else {
        buildProgressTimeline(
          panel,
          cards,
          progressSteps,
          progressLines,
          accents,
          footnote,
        );
      }
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
        <ol
          aria-hidden="true"
          className="mb-8 hidden max-w-2xl items-center md:flex"
        >
          {steps.map((step, index) => (
            <li key={step.index} className="flex flex-1 items-center last:flex-none">
              <span
                data-progress-step
                className="text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 transition-opacity duration-200 md:text-[0.9375rem]"
              >
                {step.index}
              </span>
              {index < steps.length - 1 ? (
                <span data-progress-track className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-line-track">
                  <span data-progress-line className="block h-full w-full rounded-full" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12 md:gap-4">
            {steps.map((step) => (
              <article
                key={step.index}
                data-bento-card
                className={`${tileClass} ${step.layout}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 md:text-[0.9375rem]">
                    {step.index}
                  </span>
                  <span data-bento-accent aria-hidden="true" className="block h-0.5 w-10 origin-left overflow-hidden rounded-full md:w-14">
                    <span className="block h-full w-full rounded-full" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.2rem]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.98rem] font-[450] leading-[1.65] text-zinc-700 md:text-[1.02rem]">
                  {step.body}
                </p>
              </article>
            ))}

            <p
              data-bento-footnote
              className="rounded-2xl border border-zinc-200/70 bg-zinc-900/[0.025] px-6 py-5 text-[0.98rem] font-[450] leading-[1.65] text-zinc-800 md:col-span-12 md:px-7 md:py-6 md:text-[1.02rem]"
            >
              {footnotes[locale]}
            </p>
        </div>
      </div>
    </div>
  );
}
