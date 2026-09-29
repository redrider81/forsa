import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach in Gothenburg | CVB Coaching",
  description:
    "Carolina von Braun runs CVB Coaching in Gothenburg. A commercial background from capital markets and board work, and a coaching qualification from Gothia Akademi.",
};

const DISPLAY =
  "font-serif text-[clamp(2.75rem,5.6vw,5.25rem)] font-medium leading-[1.12] tracking-[-0.04em]";
const DISPLAY_SM =
  "font-serif text-[clamp(2.125rem,4.2vw,3.5rem)] font-medium leading-[1.18] tracking-[-0.035em]";
const CHAPTER = "text-xs font-medium tabular-nums tracking-[0.32em]";
const CHAPTER_ON_LIGHT = `${CHAPTER} text-zinc-900`;
const CHAPTER_ON_DARK = `${CHAPTER} text-white`;
const LABEL =
  "text-xs font-medium uppercase tracking-[0.16em] text-[#7d6435]";
const BODY = "text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600";
const BODY_STACK = `space-y-6 ${BODY}`;

const principles = [
  "Confidentiality, without exception.",
  "Questions before advice. The conclusions stay yours.",
  "Precision rather than encouragement.",
  "Follow-up until something has actually happened.",
];

const audiences = [
  "Private clients facing a choice, a change or a decision that carries weight.",
  "Employees and leaders who need to think clearly with someone outside their own workplace.",
  "People who want to sort out responsibility, priorities or decisions in a work-related situation.",
];

export default function AboutPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />

      <section className="px-6 pb-20 pt-32 md:px-10 md:pb-28 md:pt-44 lg:pt-52">
        <div className="mx-auto max-w-7xl">
          <HeroReveal>
            <div className="grid md:grid-cols-12 md:gap-x-8">
              <div className="md:col-span-2">
                <div data-hero-line className="mb-8 h-px w-12 origin-left bg-[#7d6435]" />
                <p data-hero-label className={LABEL}>
                  About Carolina
                </p>
              </div>
              <h1
                data-hero-headline
                className={`mt-12 max-w-[16ch] ${DISPLAY} text-zinc-900 md:col-span-10 md:mt-0`}
              >
                Who you choose to think out loud with matters.
              </h1>
            </div>
            <p
              data-hero-body
              className={`mt-14 max-w-xl md:ml-[16.666%] md:mt-20 ${BODY}`}
            >
              Here is what you need to know to decide whether I am the right coach for you.
            </p>
          </HeroReveal>
        </div>
      </section>

      <div className="pb-28 md:pb-40">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Why CVB Coaching exists
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                Most of us have people around us who mean well. Fewer have someone whose only job is
                to help you finish the thinking, without holding a view on how it ends.
              </p>
              <p>
                I offer that space — for you who come on your own, and for you who come through your
                work.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-28 max-w-7xl px-6 md:mt-40 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div data-col-left className="md:col-span-5">
              <p className={LABEL}>Coach</p>
              <h2 className={`mt-6 ${DISPLAY_SM} text-zinc-900`}>Carolina von Braun</h2>
              <p className={`mt-4 ${BODY}`}>CVB Coaching, Gothenburg</p>
            </div>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7`}>
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
                My task is to sharpen the thinking, challenge perspectives and move the conversation
                forward without taking over the conclusions.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-28 max-w-7xl px-6 md:mt-40 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <h2 data-col-left className={`max-w-sm ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Principles
            </h2>
            <ScrollReveal
              variant="staggerList"
              data-col-right
              className="grid gap-4 md:col-span-6 md:col-start-7 md:grid-cols-2 md:gap-5"
            >
              {principles.map((item, index) => (
                <div
                  key={item}
                  data-list-item
                  className="border border-zinc-300/90 bg-[#f9f8f5] p-7 md:p-9"
                >
                  <p className={CHAPTER_ON_LIGHT}>{`0${index + 1}`}</p>
                  <p className={`mt-5 ${BODY}`}>{item}</p>
                </div>
              ))}
            </ScrollReveal>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-28 max-w-7xl px-6 md:mt-40 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Confidentiality
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>What is said in the session is treated in confidence.</p>
              <p>
                When the sessions are commissioned by someone other than the client, we agree what is
                shared back before the work begins.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-28 max-w-7xl px-6 md:mt-40 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Who I work with
            </h2>
            <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-8 lg:pt-12">
              <ScrollReveal variant="staggerList">
                <ul className="divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {audiences.map((item) => (
                    <li key={item} data-list-item className="grid grid-cols-[1rem_1fr] gap-5 py-6 md:py-7">
                      <span className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-28 max-w-7xl px-6 md:mt-40 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <h2
              data-col-left
              className={`max-w-lg ${DISPLAY_SM} text-balance text-zinc-900 md:col-span-5`}
            >
              Gothenburg, or online where that suits better
            </h2>
            <div data-col-right className={`md:col-span-6 md:col-start-7 md:pt-4 ${BODY}`}>
              <p>CVB Coaching is based in Gothenburg. Sessions take place in person or online.</p>
            </div>
          </ScrollReveal>
        </section>
      </div>

      <section className="bg-surface-dark py-24 text-zinc-100 md:py-32 lg:py-40">
        <ScrollReveal variant="ctaStack" className="mx-auto max-w-7xl px-6 md:px-10">
          <p className={CHAPTER_ON_DARK}>07</p>
          <h2 data-cta-heading className={`mt-10 max-w-3xl ${DISPLAY} text-white md:mt-14`}>
            Book an introductory conversation
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p data-cta-body className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7">
              Tell me briefly what you would like to talk about and choose a time. You do not need to
              have everything formulated. The conversation is confidential.
            </p>
            <div data-cta-actions className="md:col-span-5 md:col-start-7">
              <CtaLink href="/en/kontakt" variant="secondary" translucent>
                Book an introductory conversation
              </CtaLink>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Personal coaching · Confidential conversations · Gothenburg or online
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
