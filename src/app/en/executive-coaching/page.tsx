import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Executive coaching for CEOs and founders | CVB Coaching",
  description:
    "An external room with no internal agenda, for decisions made with incomplete information and real consequence.",
};

const relevanceList = [
  "The decision must be made before the information is complete.",
  "Accountability in the role has grown faster than the mandate.",
  "Two priorities exclude each other and both have strong advocates.",
  "The pace of change requires wrong decisions to be caught earlier than before.",
];

const focusList = [
  "Testing the reasoning behind a decision before it is made, especially when the information is incomplete.",
  "Where the role's accountability begins and ends in relation to owners, the board and the executive team.",
  "Choices made under uncertainty, with the trade-offs brought into the open.",
  "Preparing conversations and messages that cannot afford to be misread.",
  "How direction is held when the load in the role is high.",
];

const nonGoals = [
  "Not therapy or working through private matters.",
  "Not management consulting with ready-made recommendations.",
];

const outcomes = [
  "From an open question to a defined next step.",
  "Decisions that hold once they have to be carried out.",
  "Lower load in the role when decisions carry real weight.",
];

export default function ExecutiveCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Executive coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              A room with no internal agenda.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For CEOs, founders and senior leaders who make decisions with incomplete information
              and high consequences. Confidential, business-near and connected to what actually needs
              to be decided.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
              Executive coaching is one form of{" "}
              <Link href="/en/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                business coaching
              </Link>
              . If you are booking for yourself, see{" "}
              <Link href="/en/individuell-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Individual coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              At the top, experience is rarely the issue. What is often missing is challenge.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Senior leaders rarely lack analysis. What is missing under pressure is someone to
                test the reasoning without a stake of their own in the question.
              </p>
              <p>
                Internally, every conversation partner has a stake in the outcome. Externally, it is
                possible to finish the thinking before the decision becomes public.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Four situations where the session makes the greatest difference
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
              Focus in the sessions
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
              How it works
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                The work starts from your actual context, not from theoretical models. Sessions keep
                a steady rhythm, and each one ends with a defined next step.
              </p>
              <p>
                This is confidential coaching for reflection and accountability, not strategy
                consulting. The client owns their objectives, their insights and their decisions.
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

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Briefly describe the question on the table. The conversation is confidential.
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
