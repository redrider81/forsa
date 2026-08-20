"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/lib/i18n/config";
import { isMobile, motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

type Service = {
  index: string;
  href: string;
  title: string;
  description: string;
  spanClass?: string;
};

const servicesSv: Service[] = [
  {
    index: "01",
    href: "/executive-coaching",
    title: "Executive coaching",
    description:
      "För vd:ar, grundare och seniora ledare i komplexa beslut, ansvar och rollklarhet.",
  },
  {
    index: "02",
    href: "/ledningsgruppscoaching",
    title: "Ledningsgruppscoaching",
    description:
      "För ledningsgrupper som behöver gemensamma prioriteringar och beslut som överlever mötet.",
  },
  {
    index: "03",
    href: "/individuell-coaching",
    title: "Individuell coaching",
    description:
      "För chefer och nyckelpersoner som behöver klarhet i roll, prioritering och genomslag.",
  },
  {
    index: "04",
    href: "/team-coaching",
    title: "Teamcoaching",
    description: "För team och projektgrupper med höga krav och outtalat arbetssätt.",
  },
  {
    index: "05",
    href: "/coachande-ledarskap",
    title: "Coachande ledarskap",
    description:
      "Programformat för organisationer som vill stärka chefers förmåga att leda genom samtal.",
    spanClass: "lg:col-span-1",
  },
];

const servicesEn: Service[] = [
  {
    index: "01",
    href: "/en/executive-coaching",
    title: "Executive coaching",
    description:
      "For CEOs, founders and senior leaders facing complex decisions, accountability and role clarity.",
  },
  {
    index: "02",
    href: "/en/ledningsgruppscoaching",
    title: "Executive team coaching",
    description:
      "For executive teams that need clearer decisions, stronger accountability and shared direction.",
  },
  {
    index: "03",
    href: "/en/individuell-coaching",
    title: "Individual coaching",
    description:
      "For managers and key professionals who need clarity in role, prioritisation and impact.",
  },
  {
    index: "04",
    href: "/en/team-coaching",
    title: "Team coaching",
    description:
      "For teams that need to strengthen collaboration, accountability and shared learning in daily work.",
  },
  {
    index: "05",
    href: "/en/coachande-ledarskap",
    title: "Coaching leadership",
    description:
      "For organisations developing managers who lead through dialogue, questions and accountability.",
    spanClass: "lg:col-span-1",
  },
];

const cardClass =
  "group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9";

type Props = {
  locale: Locale;
};

function buildMobileReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  arrows: NodeListOf<HTMLElement>,
) {
  gsap.set(steps, { autoAlpha: 1, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });
  gsap.set(cards, { autoAlpha: 0, y: 14, force3D: true });
  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  gsap.set(arrows, { autoAlpha: 0, force3D: true });
  gsap.set(arrows[0], { autoAlpha: 0.55 });

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
      onComplete: () => {
        cards.forEach((card) => {
          card.style.pointerEvents = "auto";
        });
      },
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
  tl.to(
    arrows,
    { autoAlpha: 0.55, x: 0, duration: motion.duration.short, ease: motion.ease.revealSoft, stagger: 0.05, force3D: true },
    0.12,
  );
}

function buildProgressTimeline(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  arrows: NodeListOf<HTMLElement>,
) {
  gsap.set(steps, { autoAlpha: 1, y: 0, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });

  cards.forEach((card, index) => {
    if (index === 0) {
      gsap.set(card, { autoAlpha: 1, x: 0, y: 0, force3D: true });
      card.style.pointerEvents = "auto";
      return;
    }
    gsap.set(card, { autoAlpha: 0, x: -12, y: 16, force3D: true });
    card.style.pointerEvents = "none";
  });

  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  gsap.set(arrows, { autoAlpha: 0, x: -4, force3D: true });
  gsap.set(arrows[0], { autoAlpha: 0.55, x: 0 });

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
      tl.to(
        line,
        { scaleX: 1, duration: 0.22, ease: motion.ease.reveal },
        segmentStart,
      );
    }

    tl.to(
      steps[index],
      { opacity: 1, duration: 0.1, ease: "none" },
      segmentStart + 0.1,
    );

    tl.to(
      card,
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.26,
        ease: motion.ease.reveal,
        onStart: () => {
          card.style.pointerEvents = "auto";
        },
      },
      segmentStart + 0.04,
    );

    const accent = accents[index];
    if (accent) {
      tl.to(
        accent,
        { scaleX: 1, duration: 0.18, ease: motion.ease.reveal },
        segmentStart + 0.1,
      );
    }

    const arrow = arrows[index];
    if (arrow) {
      tl.to(
        arrow,
        { autoAlpha: 0.55, x: 0, duration: 0.14, ease: motion.ease.revealSoft },
        segmentStart + 0.14,
      );
    }
  });

  tl.to({}, { duration: 0.12 });
}

export default function CoachingServicesGrid({ locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const services = locale === "en" ? servicesEn : servicesSv;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const steps = panel.querySelectorAll<HTMLElement>("[data-progress-step]");
    const lines = panel.querySelectorAll<HTMLElement>("[data-progress-line]");
    const cards = panel.querySelectorAll<HTMLElement>("[data-card]");
    const accents = panel.querySelectorAll<HTMLElement>("[data-card-accent]");
    const arrows = panel.querySelectorAll<HTMLElement>("[data-card-arrow]");

    const targets = [
      ...steps,
      ...lines,
      ...cards,
      ...accents,
      ...arrows,
    ].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (isMobile()) {
        buildMobileReveal(panel, cards, steps, lines, accents, arrows);
      } else {
        buildProgressTimeline(panel, cards, steps, lines, accents, arrows);
      }
      refreshScrollTriggers();
    }, root);

    return () => {
      ctx.revert();
      showTargets(targets);
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
    };
  }, []);

  return (
    <div ref={rootRef} data-coaching-scroll-root className="pb-8 md:pb-12">
      <div ref={panelRef} data-coaching-scroll-panel className="bg-white">
        <ol
          data-progress-rail
          aria-hidden="true"
          className="mb-12 hidden max-w-4xl items-center md:flex"
        >
          {services.map((service, index) => (
            <li key={service.index} className="flex flex-1 items-center last:flex-none">
              <span
                data-progress-step
                className="text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 transition-opacity duration-200 md:text-[0.9375rem]"
              >
                {service.index}
              </span>
              {index < services.length - 1 ? (
                <span className="mx-4 h-2 flex-1 overflow-hidden rounded-full bg-zinc-200/90">
                  <span data-progress-line className="block h-full w-full rounded-full bg-[#92753a]" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.href}
              data-card
              href={service.href}
              className={`${cardClass} ${service.spanClass ?? ""}`}
            >
                <div className="flex items-center gap-3 md:gap-4">
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 md:text-[0.9375rem]"
                  >
                    {service.index}
                  </span>
                  <span
                    data-card-accent
                    aria-hidden="true"
                    className="block h-px min-w-0 max-w-[5rem] flex-1 origin-left md:max-w-[6rem]"
                  >
                    <span className="block h-px w-full bg-zinc-900" />
                  </span>
                  <span
                    data-card-arrow
                    aria-hidden="true"
                    className="shrink-0 text-sm text-zinc-400 transition-[transform,opacity,color] duration-300 group-hover:translate-x-0.5 group-hover:text-zinc-900 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </div>
                <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">
                  {service.title}
                </h3>
                <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {service.description}
                </p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
