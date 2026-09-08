# 04a — English about and contact pages

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

About Carolina and the contact/booking page in English.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/app/en/om-oss/page.tsx

### Affected route(s)
/en/om-oss

### Current source

```tsx
import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach in Gothenburg | CVB Coaching",
  description:
    "Carolina von Braun runs CVB Coaching in Gothenburg. A commercial background from capital markets and board work, and a coaching qualification from Gothia Akademi.",
};

const principles = [
  "Confidentiality, without exception.",
  "Questions before advice. The conclusions stay yours.",
  "Precision rather than encouragement.",
  "Follow-up until something has actually happened.",
];

const audiences = [
  "Private clients facing a choice, a change or a decision that carries weight.",
  "Leaders and employees who need to think clearly with someone outside the organisation.",
  "Teams where accountability, priorities and decisions need sharpening.",
];

export default function AboutPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              About Carolina
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Who you choose to think out loud with matters.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Here is what you need to know to decide whether I am the right coach for you.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Why CVB Coaching exists
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Most of us have people around us who mean well. Fewer have someone whose only job is
                to help us finish the thinking, without holding a view on how it ends.
              </p>
              <p>
                CVB Coaching exists to make that available — to people who come on their own, and to
                people who come through their work.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">Coach</p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">CVB Coaching, Gothenburg</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                My name is Carolina von Braun. I run CVB Coaching in Gothenburg and am a trained,
                qualified coach at Gothia Akademi through ICF-accredited coach training at Level 1 and
                Level 2.
              </p>
              <p>
                My background includes securities trading at Nordea, board assignments in property
                management and investments, and studies in marketing at the School of Business,
                Economics and Law, University of Gothenburg. That experience gives a commercially
                grounded understanding of situations where responsibility, choices and consequences
                need to be weighed against each other.
              </p>
              <p>
                In coaching the roles are clear: the client owns their goals, insights and decisions.
                CVB Coaching&apos;s task is to sharpen the thinking, challenge perspectives and move
                the conversation forward without taking over the conclusions.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Principles
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {principles.map((item, index) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Confidentiality
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>What is said in the session is treated in confidence.</p>
              <p>
                When the sessions are commissioned by someone other than the participant, we agree
                what is shared back before the work begins.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Who I work with</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {audiences.map((item) => (
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
              Gothenburg, or online where that suits better
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching is based in Gothenburg. Sessions take place in person or online.
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

## File: src/app/en/kontakt/page.tsx

### Affected route(s)
/en/kontakt

### Current source

```tsx
import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import ContactPageScrollReset from "@/components/contact-page-scroll-reset";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import HeroReveal from "@/components/animations/HeroReveal";

export const metadata: Metadata = {
  title: "Book an initial conversation | CVB Coaching",
  description:
    "Book a short, free phone call to work out whether coaching is the right support. The conversation is confidential, whether you come on your own or through your employer.",
};

const processFaq: ProcessFaqItem[] = [
  {
    question: "What is the first conversation?",
    answer:
      "The first conversation is a short, free phone call. You tell me a little about what you are looking for, and we get a sense of whether coaching is the right path and whether it feels right to work together. It is not a coaching session, and you are not committing to anything.",
  },
  {
    question: "What happens if we want to go ahead?",
    answer:
      "If we both want to continue, we talk through what you would like to work on and what our coaching collaboration could look like. We agree on the scope, practical setup and price before we begin.",
  },
  {
    question: "How does the coaching collaboration start?",
    answer:
      "Once we have agreed on how we want to work together, you receive a personal confirmation from me and we plan our first coaching conversation. You will also get access to CVB Base, where we keep together what belongs to our work together.",
  },
  {
    question: "What is CVB Base?",
    answer:
      "CVB Base is part of how I work with my clients. There you can collect reflections, prepare what you want to bring to the next conversation and return to things we have worked on before. This helps keep the context connected between our conversations.",
  },
  {
    question: "What if a company is paying for the coaching?",
    answer:
      "You are still my client, and our conversations are about what you want to work on. Before we begin, we agree on who is paying and what, if anything, may be shared back with the purchaser.",
  },
  {
    question: "Do I have to decide after the first conversation?",
    answer:
      "No. The first conversation is there so we can both get a sense of whether this is right. We only move forward if it feels good and relevant for both of us.",
  },
];

export default function ContactPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <ContactPageScrollReset />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300/80 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Contact
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Start with a conversation.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Pick a time that suits you and write a few lines about what you would like to bring.
              The first conversation is a short, free phone call where we work out whether coaching
              is the right support and whether we want to go ahead together.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="What happens after you book?" items={processFaq} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
```
