import type { Metadata } from "next";
import { localeAlternates } from "@/lib/i18n/metadata";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  alternates: localeAlternates("/om-oss", "en"),
  title: "Carolina von Braun – coach in Gothenburg | CVB Coaching",
  description:
    "Carolina von Braun runs CVB Coaching in Gothenburg. A commercial background from capital markets and board work, and a coaching qualification from Gothia Akademi.",
};

const t = enDictionary;

const DISPLAY =
  "font-serif text-[clamp(2.75rem,5.6vw,5.25rem)] font-medium leading-[1.12] tracking-[-0.04em]";
const DISPLAY_SM =
  "font-serif text-[clamp(2.125rem,4.2vw,3.5rem)] font-medium leading-[1.18] tracking-[-0.035em]";
const CHAPTER = "text-xs font-medium tabular-nums tracking-[0.32em]";
const CHAPTER_ON_LIGHT = `${CHAPTER} text-zinc-900`;
const CHAPTER_ON_DARK = `${CHAPTER} text-white`;
const BODY = "text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600";
const BODY_STACK = `space-y-7 ${BODY}`;
/* Mörk yta: ljusare guld och zinc-300 för tillräcklig kontrast mot surface-dark. */
const LABEL_ON_DARK =
  "text-xs font-medium uppercase tracking-[0.16em] text-[#c2a46b]";
const BODY_STACK_ON_DARK = "space-y-7 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300";
const SECTION_STACK = "mt-32 md:mt-48";
const SECTION_GRID = "grid gap-14 md:grid-cols-12 md:gap-x-8 md:gap-y-16";

const principles = [
  "Confidentiality.",
  "Questions before advice. You own your conclusions.",
  "Precision rather than encouragement.",
  "Follow-up until something has actually happened.",
];

const audiences = [
  "Private individuals facing a choice, a change or a decision that carries weight.",
  "Employees and leaders who need to think clearly with someone outside their own workplace.",
  "People who want to sort out responsibility, priorities or decisions in a work-related situation.",
];

export default function AboutPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />

      {/* Hero */}
      <section className="px-6 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44 lg:pb-40 lg:pt-52">
        <div className="mx-auto max-w-7xl">
          <HeroReveal>
            <h1
              data-hero-headline
              className={`max-w-[16ch] text-left ${DISPLAY} text-zinc-900 md:max-w-[18ch]`}
            >
              The person you will be having the conversations with.
            </h1>
            <p
              data-hero-body
              className={`mt-16 max-w-xl text-left md:mt-24 ${BODY}`}
            >
              Choosing a coach is choosing who you think out loud in front of. Here is what you need to
              know about me to decide whether it should be me.
            </p>
          </HeroReveal>
        </div>
      </section>

      {/* Ljus yta */}
      <div className="pb-32 md:pb-52">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Why CVB Coaching exists
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                Most people have others around them who mean well. Fewer have someone whose only
                task is to help you finish the thinking, without holding a view on the outcome.
              </p>
              <p>
                I offer that space — for you who come on your own, and for you who come through
                your work.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Mörk yta, samma som Carolina-akten på startsidan. */}
        <section className={`${SECTION_STACK} bg-surface-dark py-24 text-zinc-100 md:py-32 lg:py-40`}>
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <ScrollReveal variant="splitColumn" className={`${SECTION_GRID} md:items-stretch`}>
              <div data-col-left className="md:col-span-5">
                <p className={LABEL_ON_DARK}>Coach</p>
                <h2 className={`mt-6 ${DISPLAY_SM} text-white`}>Carolina von Braun</h2>
              </div>
              <figure className="relative mt-10 aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.25rem] md:col-span-5 md:row-start-2 md:mt-12 md:aspect-auto md:h-full md:min-h-[20rem] md:rounded-[1.75rem]">
                <Image
                  src="/carolina-von-braun.webp"
                  alt="Carolina von Braun, coach and founder of CVB Coaching."
                  fill
                  sizes="(min-width: 768px) 20rem, 94vw"
                  className="object-cover object-[center_22%]"
                  quality={80}
                />
              </figure>
              <div
                data-col-right
                className={`${BODY_STACK_ON_DARK} md:col-span-6 md:col-start-7 md:row-start-2 md:mt-12 md:flex md:min-h-0 md:flex-col md:justify-between md:space-y-0 md:gap-8 lg:gap-10`}
              >
                <p>
                  My name is Carolina von Braun and I run CVB Coaching in Gothenburg. I am a qualified coach
                  from Gothia Akademi and have completed ICF-accredited coach training at Level 1 and Level
                  2.
                </p>
                <p>
                  My professional background includes securities trading at Nordea, board assignments in
                  property management and investments, and studies in marketing at the School of
                  Business, Economics and Law at the University of Gothenburg. I bring that experience
                  with me as background and understanding — not as the answer key to your decisions.
                </p>
                <p>
                  In coaching the roles are clear: you own your goals, insights and decisions. My
                  task is to bring sharpness to the thinking, test perspectives and move the conversation
                  forward without taking over your conclusions.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-sm ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Principles
            </h2>
            <ScrollReveal
              variant="staggerList"
              data-col-right
              className="grid gap-5 md:col-span-6 md:col-start-7 md:grid-cols-2 md:gap-6"
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

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Confidentiality
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>What is said in the session is treated in confidence.</p>
              <p>
                When the sessions are commissioned by someone other than the client, we agree on what
                is shared back before the work begins.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Who I work with
            </h2>
            <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-8 lg:pt-12">
              <ScrollReveal variant="staggerList">
                <ul className="divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {audiences.map((item) => (
                    <li key={item} data-list-item className="grid grid-cols-[1rem_1fr] gap-5 py-7 md:py-8">
                      <span className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-lg ${DISPLAY_SM} text-balance text-zinc-900 md:col-span-5`}>
              Gothenburg, or online when that suits better
            </h2>
            <div data-col-right className={`md:col-span-6 md:col-start-7 md:pt-4 ${BODY}`}>
              <p>
                CVB Coaching is based in Gothenburg. Sessions take place in person or online, and where
                you are does not decide whether it works.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              The first conversation is there to see if it feels right.
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                You do not need to have fully formulated the question. In a short, free first phone
                call you get to describe where you are, find out whether coaching is the right support
                and get a sense of whether Carolina is the right person to talk to.
              </p>
              <p className="text-[0.875rem] leading-[1.6] text-zinc-500">
                It is not a coaching session and involves no commitment.
              </p>
              <div>
                <CtaLink href="/en/kontakt" variant="primary">
                  {t.cta.primary}
                </CtaLink>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>

      {/* Avslut — samma mörka CTA-yta som startsidan */}
      <section className="bg-surface-dark py-28 text-zinc-100 md:py-36 lg:py-44">
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
                {t.cta.primary}
              </CtaLink>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Short and free. Not a coaching session. No commitment.
              </p>
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
