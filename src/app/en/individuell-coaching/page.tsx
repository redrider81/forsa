import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Individual coaching in Gothenburg | CVB Coaching",
  description:
    "Individual coaching at CVB Coaching in Gothenburg. For anyone who wants to develop, make decisions or take the next step in life or their career.",
};

const focusAreas = [
  "Life and change",
  "Career and working life",
  "Decisions and choices",
  "Strengths and development",
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
              Individual coaching
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For anyone who wants to develop, make decisions or take the next step in life or their
              career.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Coaching can be a way to gain time and space to think about what matters to you. It may
              be about a change, a decision or a situation you want to understand better. It can also
              be about making the most of your strengths, developing or exploring new opportunities.
              You do not need to have all the answers from the start. We begin with what is relevant
              to you right now and work together on what you want to change, develop or move forward
              with.
            </p>
          </HeroReveal>
        </section>

        {/* List: focus areas */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">
            What we can work on
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {focusAreas.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
            It is your questions and what matters to you that guide what we work on.
          </p>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Curious whether coaching could be right for you?
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Book an introductory conversation and together we will see whether coaching is right for
              you and what you would like to get out of our sessions.
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
