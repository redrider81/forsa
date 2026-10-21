import type { Metadata } from "next";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach in Gothenburg | CVB Coaching",
  description:
    "Qualified professional coach in Gothenburg with experience of working life, leadership and running a business. Individual coaching and business coaching.",
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

const audiences = [
  "Private individuals who want to explore a change, a choice or a decision in life.",
  "Employees and leaders who want to develop in their professional role or handle challenges in working life.",
  "People with responsibility who want new perspectives on priorities, relationships or decisions.",
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
                In everyday life there are often people to talk to, but not always someone who can
                listen without wanting to give advice, offer solutions or influence the decision you
                make.
              </p>
              <p>
                In coaching, you get the space to explore what is on your mind, challenge your own
                thinking and discover new perspectives. That is the space I want to create – both for
                you who seek coaching on your own and for you who come through your work.
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
                  Qualified professional coach with nearly 20 years of experience of working life,
                  leadership and running a business.
                </p>
                <p>
                  I run CVB Coaching in Gothenburg. Before I started working as a coach, I held sales and
                  leadership roles in banking. I also have experience of running my own business in
                  finance and property.
                </p>
                <p>
                  My background has given me experience of the conditions, responsibilities and decisions
                  of working life, and of the fact that people may need different things to move forward.
                  Today, in my role as a coach, I meet both private individuals and people in working life.
                </p>
                <p>
                  In our conversations, I am curious about how you see your situation and what lies behind
                  your thoughts and choices. I listen, ask questions and challenge when needed. I do not
                  give you ready-made answers, but I help you examine your own reasoning and get closer to
                  what you want to understand, decide or change.
                </p>
                <p>
                  It is important to me that our conversations are not only interesting in the moment,
                  but also help you move forward in what matters to you.
                </p>
              </div>
            </ScrollReveal>
          </div>
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
              <p className={`mb-8 ${BODY}`}>
                I meet both private individuals and people in working life.
              </p>
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
      </div>

      {/* Avslut — samma mörka CTA-yta som startsidan */}
      <section className="bg-surface-dark py-28 text-zinc-100 md:py-36 lg:py-44">
        <ScrollReveal variant="ctaStack" className="mx-auto max-w-7xl px-6 md:px-10">
          <p className={CHAPTER_ON_DARK}>07</p>
          <h2 data-cta-heading className={`mt-10 max-w-3xl ${DISPLAY} text-white md:mt-14`}>
            Book an introductory call
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
