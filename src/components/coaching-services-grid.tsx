"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

type Service = {
  index: string;
  href: string;
  title: string;
  description: string;
  ctaLabel: string;
};

const servicesSv: Service[] = [
  {
    index: "01",
    href: "/individuell-coaching",
    title: "Individuell coaching",
    description:
      "För dig som står inför ett vägval, en förändring eller ett beslut som du vill tänka färdigt.",
    ctaLabel: "Läs om individuell coaching",
  },
  {
    index: "02",
    href: "/business-coaching",
    title: "Business coaching",
    description:
      "För medarbetare och ledare med en fråga i arbetslivet — ett nytt ansvar, en svår relation eller ett beslut som påverkar andra.",
    ctaLabel: "Läs om business coaching",
  },
];

const servicesEn: Service[] = [
  {
    index: "01",
    href: "/en/individuell-coaching",
    title: "Individual coaching",
    description:
      "For you who are facing a choice, a change or a decision that needs room to be thought through.",
    ctaLabel: "Read about individual coaching",
  },
  {
    index: "02",
    href: "/en/business-coaching",
    title: "Business coaching",
    description:
      "For employees and leaders who need clarity, direction or support in a work-related situation.",
    ctaLabel: "Read about business coaching",
  },
];

type Props = {
  locale: Locale;
};

function buildEditorialReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  arrows: NodeListOf<HTMLElement>,
) {
  if (steps.length) {
    gsap.set(steps, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
  }
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(cards, { autoAlpha: 0, y: motion.reveal.y, force3D: true });
  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(arrows, { autoAlpha: 0, x: -6, force3D: true });

  const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(panel) });

  if (steps.length) {
    tl.to(
      steps,
      {
        autoAlpha: 1,
        y: 0,
        duration: motion.duration.medium,
        ease: motion.ease.reveal,
        stagger: 0.12,
        force3D: true,
      },
      0,
    );
  }
  tl.to(
    cards,
    {
      autoAlpha: 1,
      y: 0,
      duration: motion.duration.long,
      ease: motion.ease.reveal,
      stagger: 0.12,
      force3D: true,
    },
    0.08,
  );
  tl.to(
    lines,
    {
      scaleX: 1,
      duration: motion.duration.long,
      ease: motion.ease.editorial,
      stagger: 0.1,
      force3D: true,
    },
    0.14,
  );
  tl.to(
    [...accents, ...arrows],
    {
      autoAlpha: 1,
      scaleX: 1,
      x: 0,
      duration: motion.duration.short,
      ease: motion.ease.revealSoft,
      stagger: 0.08,
      force3D: true,
    },
    0.22,
  );
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
      buildEditorialReveal(panel, cards, steps, lines, accents, arrows);
      refreshScrollTriggers();
    }, root);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <div ref={rootRef} data-coaching-scroll-root>
      <div ref={panelRef} data-coaching-scroll-panel>
        <ol className="grid gap-y-3 md:grid-cols-12 md:gap-x-8 md:gap-y-0">
          {services.map((service, index) => (
            <li
              key={service.href}
              data-card
              className={
                index === 0
                  ? "md:col-span-8"
                  : "md:col-span-8 md:col-start-5 md:mt-16"
              }
            >
              <Link
                href={service.href}
                className="group relative block border-t border-zinc-300 py-9 transition-colors duration-300 hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-white md:py-12"
              >
                <span
                  data-progress-line
                  aria-hidden="true"
                  className="absolute left-0 top-[-1px] h-px w-full origin-left bg-[#967844]/70"
                />
                {/* Individuell och business coaching är två sammanhang, inte en
                    ordningsföljd — den dekorativa siffran är därför borttagen. */}
                <span className="block">
                  <span className="block pb-1">
                    <span className="flex items-start justify-between gap-5">
                      {/* Rubriknivån behålls från tidigare layout: raden är visuellt en
                          textrad, men titeln ska fortfarande ligga i sidans rubrikträd. */}
                      <span
                        role="heading"
                        aria-level={3}
                        className="text-[1.55rem] font-medium leading-[1.12] tracking-tight text-zinc-900 md:text-[2rem]"
                      >
                        {service.title}
                      </span>
                      <span
                        data-card-arrow
                        aria-hidden="true"
                        className="mt-1 text-xl text-zinc-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-zinc-900 motion-reduce:transition-none"
                      >
                        →
                      </span>
                    </span>
                    <span className="mt-4 block max-w-xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-600">
                      {service.description}
                    </span>
                    <span className="mt-7 inline-flex items-center text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors group-hover:decoration-zinc-900">
                      {service.ctaLabel}
                    </span>
                    <span
                      data-card-accent
                      aria-hidden="true"
                      className="mt-8 block h-px w-16 origin-left overflow-hidden"
                    >
                      <span className="block h-full w-full bg-[#967844]" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
