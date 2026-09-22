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
      className="group/section relative overflow-hidden bg-zinc-950 text-zinc-100"
    >
      {/* Kapitelnumret står som liten guldsiffra nedan. Den jättelika skuggsiffran
          upprepade samma nummer i postformat — samma visuella språk som scenernas
          interna 01/02/03 — och är borttagen för att hålla de två nivåerna åtskilda. */}
      <div className="mx-auto grid max-w-7xl gap-y-12 px-6 py-24 md:grid-cols-12 md:gap-x-8 md:px-10 md:py-32 lg:py-40">
        <div data-col-left className="relative md:col-span-5 md:row-span-2">
          <p className="mb-12 text-xs font-medium tabular-nums tracking-[0.32em] text-[#b89a60] md:mb-16">
            03
          </p>
          <h2
            data-team-heading
            className="max-w-sm font-serif text-[clamp(2.8rem,5vw,5.6rem)] font-medium leading-[0.94] tracking-[-0.045em] text-white"
          >
            Coaching med Carolina
          </h2>
          <div
            data-team-portrait
            className="relative mt-12 aspect-[4/5] w-full max-w-md overflow-hidden bg-zinc-900 md:mt-20"
          >
            <Image
              src={CAROLINA_IMAGE}
              alt="Carolina von Braun, coach och grundare av CVB Coaching"
              fill
              sizes="(min-width: 1280px) 31rem, (min-width: 768px) 40vw, 100vw"
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
            className="mb-10 block h-px w-full origin-left bg-[#967844]/60 md:mb-14"
          />
          <p data-col-paragraph className="max-w-xl">
            Jag heter Carolina von Braun och driver CVB Coaching. Jag är diplomerad coach vid
            Gothia Akademi och har genomgått ICF-ackrediterad coachutbildning på Level 1 och Level
            2.
          </p>
          <p data-col-paragraph className="mt-9 max-w-xl text-xl leading-[1.55] text-zinc-100 md:mt-12 md:text-2xl">
            Min yrkesbakgrund omfattar bland annat värdepappershandel på Nordea och styrelseuppdrag
            inom fastighetsförvaltning och investeringar. Den erfarenheten finns med som bakgrund i
            samtalet — inte som ett facit för dina beslut.
          </p>
          <p
            data-col-paragraph
            className="mt-9 max-w-xl border-t border-white/15 pt-8 text-[0.875rem] leading-[1.65] text-zinc-400"
          >
            Diplomerad coach vid Gothia Akademi · ICF-ackrediterad coachutbildning på Level 1 och
            Level 2 · Göteborg och digitalt
          </p>
          <div data-col-paragraph className="mt-12 md:mt-16">
            <CtaLink href="/om-oss" variant="secondary" translucent>
              Läs om Carolina och hennes arbetssätt
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
