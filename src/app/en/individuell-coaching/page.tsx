import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Individual coaching in Gothenburg | CVB Coaching",
  description:
    "Individual coaching at CVB Coaching in Gothenburg. For anyone facing a choice, a change or a decision that will not wait any longer.",
};

const relevanceList = [
  "Life questions and changes",
  "Career and working life",
  "Decisions and choices",
  "Development and self-leadership",
];

export default function IndividualCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              Individual Coaching
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For anyone who wants to develop, make decisions or take the next step in life or their
              career.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Coaching can be a way to get time and space to think about what matters to you. It may
              be about a change, a decision or a situation you want to understand better. It can also
              be about making the most of your strengths, developing or exploring new opportunities.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              You do not need to have all the answers from the start. We begin with what is relevant
              to you right now and work together on what you want to change, develop or move forward
              with.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              If your employer is funding the coaching, or the question concerns your role at work,
              see{" "}
              <Link href="/en/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Business coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: premise */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              You usually have the answer. Rarely in order.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                What is missing is seldom information. It is someone who asks the questions in the
                right order and does not settle for the first answer.
              </p>
              <p>
                Friends want the best for you. Colleagues have a stake in the outcome. A coaching
                conversation has no view on what you choose, only an interest in you choosing with
                your eyes open.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">
            It can be about
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

        {/* Two-col: how */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              How I work
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Sessions are confidential. You set the question, I keep asking it until it gets
                sharp. We work with what you can affect and leave the rest.
              </p>
              <p>
                Every session ends with something concrete you take away. The next one starts there
                — with what actually happened, not with what was intended.
              </p>
              <p>
                How many sessions it takes depends on the question. Sometimes one is enough.
                Sometimes it is worth having someone alongside for a longer stretch.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              A coaching collaboration over time
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                When a question needs following over time, we turn the coaching into a collaboration
                with an agreed frame. You and I settle what the work should focus on, and over what
                period we work, before we start.
              </p>
              <p>
                We plan the sessions together and spread them across the period. They follow no fixed
                schedule — we place them where they do the most good, and move them when what you are
                working on calls for something else.
              </p>
              <p>
                During the period we check whether the focus still holds or the question has moved.
                And the collaboration ends deliberately, with a final conversation about what the
                period gave you and what you carry on with on your own.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Curious whether coaching is for you?
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Tell me briefly what you would like to talk about and choose a time. You do not need
              to have everything formulated. The conversation is confidential.
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
