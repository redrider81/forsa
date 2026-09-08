# 04 — English service pages

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

Individual coaching and Business coaching. About and contact are in 04a.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/app/en/individuell-coaching/page.tsx

### Affected route(s)
/en/individuell-coaching

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Individual coaching in Gothenburg | CVB Coaching",
  description:
    "Individual coaching at CVB Coaching in Gothenburg. For anyone facing a choice, a change or a decision that will not wait any longer.",
};

const relevanceList = [
  "You are facing a choice and cannot get to the end of it on your own.",
  "Something has ended and the next thing has not taken shape.",
  "You are doing everything you normally do and still are not moving.",
  "The role, or life, has grown faster than the way you are handling it.",
  "You know what you should do, and you are not doing it.",
];

const focusList = [
  "Choices and decisions that will shape the next stretch.",
  "Transitions: a new role, a new phase, a new setting.",
  "Direction when several options all look reasonable.",
  "Habits and patterns that cost more than they give.",
  "Work, career and the edges of a role.",
  "A different angle on something you have already turned over many times.",
];

const nonGoals = [
  "Not therapy or treatment. If the question is about ill health, therapy is the right route, and I will say so.",
  "Not advice. I will not take over your decisions or hand you my view as the answer.",
];

const outcomes = [
  "You know what the question is actually about, not only how it feels.",
  "You make the decision instead of carrying it.",
  "You have a way of thinking that holds up the next time too.",
];

export default function IndividualCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Individual coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              The question is yours. The structure is mine.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Individual coaching is a conversation you book for yourself. You bring whatever is
              actually taking up room — a choice, a change, a question that will not let go — and
              get further with it than you do alone.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
              If your employer is paying, or the question belongs to a team, see{" "}
              <Link href="/en/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Business coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
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

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Where things tend to get stuck
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
              What the questions can be about
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
          <h2 className="text-3xl font-medium tracking-tight">What you take away</h2>
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

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Write a few lines about what you would like to bring, and pick a time that suits you.
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
```

---

## File: src/app/en/business-coaching/page.tsx

### Affected route(s)
/en/business-coaching

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Business coaching in Gothenburg | CVB Coaching",
  description:
    "Business coaching at CVB Coaching in Gothenburg. Coaching in working life, one to one with an employee or a leader, or together with a team.",
};

const relevanceList = [
  "A choice has to be settled before the information is complete.",
  "Accountability in a role has grown faster than the mandate.",
  "Priorities shift more often than the organisation can adjust.",
  "Decisions are made in the room but lose force in day-to-day work.",
  "Tension is there but never gets named, and it slows everything down.",
  "A key person is being asked to carry more and needs someone to think with.",
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
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Business coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Decisions that outlast the meeting.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching is coaching in a setting where someone other than the participant is
              paying, and where the decisions also have to hold in the organisation. That covers
              individual employees and leaders as much as teams.
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

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              A coaching collaboration over time
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                An engagement runs over an agreed period, and the shape of it is the same whether I
                work with an employee, a leader or a team. What differs is the setting, not the way
                of working.
              </p>
              <p>
                We plan the sessions together and spread them across the period. They follow no fixed
                schedule — we place them where they do the most good, and move them when the business
                calls for it. The frame is agreed; the content is yours.
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
```
