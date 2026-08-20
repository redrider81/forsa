import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import { ServicePricingSection } from "@/components/pricing-block";

export const metadata: Metadata = {
  title: "Executive team coaching Gothenburg | CVB Coaching",
  description:
    "For executive teams where priorities drift and decisions lose force between meetings. We work with mandate, accountability and decision mechanics – not team-building.",
};

const patterns = [
  {
    index: "01",
    title: "Priority drift",
    body: "Priorities change more often than the organisation can adjust. No single change is wrong. The sum becomes unclear direction.",
  },
  {
    index: "02",
    title: "Mandate gap",
    body: "Accountability is distributed but mandate is not. Questions get stuck at the interfaces between functions.",
  },
  {
    index: "03",
    title: "Execution drop",
    body: "The decision is made in the room but lacks an owner, a date and a measure. It returns on the next agenda.",
  },
  {
    index: "04",
    title: "Friction without an addressee",
    body: "Tensions exist but are not named. They slow the pace without anyone being able to point to where.",
  },
];

const focusList = [
  "The executive team's decision mechanics: what is decided here and what is decided elsewhere.",
  "Shared prioritisation, and what is actively chosen against.",
  "Accountability and mandate at the interfaces between roles.",
  "Friction that is named and handled rather than carried.",
  "The path from decision made to execution in day-to-day work.",
];

const nonGoals = [
  "Not team-building or group exercises.",
  "Not strategy work on behalf of leadership. You own the decisions.",
  "Not a one-off intervention without follow-up.",
];

const outcomes = [
  "A shorter path from discussion to decision made.",
  "Consistency between decisions, accountability and follow-up.",
  "The executive team holds together when pressure rises.",
];

export default function LeadershipTeamCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Executive team coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              The executive team as a decision forum, not a meeting.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For executive teams that need shared priorities, higher decision quality and decisions
              that survive the meeting.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Four patterns that drain decision power
          </h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-2">
            {patterns.map((item) => (
              <div data-card key={item.title} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{item.index}</p>
                <h3 className="mt-3 text-lg font-medium text-zinc-900">{item.title}</h3>
                <p className="mt-2 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </StaggerCards>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              What we work with
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-1">
              {focusList.map((item) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              How we work
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                The work starts from the executive team&apos;s real decision questions, not exercises.
                We make the session more precise, the priorities fewer and accountability explicit.
              </p>
              <p>
                Between sessions, decisions are followed up so direction shows up in action.
              </p>
              <p>
                Focus lies on mandate and accountability systems, not team-building or workshop
                formats.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">What it is not</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nonGoals.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
                    text: "Several leaders in the same organisation, with separate coaching relationships and a shared objective for accountability and decisions. Scope is set after the size of the group and the length of the engagement.",
                  },
                  { text: "", priceKey: "leadershipGroup" },
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
              Briefly describe where it catches in the decision chain. The conversation is
              confidential.
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
