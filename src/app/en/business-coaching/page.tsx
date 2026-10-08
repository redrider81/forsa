import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Business coaching in Gothenburg | CVB Coaching",
  description:
    "Business coaching at CVB Coaching in Gothenburg. For employees, leaders and teams who want to develop in their roles and handle current challenges in working life.",
};

const focusAreas = [
  "Your role as an employee and your work tasks",
  "Leadership",
  "Communication and collaboration",
  "Change and development",
];

export default function BusinessCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              Business coaching
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For employees, leaders and teams who want to develop in their roles and handle current
              challenges in working life.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Coaching can be a support when you want to develop in your professional role, handle a
              current situation or find new ways of looking at a question in your working life. It may
              involve work tasks, leadership, communication, collaboration or change.
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
            The starting point is always the situation and the needs at hand.
          </p>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Would you like to know more about business coaching?
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Feel free to get in touch, and we can talk about your needs and what an arrangement
              could look like.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Contact me
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
