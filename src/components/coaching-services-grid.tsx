"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
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
  intro?: string;
  description: string;
  ctaLabel: string;
};

const servicesSv: Service[] = [
  {
    index: "01",
    href: "/individuell-coaching",
    title: "Individuell coaching",
    intro:
      "För dig som vill utvecklas, hitta klarhet eller ta nästa steg i livet eller karriären.",
    description:
      "Coaching kan ge dig möjlighet att stanna upp, sortera dina tankar och se nya perspektiv. Det kan handla om en förändring eller ett beslut, men också om att utveckla dina styrkor, hitta nya möjligheter eller komma fram till vad som är viktigt för dig.",
    ctaLabel: "Läs om individuell coaching",
  },
  {
    index: "02",
    href: "/business-coaching",
    title: "Business Coaching",
    intro:
      "För medarbetare, ledare och team som vill utvecklas och hitta nya perspektiv.",
    description:
      "Coaching kan ge utrymme för reflektion kring det som är aktuellt i arbetslivet. Det kan handla om arbetsuppgifter, ledarskap, kommunikation, samarbete eller förändringar – men också om att utvecklas i sin roll och ta vara på sina styrkor.",
    ctaLabel: "Läs om företagscoaching",
  },
];

const servicesEn: Service[] = [
  {
    index: "01",
    href: "/en/individuell-coaching",
    title: "Individual coaching",
    intro:
      "For anyone who wants to develop, find clarity or take the next step in life or their career.",
    description:
      "Coaching can give you the opportunity to pause, sort your thoughts and see new perspectives. It may be about a change or a decision, but also about developing your strengths, finding new opportunities or working out what matters to you.",
    ctaLabel: "Read about individual coaching",
  },
  {
    index: "02",
    href: "/en/business-coaching",
    title: "Business Coaching",
    intro:
      "For employees, leaders and teams who want to develop and find new perspectives.",
    description:
      "Coaching can create space for reflection on whatever is current in your working life. It may involve work tasks, leadership, communication, collaboration or change – but also developing in your role and making the most of your strengths.",
    ctaLabel: "Read about business coaching",
  },
];

type Props = {
  locale: Locale;
  /**
   * Startsidan bär de två vägarna inuti en längre akt och behöver ett tätare
   * radavstånd för att öppningen inte ska ta över fältet. /en behåller det
   * ursprungliga, luftigare måttet.
   */
  dense?: boolean;
  /** Startsidan: redaktionella rader utan kortyta. */
  variant?: "cards" | "editorial";
};

function buildEditorialReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  arrows: NodeListOf<HTMLElement>,
) {
  gsap.set(cards, { autoAlpha: 0, y: motion.reveal.y, force3D: true });
  gsap.set(arrows, { autoAlpha: 0, x: -6, force3D: true });

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
    arrows,
    {
      autoAlpha: 1,
      x: 0,
      duration: motion.duration.short,
      ease: motion.ease.revealSoft,
      stagger: 0.07,
      force3D: true,
    },
    0.12,
  );
}

export default function CoachingServicesGrid({
  locale,
  dense = false,
  variant = "cards",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const services = locale === "en" ? servicesEn : servicesSv;
  const cardPadding = dense ? "p-7 md:p-9" : "p-8 md:p-10 lg:p-11";
  const editorial = variant === "editorial";

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const cards = panel.querySelectorAll<HTMLElement>("[data-card]");
    const arrows = panel.querySelectorAll<HTMLElement>("[data-card-arrow]");

    const targets = [...cards, ...arrows].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      buildEditorialReveal(panel, cards, arrows);
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
        {editorial ? (
          <ul className="grid border-t border-zinc-300 md:grid-cols-2 md:items-stretch">
            {services.map((service, serviceIndex) => (
              <li
                key={service.href}
                data-card
                className={`flex min-h-0 flex-col border-b border-zinc-300 ${
                  serviceIndex === 0 ? "md:border-r md:border-zinc-300" : ""
                }`}
              >
                <div
                  className={`flex flex-1 flex-col py-11 md:py-14 ${
                    serviceIndex === 0
                      ? "px-7 md:pl-9 md:pr-12 lg:pl-11 lg:pr-16"
                      : "px-7 md:pl-14 md:pr-9 lg:pl-16 lg:pr-11"
                  }`}
                >
                  <span className="text-xs font-medium tabular-nums tracking-[0.32em] text-zinc-900">
                    {service.index}
                  </span>
                  <span
                    role="heading"
                    aria-level={3}
                    className="mt-5 block font-serif text-[clamp(1.5rem,2.2vw,1.75rem)] font-medium leading-[1.15] tracking-[-0.02em] text-zinc-900 md:mt-6"
                  >
                    {service.title}
                  </span>
                  {service.intro ? (
                    <p className="mt-4 max-w-md text-[1.02rem] font-[450] leading-[1.7] text-zinc-600 md:text-[1.0625rem]">
                      {service.intro}
                    </p>
                  ) : null}
                  <p className="mt-4 max-w-md flex-1 text-[1.02rem] font-[450] leading-[1.7] text-zinc-600 md:text-[1.0625rem]">
                    {service.description}
                  </p>
                  <div className="group mt-8 flex justify-center md:mt-10 md:justify-start">
                    <CtaLink href={service.href} variant="tertiary">
                      <span className="inline-flex items-center gap-2">
                        {service.ctaLabel}
                        <span
                          data-card-arrow
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                        >
                          →
                        </span>
                      </span>
                    </CtaLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
          {services.map((service) => (
            <li key={service.href} data-card className="min-h-0">
              <Link
                href={service.href}
                className={`group flex h-full flex-col border border-zinc-300/90 bg-[#f9f8f5] ${cardPadding} transition-[border-color,background-color] duration-300 hover:border-zinc-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4`}
              >
                <span className="text-xs font-medium tabular-nums tracking-[0.32em] text-zinc-900">
                  {service.index}
                </span>
                <span
                  role="heading"
                  aria-level={3}
                  className="mt-5 text-[1.35rem] font-medium leading-[1.3] tracking-tight text-zinc-900 md:mt-6 md:text-[1.5rem]"
                >
                  {service.title}
                </span>
                <span className="mt-4 flex-1 text-[1.02rem] font-[450] leading-[1.7] text-zinc-600 md:text-[1.0625rem]">
                  {service.description}
                </span>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-[decoration-color,color] duration-300 group-hover:decoration-zinc-900">
                  {service.ctaLabel}
                  <span
                    data-card-arrow
                    aria-hidden="true"
                    className="no-underline transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
