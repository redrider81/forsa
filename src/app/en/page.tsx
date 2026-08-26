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
import { HomePricingFooter, HomePricingTable } from "@/components/pricing-block";

import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: "Executive coaching Gothenburg | CVB Coaching",
  description:
    "Confidential decision support for CEOs, founders and executive teams in Gothenburg. Defined objectives, fixed cadence and follow-up until decisions show up in execution.",
};

const relevancePoints = [
  "A strategic choice must be made with incomplete information.",
  "Priorities shift more often than the organisation can adjust.",
  "Friction in the executive team is slowing decisions that cannot wait.",
  "The company is entering growth, transition or a new ownership phase.",
  "Pressure from owners or the board is increasing the pace of demands and reporting.",
  "Decisions are made in the room but lose force in day-to-day work.",
];


const rightFitWhen = [
  "The question concerns leadership, accountability or direction.",
  "The decision affects the organisation's next step.",
  "You need confidential external support.",
  "You want to move from discussion to a decision made.",
];

const lessSuitedWhen = [
  "The need is general inspiration without a clear leadership question.",
  "The intervention should be short with no follow-up.",
  "Direction and decisions are already settled.",
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
              <HeroReveal className="relative flex w-full max-w-[20rem] shrink-0 flex-col items-center text-center sm:max-w-[21rem] md:max-w-md md:items-start md:text-left lg:max-w-lg">
                <div className="relative w-full md:max-w-md lg:max-w-lg">
                  <h1
                    data-hero-headline
                    className="relative mx-auto inline-block max-w-[18ch] rounded-2xl bg-black/18 px-4 py-3 text-[2rem] font-medium leading-[1.12] tracking-tight text-balance text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-[8px] drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-4xl md:mx-0 md:max-w-none md:px-5 md:py-4 md:text-5xl md:leading-tight"
                  >
                    Decisions that outlast the meeting.
                  </h1>
                </div>
                <div className="mt-9 flex w-full flex-col items-center gap-4 md:mt-10 md:w-fit md:flex-row md:flex-wrap md:items-start md:justify-start md:gap-3.5">
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en/kontakt" variant="primary" translucent>
                      {t.cta.primary}
                    </CtaLink>
                  </span>
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en#uppdrag" variant="secondary" translucent>
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
                  The capability is there. The decision mechanics do not always follow.
                </h2>
                <div
                  data-col-right
                  className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end"
                >
                  <p data-col-paragraph>
                    When pressure rises, teams often lack a shared picture of what is decided now, by
                    whom and when. Priorities drift and decisions made in the room do not take hold in
                    execution.
                  </p>
                  <p data-col-paragraph>
                    CVB Coaching works in that situation as an external and confidential decision forum
                    for leadership.
                  </p>
                </div>
              </ScrollReveal>
            </section>

            <section
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white pt-20 pb-0 md:pt-24"
            >
              <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
                <h2
                  data-section-heading
                  className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
                >
                  Three things we do concretely
                </h2>
                <div className="mt-16 border-y border-zinc-200/80">
                  <article
                    data-editorial-row
                    className="border-b border-zinc-200/80 py-12 md:py-14"
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
                        We identify the question that actually determines the next step and set the
                        rest aside. Normally within the first two sessions.
                      </p>
                    </div>
                  </article>
                  <article
                    data-editorial-row
                    className="border-b border-zinc-200/80 py-12 md:py-14"
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
                        We make input, trade-offs and accountability explicit before the decision is
                        made. Every decision gets an owner, a date and a measure.
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
                        We follow up between sessions until decisions show up in execution. Direction
                        is measured in action, not in minutes.
                      </p>
                    </div>
                  </article>
                </div>
              </EditorialRowsReveal>
              <EditorialImageTransition
                src="/supertable.png"
                alt="Preparation for a strategic choice in an executive team"
                className="mt-20 md:mt-24"
              />
            </section>

            <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Six situations where an external decision forum pays off
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
                  How we decide if it is the right engagement
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
              <div className="mx-auto max-w-6xl px-6 md:px-10">
                <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Coaching for leaders, teams and organisations
                </h2>
                <div className="mt-14">
                  <CoachingServicesGrid locale="en" />
                </div>
              </div>
            </section>

            <EngagementSection locale="en" />

            <section id="investering" data-parallax-section className="pt-12 pb-20 md:pt-14 md:pb-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Scope and investment
                </h2>
                <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
                  <p className="text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
                    Price follows scope, not title. The figures below are starting points. An exact
                    quote is provided after the first session, when objectives and scope are defined.
                  </p>
                  <div className="mt-8">
                    <HomePricingTable locale="en" />
                  </div>
                  <HomePricingFooter locale="en" />
                </div>
              </ScrollReveal>
            </section>

            <section
              data-parallax-image-only
              className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 bg-white"
            >
              <EditorialImageTransition
                src="/superoffice.png"
                alt="Individual coaching for managers and key professionals"
                breakout={false}
              />
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Gothenburg, with engagements across Sweden
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
                  <p>
                    CVB Coaching is based in Gothenburg and works with Swedish executive teams.
                    Sessions take place on site or digitally.
                  </p>
                  <p>
                    Engagements are delivered with high discretion. What is said in the room stays in
                    the room. What is reported to the sponsor is agreed in writing in advance.
                  </p>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-image-only>
              <EditorialImageTransition
                src="/supermeeting.png"
                alt="Executive team coaching in a confidential session"
                className="mt-20 md:mt-24"
              />
            </section>

            <section data-parallax-section id="kontakt" className="py-20 md:py-24">
              <ScrollReveal variant="ctaStack">
                <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
                  Next step
                </h2>
                <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
                  Briefly describe the situation your leadership team is in. The conversation is
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
