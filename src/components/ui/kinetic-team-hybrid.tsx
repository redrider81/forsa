"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";
import type { Locale } from "@/lib/i18n/config";
import { HOME_DISPLAY } from "@/lib/homepage-typography";

const CAROLINA_IMAGE = "/carolina-von-braun.webp";

const copy: Record<
  Locale,
  {
    heading: string;
    imageAlt: string;
    intro: string;
    background: string;
    credentials: string;
    linkHref: string;
    linkLabel: string;
  }
> = {
  sv: {
    heading: "Coaching med Carolina",
    imageAlt: "Carolina von Braun, coach och grundare av CVB Coaching",
    intro: "Jag heter Carolina von Braun och driver CVB Coaching.",
    background:
      "Min yrkesbakgrund omfattar bland annat värdepappershandel på Nordea och styrelseuppdrag inom fastighetsförvaltning och investeringar. Den erfarenheten finns med som bakgrund i samtalet — inte som ett facit för dina beslut.",
    credentials:
      "Diplomerad coach vid Gothia Akademi · ICF-ackrediterad coachutbildning på Level 1 och Level 2 · Göteborg och digitalt",
    linkHref: "/om-oss",
    linkLabel: "Läs om Carolina och hennes arbetssätt",
  },
  en: {
    heading: "Coaching with Carolina",
    imageAlt: "Carolina von Braun, coach and founder of CVB Coaching",
    intro: "I am Carolina von Braun, and I run CVB Coaching.",
    background:
      "My professional background includes securities trading at Nordea and board assignments in property management and investments. That experience is present in the conversation as background — not as the answer key to your decisions.",
    credentials:
      "Qualified coach, Gothia Akademi · ICF-accredited coach training at Level 1 and Level 2 · Gothenburg and online",
    linkHref: "/en/om-oss",
    linkLabel: "Read about Carolina and how she works",
  },
};

type Props = {
  locale?: Locale;
};

export default function KineticTeamHybrid({ locale = "sv" }: Props) {
  const c = copy[locale];
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
        gsap.set(portrait, {
          autoAlpha: 0,
          y: motion.reveal.y,
          scale: motion.reveal.scaleFrom,
          force3D: true,
        });
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
          heading ? "-=0.55" : 0,
        );
      }

      if (divider) {
        gsap.set(divider, { scaleX: 0, transformOrigin: "left center", force3D: true });
        tl.to(
          divider,
          {
            scaleX: 1,
            duration: motion.duration.medium,
            ease: motion.ease.editorial,
            force3D: true,
          },
          portrait ? "-=0.62" : 0,
        );
      }

      if (paragraphs.length) {
        gsap.set(paragraphs, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
        tl.to(
          paragraphs,
          {
            autoAlpha: 1,
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
      data-parallax-section
      className="group/section relative overflow-hidden bg-surface-dark text-zinc-100"
    >
      {/* Kapitelnumret står som liten guldsiffra nedan. Den jättelika skuggsiffran
          upprepade samma nummer i postformat — samma visuella språk som scenernas
          interna 01/02/03 — och är borttagen för att hålla de två nivåerna åtskilda. */}
      <div className="mx-auto grid max-w-7xl gap-y-10 px-6 py-24 md:grid-cols-12 md:gap-x-8 md:px-10 md:py-32 lg:py-40">
        <div data-col-left className="relative md:col-span-5 md:row-span-2">
          <p className="mb-10 text-xs font-medium tabular-nums tracking-[0.32em] text-white md:mb-14">
            04
          </p>
          <h2
            data-team-heading
            className={`max-w-sm ${HOME_DISPLAY} text-white`}
          >
            {c.heading}
          </h2>
          {/* Porträttet bär akten. Det tidigare max-w-md kapade bilden långt innan
              spalten tog slut — utan taket fyller den sina fem kolumner och blir
              scenens tyngdpunkt i stället för en illustration bredvid rubriken. */}
          <div
            data-team-portrait
            className="relative mt-10 aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.25rem] bg-zinc-900 md:mt-14 md:aspect-[3/4] md:max-w-none md:rounded-[1.75rem] lg:rounded-[2rem]"
          >
            <Image
              src={CAROLINA_IMAGE}
              alt={c.imageAlt}
              fill
              sizes="(min-width: 1280px) 33rem, (min-width: 768px) 42vw, 100vw"
              className="object-cover object-[center_22%] transition-transform duration-700 motion-reduce:transition-none md:group-hover/section:scale-[1.015]"
              quality={75}
              priority
            />
          </div>
        </div>

        <div
          data-col-right
          className="relative text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-6 md:col-start-7 md:row-start-2 md:self-end lg:col-span-5 lg:col-start-8"
        >
          <span
            data-team-divider
            aria-hidden="true"
            className="mb-9 block h-px w-full origin-left bg-zinc-500/70 md:mb-12"
          />
          <p data-col-paragraph className="max-w-xl">
            {c.intro}
          </p>
          <p data-col-paragraph className="mt-9 max-w-xl text-xl leading-[1.55] text-zinc-100 md:mt-12 md:text-2xl">
            {c.background}
          </p>
          <p
            data-col-paragraph
            className="mt-8 max-w-xl border-t border-white/15 pt-7 text-[0.875rem] leading-[1.65] text-zinc-400"
          >
            {c.credentials}
          </p>
          <div data-col-paragraph className="mt-10 md:mt-12">
            <Link
              href={c.linkHref}
              className="inline-flex items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-[color,background-color,border-color] duration-200 hover:border-zinc-100 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
            >
              {c.linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
