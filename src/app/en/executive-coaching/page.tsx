import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Executive Coaching | Forsa",
  description:
    "A confidential coaching conversation for CEOs, founders, and senior leaders when decisions, accountability, and direction need sharper focus.",
};

const relevanceList = [
  "Decisions must be made with incomplete information and high consequences.",
  "Leadership accountability becomes unclear or heavier than before.",
  "Critical priorities compete with each other and create internal friction.",
  "The pace of change is rising and requires greater precision now.",
];

const focusList = [
  "Decision support for CEOs and senior leaders.",
  "Role clarity and leadership accountability in change.",
  "Strategic choices under uncertainty.",
  "Difficult conversations and leadership communication.",
  "Leadership under pressure with sustained direction.",
];

const nonGoals = [
  "Not therapy or processing of private issues.",
  "Not motivational conversations without clear business relevance.",
  "Not generic coaching models disconnected from your real context.",
];

const valuePoints = [
  "A faster path from uncertainty to a clear next step.",
  "Decisions that hold better over time and in execution.",
  "Greater calm in leadership when stakes are high.",
];

export default function ExecutiveCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Executive coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              A confidential space when decisions carry real weight.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For CEOs, founders, and senior leaders who need clearer thinking as pressure increases.
              The work is confidential and business-near, focused on decisions, role clarity, and
              accountability when consequences are high.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              When leadership needs a sharper thinking room
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                In senior roles, experience is often already there. What is missing under pressure is
                room for clear reflection without internal agendas.
              </p>
              <p>An external conversation sharpens trade-offs and decisions when role load is high.</p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            When confidential leadership support is needed
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
              How the work is done
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                The work happens in structured conversations with clear rhythm and follow-up. We start
                from your real context, not theoretical ideals.
              </p>
              <p>
                The focus is to define the core issue, sharpen the decision, and clarify the next step
                in execution.
              </p>
              <p>
                This is confidential coaching for reflection and accountability, not strategy consulting.
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
          <h2 className="text-3xl font-medium tracking-tight">Expected value</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valuePoints.map((item, index) => (
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
              When you need stronger decision clarity in your leadership role
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              We begin with a confidential first conversation about where sharper focus is most needed
              right now.
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
