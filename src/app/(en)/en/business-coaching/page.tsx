import type { Metadata } from "next";
import { localeAlternates } from "@/lib/i18n/metadata";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  alternates: localeAlternates("/business-coaching", "en"),
  title: "Business coaching in Gothenburg | CVB Coaching",
  description:
    "Personal business coaching with Carolina von Braun for employees and leaders who need to think clearly about a work-related question. A company may initiate and fund the coaching; the conversations are individual and confidential.",
};

const relevanceList = [
  "You are facing a choice or decision and need to think clearly before moving forward.",
  "You have taken on greater responsibility or are going through a change.",
  "Priorities are shifting and you need to sort out what matters most.",
  "A decision has been made but needs to take root in everyday work.",
  "You need to speak freely and confidentially outside your own workplace.",
];

const nonGoals = [
  "Not advice with ready-made recommendations. You own your decisions.",
  "Not therapy or treatment. If the question is about ill health, therapy is the right route.",
  "Not a standardised programme. The shape follows the question and what you want to get clearer about.",
];

const processList = [
  "The company may make the first contact and fund the coaching.",
  "I speak with the company about the need, the boundaries of the collaboration and how contact works.",
  "The coaching then takes place in a personal, confidential relationship between Carolina and the client.",
  "If any feedback to the commissioning company is relevant, it is clearly agreed in advance.",
];

const valueList = [
  "What the question is really about.",
  "Which options exist and what they involve.",
  "Which next step is right for you.",
];

export default function BusinessCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Business coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              A question at work sometimes needs a space of its own.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching is personal coaching in working life. It suits employees and
              leaders who need to think clearly about a work-related question.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              The company may make the first contact and fund the coaching, while the conversations
              remain individual and confidential.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              If you are paying for the coaching yourself, see{" "}
              <Link href="/en/individuell-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Individual coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: premise */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              You do not think in a vacuum
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                At work, a question is often shaped by responsibility, relationships and expectations.
                In coaching, the focus is still your situation, your considerations and your choices.
              </p>
              <p>
                I am an outside conversation partner with no agenda of my own in the decision. My task
                is to help you think clearly — not to tell you what to do.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">
            When coaching at work can be right
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

        {/* List: process */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              How a collaboration works
            </h2>
            <div data-col-right className="md:col-span-7">
              <ScrollReveal variant="staggerList">
                <ul className="space-y-3 text-lg leading-8 text-zinc-700">
                  {processList.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        {/* List: non-goals */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">What it is not</h2>
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

        {/* Cards: value */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">What you can get clearer about</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              A collaboration that follows the question
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                If the question needs following over time, you and I agree on a setup that suits
                your situation.
              </p>
              <p>
                We set the rhythm together and check regularly whether the focus is still right.
                When the work is done, we close with a conversation about what you want to take forward.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Book an introductory conversation
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Tell me briefly what you would like to talk about and choose a time. You do not need to
              have everything formulated. The conversation is confidential.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Book an introductory conversation
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
