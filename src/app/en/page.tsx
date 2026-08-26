import Link from "next/link";
import CtaLink from "@/components/cta-link";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import EditorialImageTransition from "@/components/animations/EditorialImageTransition";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import type { Metadata } from "next";

import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: "CVB Coaching – individual and business coaching in Gothenburg",
  description:
    "CVB Coaching in Gothenburg. Individual coaching for anyone facing a choice or a change, and business coaching for leaders, employees, teams and executive teams.",
};

const relevancePoints = [
  "A choice has to be made before you know enough.",
  "You are doing everything you normally do and still are not moving.",
  "The role has grown faster than the mandate.",
  "Something has ended — a job, a project, a way of working — and the next thing has not taken shape.",
  "Priorities shift more often than the organisation can adjust.",
  "Decisions are made in the room but lose force in day-to-day work.",
];

const rightFitWhen = [
  "The question genuinely matters to you, not just on paper.",
  "You want to finish the thinking yourself, not be handed an answer.",
  "It needs to happen outside your own circle, in confidence.",
  "Something is meant to change, not only be discussed.",
];

const lessSuitedWhen = [
  "You want an expert to assess the situation and tell you what to do.",
  "The question concerns ill health or needs treatment. Therapy is the right route then, not coaching.",
  "The direction is already set and what remains is carrying it out.",
];

const t = enDictionary;

export default function HomePageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <ParallaxController>
        <section
          data-hero-sticky
          className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
        >
          <HeroVideoBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" aria-hidden="true" />
          <SiteNavigation />
          <div className="pointer-events-none absolute inset-0 z-[2]">
            <div className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[max(clamp(2.5rem,8svh,4.5rem),env(safe-area-inset-bottom,0px))] md:absolute md:left-[5.5vw] md:top-[66%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
              <div
                className="w-full shrink-0 min-h-[min(38svh,22rem)] md:hidden"
                aria-hidden="true"
              />
              <HeroReveal className="relative flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center sm:max-w-[24rem] md:max-w-lg md:items-start md:text-left lg:max-w-xl">
                <div className="relative w-full md:max-w-lg lg:max-w-xl">
                  <h1
                    data-hero-headline
                    className="relative mx-auto max-w-[18ch] text-4xl font-medium leading-[1.1] tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:mx-0 md:max-w-none md:text-6xl md:leading-[1.08] lg:text-7xl"
                  >
                    Some questions are difficult to think through alone.
                  </h1>
                </div>
                <div className="mt-9 flex w-full flex-col items-center gap-4 md:mt-10 md:w-fit md:flex-row md:flex-wrap md:items-start md:justify-start md:gap-3.5">
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en/kontakt" variant="primary" translucent>
                      {t.cta.primary}
                    </CtaLink>
                  </span>
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en#coaching" variant="secondary" translucent>
                      {t.cta.secondary}
                    </CtaLink>
                  </span>
                </div>
              </HeroReveal>
            </div>
          </div>
        </section>

        <div className="relative z-10 isolate bg-zinc-100">
          <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
            <section
              data-hero-reveal-first
              className="relative bg-gradient-to-b from-[#f8f7f4] via-zinc-100 to-[#f3f2ee] py-20 md:py-24"
            >
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16 md:gap-y-10">
                <h2
                  data-col-left
                  className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:pr-4 md:text-[2.1rem]"
                >
                  You will be working with me.
                </h2>
                <div
                  data-col-right
                  className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end"
                >
                  <p data-col-paragraph>
                    I am Carolina von Braun, and I run CVB Coaching in Gothenburg. Before becoming a
                    coach, I worked in capital markets and served on company boards. That experience
                    means I recognise situations where decisions carry real consequences.
                  </p>
                  <p data-col-paragraph>
                    As a coach the job is a different one: to make the thinking clearer, not to take
                    over your conclusions.{" "}
                    <Link
                      href="/en/om-oss"
                      className="underline underline-offset-4 decoration-zinc-400 transition-colors hover:text-zinc-950 hover:decoration-zinc-700"
                    >
                      More about me
                    </Link>
                    .
                  </p>
                </div>
              </ScrollReveal>
            </section>

            <section
              id="coaching"
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white pt-20 pb-0 md:pt-24"
            >
              <div className="mx-auto max-w-6xl px-6 md:px-10">
                <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Two ways in
                </h2>
                <p className="mt-6 max-w-2xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  The same approach, in two settings: personal or professional.
                </p>
                <div className="mt-14">
                  <CoachingServicesGrid locale="en" />
                </div>
              </div>
              <EditorialImageTransition
                src="/supertable.png"
                alt="Preparing for a coaching session"
                className="mt-20 md:mt-24"
              />
            </section>

            <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Six situations where coaching belongs
                </h2>
                <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
                  <ScrollReveal variant="staggerList" className="mt-0">
                    <ul className="space-y-5 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
                      {relevancePoints.map((point) => (
                        <li key={point} data-list-item className="flex items-start gap-4">
                          <span className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  How to tell whether this is right
                </h2>
                <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
                  <ScrollReveal variant="staggerList">
                    <h3 className="text-lg font-medium text-zinc-900">Right fit when</h3>
                    <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-800">
                      {rightFitWhen.map((point) => (
                        <li key={point} data-list-item className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-8 text-lg font-medium text-zinc-900">Less suited when</h3>
                    <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-700">
                      {lessSuitedWhen.map((point) => (
                        <li key={point} data-list-item className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-400" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </section>

            <section
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
            >
              <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
                <h2
                  data-section-heading
                  className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
                >
                  What the work involves
                </h2>
                <div className="mt-16 border-y border-line-accent/30">
                  <article
                    data-editorial-row
                    className="border-b border-line-accent/30 py-12 md:py-14"
                  >
                    <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                      <p
                        data-row-index
                        className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                      >
                        01
                      </p>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                      >
                        Clarity
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        The question you arrive with is rarely the one that decides anything. The
                        work begins by telling them apart.
                      </p>
                    </div>
                  </article>
                  <article
                    data-editorial-row
                    className="border-b border-line-accent/30 py-12 md:py-14"
                  >
                    <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                      <p
                        data-row-index
                        className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                      >
                        02
                      </p>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                      >
                        Decisions
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        A decision is tested before it is made. What you are weighing against what,
                        what you actually know, and what you are giving up.
                      </p>
                    </div>
                  </article>
                  <article data-editorial-row className="py-12 md:py-14">
                    <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                      <p
                        data-row-index
                        className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                      >
                        03
                      </p>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                      >
                        Direction
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        What matters happens between the sessions. We look at what you actually did,
                        not what you meant to do.
                      </p>
                    </div>
                  </article>
                </div>
              </EditorialRowsReveal>

            </section>

            <EngagementSection locale="en" />

            <section
              data-parallax-image-only
              className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 bg-white"
            >
              <EditorialImageTransition
                src="/superoffice.png"
                alt="Individual coaching at CVB Coaching"
                breakout={false}
              />
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Gothenburg, or online where that suits better
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
                  <p>
                    CVB Coaching is based in Gothenburg. Sessions take place in person or online.
                  </p>
                  <p>What is said in the session is treated in confidence.</p>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-image-only>
              <EditorialImageTransition
                src="/supermeeting.png"
                alt="Business coaching in a confidential session"
                className="mt-20 md:mt-24"
              />
            </section>

            <section data-parallax-section id="kontakt" className="py-20 md:py-24">
              <ScrollReveal variant="ctaStack">
                <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
                  Next step
                </h2>
                <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
                  Write a few lines about what it concerns, and pick a time. The conversation is
                  confidential.
                </p>
                <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
                  <CtaLink href="/en/kontakt" variant="primary">
                    {t.cta.primary}
                  </CtaLink>
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </ParallaxController>
    </main>
  );
}
