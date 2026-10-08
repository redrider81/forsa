"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  homeMediaReveal,
  homeTravel,
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
    paragraphs: string[];
    linkHref: string;
    linkLabel: string;
  }
> = {
  sv: {
    heading: "Coaching med Carolina",
    imageAlt: "Carolina von Braun, coach och grundare av CVB Coaching",
    // Samma fyra stycken som Carolina-avsnittet på /om-oss.
    paragraphs: [
      "Diplomerad Professionell Coach med lång erfarenhet av arbetsliv, ledarskap och företagande.",
      "Jag driver CVB Coaching i Göteborg och har närmare 20 års erfarenhet från säljande och ledande roller inom bank, samt erfarenhet av eget företagande inom finans och fastighet.",
      "Idag arbetar jag som coach och möter både privatpersoner och människor i arbetslivet. Med min erfarenhet och utbildning som grund skapar jag ett tryggt och professionellt samtal.",
      "För mig handlar coaching om att skapa ett tryggt och förtroendefullt utrymme där du kan tänka högt, reflektera och se på din situation ur olika perspektiv. Min uppgift är att hjälpa dig att undersöka dina egna tankar och idéer, utmana det som behöver utmanas och hitta det som känns relevant för dig. Det är också viktigt för mig att våra samtal har ett mål. Du ska känna att tiden vi lägger tillsammans är värdefull och att du får med dig något som du kan använda efter samtalet.",
    ],
    linkHref: "/om-oss",
    linkLabel: "Läs om Carolina och hennes arbetssätt",
  },
  en: {
    heading: "Coaching with Carolina",
    imageAlt: "Carolina von Braun, coach and founder of CVB Coaching",
    // Same four paragraphs as the Carolina section on /en/om-oss.
    paragraphs: [
      "Qualified Professional Coach with long experience of working life, leadership and running a business.",
      "I run CVB Coaching in Gothenburg and have nearly 20 years of experience in sales and leadership roles in banking, as well as experience of running my own business in finance and property.",
      "Today I work as a coach and meet both private individuals and people in working life. With my experience and training as a foundation, I create a safe and professional conversation.",
      "For me, coaching is about creating a safe and trusting space where you can think out loud, reflect and look at your situation from different perspectives. My role is to help you explore your own thoughts and ideas, challenge what needs to be challenged and find what feels relevant to you. It is also important to me that our conversations have a goal. You should feel that the time we spend together is valuable and that you take away something you can use after the conversation.",
    ],
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

    const label = section.querySelector<HTMLElement>("[data-team-label]");
    const heading = section.querySelector<HTMLElement>("[data-team-heading]");
    const portrait = section.querySelector<HTMLElement>("[data-team-portrait]");
    const textCol = section.querySelector<HTMLElement>("[data-col-right]");
    const divider = section.querySelector<HTMLElement>("[data-team-divider]");
    const paragraphs = section.querySelectorAll<HTMLElement>("[data-col-paragraph]");

    const targets = [label, heading, portrait, divider, ...paragraphs].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    /*
     * Sektionen är hög: rubrik och porträtt står överst i vänsterspalten och
     * texten är nedtill förankrad i högerspalten (staplad under porträttet på
     * mobil). En enda trigger på sektionens överkant spelade därför porträttet
     * och texten utanför vyn. Nu har rubriken, porträttet och textspalten var
     * sin trigger och spelar när de faktiskt når vyn.
     */
    gsap.registerPlugin(ScrollTrigger);
    const travel = homeTravel();
    const ctx = gsap.context(() => {
      const lead = [label, heading].filter(Boolean) as HTMLElement[];
      if (lead.length) {
        gsap.set(lead, { autoAlpha: 0, y: travel.y, force3D: true });
        gsap.to(lead, {
          autoAlpha: 1,
          y: 0,
          duration: motion.home.duration.heading,
          ease: motion.home.ease.heading,
          stagger: motion.home.stagger.text,
          force3D: true,
          scrollTrigger: revealScrollTrigger(heading ?? lead[0]),
        });
      }

      if (portrait) {
        // Bilden har en egen hover-transition på transform; därför avtäcks
        // ramen, inte själva bilden. Beskärningen är oförändrad i slutläget.
        gsap.set(portrait, { clipPath: "inset(100% 0% 0% 0%)" });
        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(portrait) });
        tl.add(homeMediaReveal(portrait, false), heading ? 0.15 : 0);
      }

      if (textCol && (divider || paragraphs.length)) {
        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(textCol) });
        if (divider) {
          gsap.set(divider, { scaleX: 0, transformOrigin: "left center", force3D: true });
          tl.to(
            divider,
            {
              scaleX: 1,
              duration: motion.home.duration.media,
              ease: motion.ease.editorial,
              force3D: true,
            },
            0,
          );
        }
        if (paragraphs.length) {
          gsap.set(paragraphs, { autoAlpha: 0, y: travel.yText, force3D: true });
          tl.to(
            paragraphs,
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.home.duration.text,
              ease: motion.home.ease.text,
              stagger: 0.16,
              force3D: true,
            },
            divider ? 0.3 : 0,
          );
        }
      }

      refreshScrollTriggers();
    }, section);

    return () => {
      ctx.revert();
      showTargets(targets);
      if (portrait) gsap.set(portrait, { clearProps: "clipPath" });
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
          <p
            data-team-label
            className="mb-10 text-xs font-medium tabular-nums tracking-[0.32em] text-white md:mb-14"
          >
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
          {c.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              data-col-paragraph
              className={`max-w-xl${index > 0 ? " mt-7" : ""}`}
            >
              {paragraph}
            </p>
          ))}
          <div data-col-paragraph className="mt-10 flex justify-center md:mt-12 md:justify-start">
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
