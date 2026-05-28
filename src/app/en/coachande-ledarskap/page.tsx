import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Coaching Leadership | Forsa",
  description:
    "For organizations that want to strengthen managers' ability to lead through dialogue, listening, questions, feedback, and accountability.",
};

const relevanceList = [
  "Managers need to strengthen the quality of day-to-day leadership conversations.",
  "The organization wants stronger ownership without micro-management.",
  "Feedback and development conversations need more clarity.",
  "Collaboration requires more learning in daily work.",
];

const focusList = [
  "Coaching-based conversations for managers.",
  "Listening and questions as leadership tools.",
  "Feedback and development conversations.",
  "Ownership without micro-management.",
  "Conversations that create learning.",
];

const setupList = [
  "Leadership coaching in small groups.",
  "Practical training in coaching-style conversations.",
  "Support between sessions for implementation in daily work.",
];

const valueList = [
  "Clearer conversations between manager and employee.",
  "Stronger ownership in teams and operations.",
  "More learning in everyday leadership.",
];

export default function CoachingLeadershipPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Coaching Leadership
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Coaching leadership for clearer conversations and stronger ownership.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For organizations that want to strengthen managers&apos; ability to lead through better
              questions, listening, feedback, and accountability.
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
                When leaders strengthen their ability to lead through dialogue, both ownership and
                learning improve across the organization.
              </p>
              <p>
                This creates stronger conditions for clarity in assignments, feedback, and
                collaboration.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">When it is relevant</h2>
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
              What Forsa works with
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
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              How the work can be structured
            </h2>
            <ScrollReveal variant="staggerList" data-col-right className="md:col-span-7">
              <ul className="space-y-3 text-zinc-700">
                {setupList.map((item) => (
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
          <h2 className="text-3xl font-medium tracking-tight">Expected value</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              When you want to develop leadership through better dialogue
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Start with an initial conversation about needs, target group, and setup.
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
