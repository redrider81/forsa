import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Business coaching in Gothenburg | CVB Coaching",
  description:
    "Business coaching at CVB Coaching in Gothenburg. For leaders, employees, teams and executive teams — executive coaching, executive team coaching, team coaching and coaching leadership.",
};

const relevanceList = [
  "A choice has to be settled before the information is complete.",
  "Accountability in a role has grown faster than the mandate.",
  "Priorities shift more often than the organisation can adjust.",
  "Decisions are made in the room but lose force in day-to-day work.",
  "Tension is there but never gets named, and it slows everything down.",
  "A key person is being asked to carry more and needs someone to think with.",
];

const formats = [
  {
    href: "/en/executive-coaching",
    title: "Executive coaching",
    body: "For CEOs, founders and senior leaders. A room with no internal agenda, for decisions that carry real consequence.",
  },
  {
    href: "/en/ledningsgruppscoaching",
    title: "Executive team coaching",
    body: "For executive teams where priorities drift and decisions lose force between meetings.",
  },
  {
    href: "/en/team-coaching",
    title: "Team coaching",
    body: "For teams and project groups with high demands and an unspoken way of working.",
  },
  {
    href: "/en/coachande-ledarskap",
    title: "Coaching leadership",
    body: "For organisations developing managers who lead through questions rather than instructions.",
  },
];

const nonGoals = [
  "Not management consulting. No ready-made recommendations, and the decisions stay yours.",
  "Not team-building or exercises detached from real work.",
];

const processList = [
  "A first conversation, in confidence. We work out together whether the question belongs here.",
  "Objectives, scope and confidentiality are agreed before the work begins.",
  "What is shared back with whoever commissioned the work is settled up front.",
  "Progress is reviewed against the objectives as the work goes on.",
  "The work closes against what was set out at the start, and you decide whether it continues.",
];

const outcomes = [
  "A shorter path from discussion to a decision made.",
  "Accountability that is spoken rather than assumed.",
  "Decisions that hold all the way into day-to-day work.",
];

export default function BusinessCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Business coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Decisions that outlast the meeting.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching is coaching in a setting where someone other than the participant is
              paying, and where the decisions also have to hold in the organisation. That covers
              individual leaders and employees as much as teams and executive teams.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
              If you are booking for yourself, see{" "}
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
              The experience is there. The space to think is not always.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Inside an organisation, every conversation partner also has a stake in the question.
                That makes it hard to test an argument before it becomes an announcement.
              </p>
              <p>
                That is what CVB Coaching provides: an outside perspective with no stake in which
                decision you make — only in whether it has been properly thought through.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Six situations where it makes the greatest difference
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
            <div data-col-left className="md:col-span-5">
              <h2 className="text-3xl font-medium leading-tight tracking-tight">
                Four forms, one way of working
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-zinc-700">
                Which form fits depends on whose question it is. We settle that in the first
                conversation — you do not need to know in advance.
              </p>
            </div>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {formats.map((item) => (
                <Link
                  data-card
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="block text-lg font-medium leading-tight tracking-tight text-zinc-900 transition-colors group-hover:text-[#92753a]">
                    {item.title}
                  </span>
                  <span className="mt-3 block leading-relaxed">{item.body}</span>
                </Link>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              How an engagement works
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
