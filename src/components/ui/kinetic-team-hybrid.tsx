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
            Bakom CVB Coaching
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
            Bakom <strong className="font-semibold">CVB Coaching</strong> står Carolina von Braun, med erfarenhet från kapitalmarknad och
            styrelsearbete – miljöer där beslut ofta får konkreta konsekvenser.
          </p>
          <p data-col-paragraph>
            I coachrollen är uppgiften en annan: att göra tänkandet klarare utan att ta över
            slutsatserna.
          </p>
          <div data-col-paragraph className="mt-12">
            <CtaLink href="/om-oss" variant="primary">
              Mer om mig
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
