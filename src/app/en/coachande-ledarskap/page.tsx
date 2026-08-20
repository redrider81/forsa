import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import { ServicePricingSection } from "@/components/pricing-block";

export const metadata: Metadata = {
  title: "Coaching leadership – leadership programme | CVB Coaching",
  description:
    "Programme format for organisations that want to strengthen managers' ability to lead through questions, feedback and accountability. Five sessions over six months.",
};

const relevanceList = [
  "The quality of day-to-day leadership sessions varies too much between managers.",
  "The organisation wants to develop accountability without increasing micro-management.",
  "Feedback and development sessions are not delivering what they should.",
  "Learning stays with individuals rather than in the organisation.",
];

const focusList = [
  "The coaching session as a manager's tool.",
  "Questions and listening instead of instructions.",
  "Feedback and development sessions that create effect.",
  "Accountability without micro-management.",
  "Sessions that create learning in the organisation.",
];

const programmeFormat = [
  "Groups of six to ten managers.",
  "Five sessions of three hours over six months.",
  "Training in coaching sessions between sessions, applied in your own group.",
  "Individual review per participant at the midpoint.",
  "Closing evaluation against the objectives set at the start, reported to the sponsor.",
];

const outcomes = [
  "More even quality in sessions between manager and employee.",
  "Stronger accountability in teams and operations.",
  "Learning that stays in the organisation.",
];

export default function CoachingLeadershipPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Coaching leadership
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Leadership that works through conversation.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Programme format for organisations that want to strengthen managers&apos; ability to
              lead through questions, listening, feedback and accountability.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Why coaching leadership
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Managers who lead through sessions get accountability without micro-management.
                Engagements become explicit, feedback is given in time and learning stays in the
                organisation rather than with individuals.
              </p>
              <p>
                The effect shows first in the quality of day-to-day leadership sessions, then in
                how quickly problems surface.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Four situations where the programme is relevant
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {relevanceList.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Programme format
            </h2>
            <ScrollReveal variant="staggerList" data-col-right className="md:col-span-7">
              <ul className="space-y-3 text-zinc-700">
                {programmeFormat.map((item) => (
                  <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              What we work with
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {focusList.map((item) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Expected outcome</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomes.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Scope and investment
            </h2>
            <div data-col-right className="md:col-span-7">
              <ServicePricingSection
                locale="en"
                lines={[
                  {
                    text: "The programme is quoted per engagement after a review of target group, group size and desired scope.",
                  },
                  { text: "From", priceKey: "program" },
                  { text: "for a programme in the format above." },
                ]}
              />
              <p className="mt-6">
                <Link href="/en#uppdrag" className="text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
                  How an engagement works →
                </Link>
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Briefly describe the target group, number of managers and what the programme should
              achieve.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Book an initial conversation
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
