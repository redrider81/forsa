# 01a — Shared public content components (Swedish homepage sections)

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

Components rendering public-visible copy on the Swedish homepage. The service grid and process grid also serve /en and contain both locales' strings.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/components/coaching-services-grid.tsx

### Affected route(s)
shared — /, /en

### Current source

```tsx
"use client";

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
  spanClass?: string;
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
      "För medarbetare och ledare som behöver klarhet, riktning eller stöd i en arbetsrelaterad situation.",
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
                <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">
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
```

---

## File: src/components/ui/kinetic-team-hybrid.tsx

### Affected route(s)
/

### Current source

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaLink from "@/components/cta-link";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

const CAROLINA_IMAGE = "/carolina-von-braun.png";

export default function KineticTeamHybrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const heading = section.querySelector<HTMLElement>("[data-team-heading]");
    const portrait = section.querySelector<HTMLElement>("[data-team-portrait]");
    const divider = section.querySelector<HTMLElement>("[data-team-divider]");
    const paragraphs = section.querySelectorAll<HTMLElement>("[data-col-paragraph]");

    const targets = [heading, portrait, divider, ...paragraphs].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(section) });

      if (heading) {
        gsap.set(heading, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
        tl.to(heading, {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.medium,
          ease: motion.ease.reveal,
          force3D: true,
        });
      }

      if (portrait) {
        gsap.set(portrait, { autoAlpha: 0, y: motion.reveal.y, scale: 1.04, force3D: true });
        tl.to(
          portrait,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: motion.duration.long,
            ease: motion.ease.reveal,
            force3D: true,
          },
          heading ? "-=0.52" : 0,
        );
      }

      if (divider) {
        gsap.set(divider, { scaleY: 0, transformOrigin: "top center", force3D: true });
        tl.to(
          divider,
          {
            scaleY: 1,
            duration: motion.duration.medium,
            ease: motion.ease.editorial,
            force3D: true,
          },
          portrait ? "-=0.62" : 0,
        );
      }

      if (paragraphs.length) {
        gsap.set(paragraphs, { autoAlpha: 0, x: 14, y: motion.reveal.ySoft, force3D: true });
        tl.to(
          paragraphs,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: motion.duration.medium,
            ease: motion.ease.reveal,
            stagger: 0.14,
            force3D: true,
          },
          divider || portrait ? "-=0.42" : 0,
        );
      }

      refreshScrollTriggers();
    }, section);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero-reveal-first
      className="group/section relative border-t border-line-accent/35 bg-gradient-to-b from-[#f8f7f4] via-zinc-100 to-[#f3f2ee] py-20 md:py-24"
    >
      <div className="grid gap-10 md:grid-cols-12 md:items-stretch md:gap-x-0 md:gap-y-0">
        <div data-col-left className="md:col-span-5 md:pr-10 lg:pr-14">
          <h2
            data-team-heading
            className="font-serif text-3xl font-medium leading-[1.12] tracking-tight text-zinc-900 md:text-[2.35rem]"
          >
            Coaching med Carolina
          </h2>
          <div
            data-team-portrait
            className="relative mt-8 aspect-[4/5] w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-200/40 shadow-[0_10px_40px_-16px_rgb(24_24_27_/_0.18)] transition-[transform,box-shadow] duration-500 motion-reduce:transition-none md:group-hover/section:-translate-y-1 md:group-hover/section:shadow-[0_18px_48px_-14px_rgb(24_24_27_/_0.22)]"
          >
            <Image
              src={CAROLINA_IMAGE}
              alt="Carolina von Braun, coach och grundare av CVB Coaching"
              fill
              sizes="(min-width: 768px) 38vw, 100vw"
              className="object-cover object-[center_22%] transition-transform duration-700 motion-reduce:transition-none md:group-hover/section:scale-[1.03]"
              quality={85}
              priority
            />
          </div>
        </div>

        <div
          data-col-right
          className="relative space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:flex md:max-w-xl md:flex-col md:justify-center md:pl-10 md:justify-self-end lg:pl-14"
        >
          <span
            data-team-divider
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px origin-top bg-line-accent/25 md:block"
          />
          <p data-col-paragraph>
            Jag heter Carolina von Braun. CVB Coaching är min personliga coachingpraktik. Jag
            arbetar med människor som behöver få syn på sin situation klarare — privat eller i
            arbetslivet.
          </p>
          <p data-col-paragraph>
            Med erfarenhet från arbetsliv där beslut får konkreta konsekvenser erbjuder jag ett
            lugnt, professionellt och konfidentiellt samtalsrum. Min uppgift är inte att tala om vad
            du ska göra, utan att hjälpa dig tänka, välja och gå vidare på ett sätt som håller för
            dig.
          </p>
          <div data-col-paragraph className="mt-12">
            <CtaLink href="/om-oss" variant="primary">
              Läs om Carolina och hennes arbetssätt
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## File: src/components/engagement-section.tsx

### Affected route(s)
shared — /, /en

### Current source

```tsx
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
```

---

## File: src/components/engagement-bento-grid.tsx

### Affected route(s)
shared — /, /en

### Current source

```tsx
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
  layout: string;
};

const stepsSv: Step[] = [
  {
    index: "01",
    title: "Första samtalet",
    body: "Konfidentiellt. Du berättar om din situation, och tillsammans ser vi om coaching är rätt stöd och om vi fungerar bra ihop.",
    layout: "md:col-span-6 lg:col-span-7",
  },
  {
    index: "02",
    title: "Vad du vill bli klarare i",
    body: "Jag hjälper dig att sätta ord på vad du vill bli klarare i och vad du vill kunna göra annorlunda.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "03",
    title: "Samtalen",
    body: "Du och jag bestämmer rytmen tillsammans. Varje samtal avslutas med något du tar med dig vidare.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "04",
    title: "Avslut",
    body: "Du och jag stämmer av mot det du ville uppnå och ser tillsammans om arbetet är klart eller ska fortsätta.",
    layout: "md:col-span-6 lg:col-span-7",
  },
];

const stepsEn: Step[] = [
  {
    index: "01",
    title: "The first conversation",
    body: "Confidential. We talk about your situation and work out together whether coaching is the right support and whether we are a good fit.",
    layout: "md:col-span-6 lg:col-span-7",
  },
  {
    index: "02",
    title: "What you want to get clearer about",
    body: "We put into words what needs to be different for the conversations to make a real difference.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "03",
    title: "The sessions",
    body: "We set the rhythm together. Every conversation ends with something you take further.",
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

/**
 * Alla fyra stegen tonas in en gång när sektionen kommer in i vyn och blir
 * sedan kvar. Tidigare låg korten 2–4 bakom en scrub-styrd tidslinje på
 * desktop, vilket gjorde att de kunde stå kvar dolda — innehållet får inte
 * vara beroende av hur långt besökaren har hunnit rulla.
 */
function buildStepsReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  footnote: HTMLElement | null,
) {
  // Korten hålls synliga hela tiden och animeras bara i position. Innehållet får
  // aldrig vara beroende av att en scroll-animation hinner köra.
  gsap.set(steps, { autoAlpha: 1, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });
  gsap.set(cards, { autoAlpha: 1, y: 14, force3D: true });
  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  if (footnote) {
    gsap.set(footnote, { autoAlpha: 0, y: 10, force3D: true });
  }

  const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(panel) });

  tl.to(
    cards,
    {
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
      buildStepsReveal(panel, cards, progressSteps, progressLines, accents, footnote);
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
```

---

## File: src/lib/i18n/dictionaries/sv.ts

### Affected route(s)
shared — all Swedish routes

### Current source

```ts
export const svDictionary = {
  localeLabel: "Svenska",
  languageSwitcher: {
    ariaLabel: "Välj språk",
    english: "English",
    swedish: "Svenska",
    switchToEnglish: "Byt språk till engelska",
    switchToSwedish: "Byt språk till svenska",
  },
  nav: {
    mainAria: "Huvudnavigation",
    mobileAria: "Mobil navigation",
    menuOpen: "Öppna meny",
    menuClose: "Stäng meny",
    home: "Start",
    coaching: "Coaching",
    about: "Om CVB Coaching",
    contact: "Kontakt",
    login: "Klientinloggning",
    leadershipLabel: "Två vägar in",
    startHereLabel: "Osäker?",
    unsureTitle: "Vet du inte vilken väg som är din?",
    unsureBody:
      "Börja med ett samtal. Vi avgör tillsammans var frågan hör hemma.",
    bookFirstCall: "Boka ett inledande samtal →",
  },
  footer: {
    description:
      "Individuell coaching och business coaching, från Göteborg.",
    services: "Coaching",
    about: "Om",
    portal: "Portal",
    login: "Logga in",
    clientPortal: "Logga in – klient",
    coachLogin: "Logga in – coach",
    copyright: "© 2026 CVB Coaching",
  },
  cta: {
    primary: "Boka ett första samtal",
    secondary: "Se de två sätten att arbeta",
    tertiary: "Omfattning och investering",
    engagementLink: "Så går det till →",
  },
  form: {
    generalError: "Fyll i de obligatoriska fälten innan du skickar förfrågan.",
    emailError: "Ange en giltig e-postadress.",
    fieldRequired: "Detta fält är obligatoriskt.",
    selectRequired: "Välj ett alternativ.",
    successMessage: "Tack. Din förfrågan är mottagen.",
    bookingSuccessMessage:
      "Tack för din förfrågan. CVB Coaching återkommer med en bekräftelse.",
    submitError: "Förfrågan kunde inte skickas just nu. Försök igen om en stund.",
    ariaLabel: "Kontaktformulär",
    optional: "valfritt",
    continue: "Fortsätt",
    submitAnyway: "Skicka ändå",
    confidentialityNote: "All kontakt hanteras konfidentiellt.",
    sections: {
      contact: "Kontaktuppgifter",
      scheduling: "Boka ett inledande telefonsamtal",
      situation: "Situation",
      nextStep: "Nästa steg",
    },
    fields: {
      name: "Namn",
      organization: "Organisation",
      role: "Roll",
      email: "E-post",
      phone: "Telefon",
      city: "Ort",
      question: "Vad gäller det?",
      phase: "Vilket läge står ni i?",
      situation: "Vad vill du ta upp?",
      clarity: "Vad behöver bli tydligare?",
      timing: "När vill du komma vidare?",
      preferredDate: "Datum",
      preferredTime: "Tid på dagen",
    },
    schedulingHint: "Välj en tid som passar dig. CVB Coaching bekräftar bokningen.",
    timeSlotAria: "Välj tid på dagen",
    timeWindows: {
      "08_10": "08:00–10:00",
      "10_12": "10:00–12:00",
      "12_14": "12:00–14:00",
      "14_16": "14:00–16:00",
      "16_17": "16:00–17:00",
    },
    submit: {
      idle: "Skicka förfrågan",
      submitting: "Skickar…",
    },
  },
} as const;
```
