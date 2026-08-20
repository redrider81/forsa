import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import { ServicePricingSection } from "@/components/pricing-block";

export const metadata: Metadata = {
  title: "Executive coaching for CEOs and founders | CVB Coaching",
  description:
    "An external session space without internal agenda, for decisions made with incomplete information and high consequences. Six to eight sessions over six months.",
};

const relevanceList = [
  "The decision must be made before the information is complete.",
  "Accountability in the role has grown faster than the mandate.",
  "Two priorities exclude each other and both have strong advocates.",
  "The pace of change requires wrong decisions to be caught earlier than before.",
];

const focusList = [
  "We test the decision basis before the decision is made, especially when information is incomplete.",
  "We clarify where the role's accountability begins and ends in relation to owners, the board and the executive team.",
  "We work through strategic choices under uncertainty and make the trade-offs explicit.",
  "We prepare difficult conversations and communication that cannot afford to be misunderstood.",
  "We work on how direction is held when load in the role is high.",
];

const nonGoals = [
  "Not therapy or processing of private matters.",
  "Not management consulting with ready-made recommendations.",
  "Not motivational sessions without connection to the business.",
  "Not generic coaching models without grounding in your context.",
];

const outcomes = [
  "From open question to defined next step, normally within two sessions.",
  "Decisions that hold in execution, with an owner and a date.",
  "Lower load in the role when decisions carry real weight.",
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
              A room with no internal agenda.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              For CEOs, founders and senior leaders who make decisions with incomplete information
              and high consequences. Confidential, business-near and connected to what actually needs
              to be decided.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
              This is for CEOs, founders and executive team members. For managers and key
              professionals below leadership level, see{" "}
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
              At the top, the experience is there. What is missing is the resistance.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Senior leaders rarely lack analysis. What is missing under pressure is someone to
                test the reasoning without their own agenda in the question.
              </p>
              <p>
                Internally, every session partner is a party to the outcome. Externally, it is
                possible to finish thinking before the decision becomes public.
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
                The work takes place in structured sessions with a fixed cadence and follow-up. We
                start from your actual context, not theoretical models. Every session ends with a
                defined next step.
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

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Scope and investment
            </h2>
            <div data-col-right className="md:col-span-7">
              <ServicePricingSection
                locale="en"
                lines={[
                  { text: "Six to eight sessions over six months, with a fixed cadence." },
                  { text: "", priceKey: "individual" },
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
