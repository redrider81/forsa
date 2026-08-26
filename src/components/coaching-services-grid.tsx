"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaLink from "@/components/cta-link";
import type { Locale } from "@/lib/i18n/config";
import { isMobile, motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

type Service = {
  index: string;
  href: string;
  title: string;
  description: string;
  ctaLabel: string;
  image?: string;
  imageAlt?: string;
  spanClass?: string;
};

const servicesSv: Service[] = [
  {
    index: "01",
    href: "/individuell-coaching",
    title: "Individuell coaching",
    description:
      "För dig som står inför ett vägval, en förändring eller ett beslut som inte låter sig skjutas upp.",
    ctaLabel: "Läs mer",
    image: "/individuell-coaching.jpg",
    imageAlt: "Individuellt coachingsamtal i lugn miljö",
  },
  {
    index: "02",
    href: "/business-coaching",
    title: "Business coaching",
    description:
      "För ledare, medarbetare, team och ledningsgrupper — där besluten också ska bära i organisationen.",
    ctaLabel: "Läs mer",
    image: "/business-coaching-workshop.jpg",
    imageAlt: "Business coaching i workshopmiljö med whiteboard",
  },
];

const servicesEn: Service[] = [
  {
    index: "01",
    href: "/en/individuell-coaching",
    title: "Individual coaching",
    description:
      "For anyone facing a choice, a change or a decision that will not wait any longer.",
    ctaLabel: "Learn more",
    image: "/individuell-coaching.jpg",
    imageAlt: "Individual coaching session in a calm setting",
  },
  {
    index: "02",
    href: "/en/business-coaching",
    title: "Business coaching",
    description:
      "For leaders, employees, teams and executive teams — where decisions also have to hold in the organisation.",
    ctaLabel: "Learn more",
    image: "/business-coaching-workshop.jpg",
    imageAlt: "Business coaching in a workshop setting with a whiteboard",
  },
];

const cardClass =
  "group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] md:p-9";

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
    { scaleX: 1, duration: motion.duration.long, ease: motion.ease.reveal, stagger: 0.08, force3D: true },
    0.05,
  );
  tl.to(steps, { opacity: 1, duration: 0.12, stagger: 0.04, ease: "none" }, 0.08);
  tl.to(
    accents,
    { scaleX: 1, duration: motion.duration.medium, ease: motion.ease.reveal, stagger: 0.08, force3D: true },
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
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  cards.forEach((card, index) => {
    if (index === 0) return;

    const segmentStart = (index - 1) * 0.3 + 0.05;

    const line = lines[index - 1];
    if (line) {
      tl.to(
        line,
        { scaleX: 1, duration: 0.38, ease: motion.ease.reveal },
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
        { scaleX: 1, duration: 0.32, ease: motion.ease.reveal },
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
          className="mb-12 hidden w-full items-center md:flex"
        >
          {services.map((service, index) => (
            <li
              key={service.index}
              className={`flex items-center ${
                index < services.length - 1 ? "min-w-0 flex-1" : "shrink-0"
              }`}
            >
              <span
                data-progress-step
                className="shrink-0 text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 transition-opacity duration-200 md:text-[0.9375rem]"
              >
                {service.index}
              </span>
              {index < services.length - 1 ? (
                <span data-progress-track className="mx-4 h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-line-track">
                  <span data-progress-line className="block h-full w-full rounded-full" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div
          className={`grid gap-5 md:grid-cols-2 md:gap-6 ${
            services.length > 2 ? "lg:grid-cols-3" : ""
          }`}
        >
          {services.map((service) => (
            <article
              key={service.href}
              data-card
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
                    <span className="block h-px w-full" />
                  </span>
                  <span
                    data-card-arrow
                    aria-hidden="true"
                    className="shrink-0 text-sm text-zinc-400"
                  >
                    →
                  </span>
                </div>
                {service.image ? (
                  <div className="relative mt-6 aspect-[5/4] w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100">
                    <Image
                      src={service.image}
                      alt={service.imageAlt ?? service.title}
                      fill
                      sizes="(min-width: 768px) 28vw, 100vw"
                      className="object-cover object-center"
                      quality={85}
                    />
                  </div>
                ) : null}
                <h3 className={`text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900 ${service.image ? "mt-6" : "mt-7"}`}>
                  {service.title}
                </h3>
                <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {service.description}
                </p>
                <div className="mt-8">
                  <CtaLink href={service.href} variant="primary">
                    {service.ctaLabel}
                  </CtaLink>
                </div>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
}
