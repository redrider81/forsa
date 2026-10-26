import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import { coachingProcessParagraphsEn } from "@/lib/coaching-process";

export const metadata: Metadata = {
  alternates: pageAlternates("/coaching", "en"),
  title: "Coaching | CVB Coaching",
  description:
    "How coaching works at CVB Coaching in Gothenburg: when it can be right, what the work involves and how a collaboration works. Individual coaching and business coaching.",
};

/**
 * Engelsk version av /coaching. Texten är en direkt översättning av den
 * godkända svenska sidan och ska hållas i fas med den: samma sektioner, samma
 * ordning. Konfidentialitetsraden under Practical information är medvetet
 * oförändrad.
 */

const relevancePoints = [
  "You are facing a choice and want to understand what really matters to you.",
  "You have taken on new responsibility or are going through a change, at work or in life more broadly.",
  "You know something needs to change, but cannot yet see how you want to move forward.",
  "You need to make a decision without having all the answers yet.",
  "You want a conversation where you can think freely, explore your thoughts and speak in confidence.",
];

const rightFitWhen = [
  "The question genuinely matters to you, not just on paper.",
  "You want to finish the thinking yourself, not be handed an answer.",
  "It needs to happen outside your own circle, in confidence.",
  "Something is meant to change, not only be discussed.",
];

const lessSuitedWhen = [
  "You want an expert to assess the situation and tell you what to do.",
  "If the question is mainly about ill health or treatment, coaching is not the right support. Healthcare, therapy or other relevant professional help may then be more appropriate.",
  "The direction is already set and what remains is carrying it out.",
];

const workRows = [
  {
    index: "01",
    title: "Clarity",
    body: "See what matters to you and understand your situation more clearly.",
  },
  {
    index: "02",
    title: "Decisions",
    body: "Explore different options and move closer to decisions that feel well considered and grounded in what matters to you.",
  },
  {
    index: "03",
    title: "Direction",
    body: "Find a way forward that feels relevant to you and identify the steps you want to take.",
  },
];

/** "When coaching is relevant — and when it is not" är dolt tills vidare på kundens begäran. */
const SHOW_COACHING_FIT = false;

const routes = [
  {
    index: "01",
    href: "/en/individuell-coaching",
    title: "Individual coaching",
    description:
      "For anyone facing a choice, a change or a decision they want to think through fully.",
    ctaLabel: "Read about individual coaching",
  },
  {
    index: "02",
    href: "/en/business-coaching",
    title: "Business coaching",
    description:
      "For employees and leaders with a question in working life – new responsibility, a challenging relationship or a decision that affects others.",
    ctaLabel: "Read about business coaching",
  },
];

const practical: { title: string; body: string[] }[] = [
  {
    title: "In Gothenburg or online",
    body: [
      "I offer coaching in person in Gothenburg or online, depending on what suits best.",
    ],
  },
  {
    title: "Session length",
    body: [
      "We usually set aside 60 minutes per coaching session. This gives us time to explore what matters to you and to round off with what you want to take forward.",
    ],
  },
  {
    title: "Price and format",
    body: [
      "Every coaching collaboration is based on your needs and what you want to work on. Feel free to get in touch, and we can talk about which format suits you and what it costs.",
    ],
  },
  {
    // Oförändrad från tidigare engelsk version (konfidentialitetstext lämnas orörd).
    title: "Confidential",
    body: ["What is said in the session stays in the session."],
  },
  {
    title: "When a company makes the first contact",
    body: [
      "A company can take the initiative and fund coaching for an employee or leader. The coaching takes place in a personal, confidential relationship between me and the client.",
    ],
  },
];

const faqItems: ProcessFaqItem[] = [
  {
    question: "What is the first call?",
    answer:
      "A free phone call where we talk about your situation and what you want to get out of the coaching.",
  },
  {
    question: "Do I have to decide after the first call?",
    answer:
      "No. You have the chance to ask questions and get a sense of whether coaching with me feels right for you.",
  },
  {
    question: "How many coaching sessions are usually needed?",
    answer:
      "I like to work with coaching over time, as it gives room to explore questions in depth, try out new perspectives and follow what develops between sessions. I usually recommend at least six sessions, ideally ten or more, depending on your needs and what you want to work on.",
  },
  {
    question: "How does the coaching collaboration start?",
    answer:
      "We agree on an overall goal and then, before each session, explore what feels most important to you.",
  },
  {
    question: "What is CVB Base?",
    answer:
      "A digital support where you can prepare for sessions, gather reflections and follow your thoughts between our meetings.",
  },
  {
    question: "How do you work with companies?",
    answer:
      "I offer coaching for employees and leaders. We start with a dialogue about the need and the framework of the engagement. What is said in the coaching sessions is not passed on to the commissioning company.",
  },
];

const chapterBase = "text-xs font-medium tabular-nums tracking-[0.32em]";
const chapterIndexOnLight = `${chapterBase} text-zinc-900`;
const chapterIndexOnDark = `${chapterBase} text-white`;
/** Etiketter på ljus yta — samma skala som hero, inte kapitelindex. */
const chapterLabelLight =
  "text-xs font-medium uppercase tracking-[0.16em] text-[#7d6435]";
const chapterDark = chapterIndexOnDark;

export default function CoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      {/* ---------- 00 · Hero ---------- */}
      <section className="px-6 pb-14 pt-28 md:px-10 md:pb-20 md:pt-32 lg:pt-36">
        <div className="mx-auto w-full max-w-7xl">
          <HeroReveal>
            <div className="grid md:grid-cols-12 md:gap-x-8">
              <div className="md:col-span-2">
                <div data-hero-line className="mb-6 h-px w-12 origin-left bg-[#7d6435] md:mb-8" />
                <p data-hero-label className={chapterLabelLight}>
                  Coaching
                </p>
              </div>
              <h1
                data-hero-headline
                className="mt-8 max-w-[15ch] font-serif text-[clamp(3rem,9vw,10rem)] font-medium leading-[1.2] tracking-[-0.055em] text-zinc-900 md:col-span-10 md:mt-0"
              >
                Coaching at CVB
              </h1>
            </div>
          </HeroReveal>

          <div className="mt-10 md:mt-14">
            <HeroReveal>
              <div className="grid gap-8 md:grid-cols-12 md:gap-x-8 md:gap-y-0">
                <p
                  data-hero-body
                  className="max-w-md text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-4 md:col-start-7"
                >
                  This page describes when coaching can be relevant, how the work is done and what you
                  can expect.
                </p>
                <div data-hero-cta className="md:col-span-2 md:col-start-11 md:justify-self-end md:self-end">
                  <Link
                    href="#vagar"
                    className="group inline-flex items-center gap-2 border-b border-zinc-400 pb-1 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4f3ef]"
                  >
                    Individual or business coaching
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                      ↓
                    </span>
                  </Link>
                </div>
              </div>
            </HeroReveal>
          </div>
        </div>
      </section>

      {/* ---------- 01 · När coaching kan vara rätt — tät ---------- */}
      <section className="bg-white py-20 md:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div data-col-left className="md:col-span-5">
              <p className={chapterIndexOnLight}>01</p>
              <h2 className="mt-10 max-w-md font-serif text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[1.12] tracking-[-0.045em] text-zinc-900 md:mt-16">
                What can coaching be about?
              </h2>
            </div>
            <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-28 lg:pt-40">
              <ScrollReveal variant="staggerList">
                <ul className="divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {relevancePoints.map((point) => (
                    <li key={point} data-list-item className="grid grid-cols-[1rem_1fr] gap-5 py-6 md:py-7">
                      <span className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- 02 · Vad arbetet består av — glesaste scenen, sidans signatur ---------- */}
      <section className="bg-[#f4f3ef] py-32 md:py-52 lg:py-64">
        <EditorialRowsReveal className="mx-auto max-w-7xl px-6 md:px-10">
          <p className={chapterIndexOnLight}>02</p>
          <h2
            data-section-heading
            className="mt-10 max-w-3xl font-serif text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[1.14] tracking-[-0.04em] text-zinc-900 md:mt-16"
          >
            What can coaching give you?
          </h2>
          <p data-section-intro className="mt-8 max-w-2xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-10">
            Coaching can give you space to pause, reflect and see your situation from new
            perspectives.
          </p>
          <div className="mt-24 border-t border-zinc-300 md:mt-40">
            {workRows.map((row) => (
              <article
                key={row.index}
                data-editorial-row
                className="border-b border-zinc-300 py-12 md:py-20"
              >
                <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                  {/* Index och titel hör ihop. På smal skärm står de på samma rad;
                      från md upplöses omslaget (contents) så att båda blir egna
                      kolumner i radens gemensamma rutnät. */}
                  <div className="flex items-baseline gap-4 md:contents">
                    {/* Siffran är struktur, inte innehåll — titeln och brödtexten
                        bär betydelsen, så den hålls utanför tillgänglighetsträdet. */}
                    <span
                      data-row-index
                      aria-hidden="true"
                      className="min-w-[1.75rem] shrink-0 font-serif tabular-nums text-[1.375rem] leading-tight tracking-[-0.02em] text-zinc-400 md:col-span-1 md:min-w-0 md:text-[clamp(1.5rem,1.8vw,1.75rem)]"
                    >
                      {row.index}
                    </span>
                    <h3
                      data-row-title
                      className="text-2xl font-medium leading-[1.3] tracking-tight text-zinc-900 md:col-span-4 md:col-start-2 md:text-3xl"
                    >
                      {row.title}
                    </h3>
                  </div>
                  <p
                    data-row-body
                    className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-5 md:col-start-8"
                  >
                    {row.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </EditorialRowsReveal>
      </section>

      {/* ---------- 04 · CVB Base (mörk scen) ---------- */}
      <section className="bg-surface-dark py-28 text-zinc-100 md:py-40 lg:py-48">
        <ScrollReveal
          variant="splitColumn"
          className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-12 md:gap-x-8 md:px-10"
        >
          <div data-col-left className="md:col-span-7">
            <p className={chapterDark}>04</p>
            <h2 className="mt-12 max-w-3xl font-serif text-[clamp(3rem,4.4vw,4.75rem)] font-medium text-balance leading-[1.14] tracking-[-0.04em] text-white md:mt-16">
              Support between sessions
            </h2>
          </div>
          <div
            data-col-right
            className="space-y-8 border-t border-white/60 pt-10 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-8 md:mt-40 md:pt-12"
          >
            <p data-col-paragraph>
              The conversation is at the centre. CVB Base helps you keep the context between sessions.
            </p>
            <p data-col-paragraph>
              When it is relevant, you use CVB Base to prepare questions, gather reflections and
              return to things you want to follow over time. It lets you capture thoughts between our
              meetings and bring what feels important to the next session.
            </p>
            <p data-col-paragraph>
              CVB Base does not replace the coaching; it supports the work you do between sessions
              as well.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ---------- 05 · När coaching är relevant — tätast ---------- */}
      {SHOW_COACHING_FIT && (
      <section className="bg-[#f4f3ef] pb-16 pt-20 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div data-col-left className="md:col-span-5">
              <p className={chapterIndexOnLight}>05</p>
              <h2 className="mt-10 max-w-md font-serif text-[clamp(2.25rem,4vw,4rem)] font-medium leading-[1.18] tracking-[-0.035em] text-zinc-900 md:mt-16">
                When coaching is relevant — and when it is not
              </h2>
            </div>
            <div data-col-right className="grid gap-14 md:col-span-7 md:col-start-6 md:grid-cols-2 md:gap-10 md:pt-24">
              <ScrollReveal variant="staggerList">
                <h3 className="text-lg font-medium leading-[1.35] text-zinc-900">Coaching can be relevant when</h3>
                <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-700">
                  {rightFitWhen.map((item) => (
                    <li key={item} data-list-item className="border-t border-zinc-300 pt-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
              <ScrollReveal variant="staggerList">
                <h3 className="text-lg font-medium leading-[1.35] text-zinc-900">Coaching is not the right support when</h3>
                <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-600">
                  {lessSuitedWhen.map((item) => (
                    <li key={item} data-list-item className="border-t border-zinc-300 pt-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* ---------- 06 · Individuell eller företagscoaching ---------- */}
      <section id="vagar" className="scroll-mt-28 bg-white py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <p data-col-left className={`${chapterIndexOnLight} md:col-span-2`}>05</p>
            <div data-col-right className="md:col-span-8 md:col-start-5">
              <h2 className="font-serif text-[clamp(2.25rem,4.2vw,4rem)] font-medium text-balance leading-[1.18] tracking-[-0.035em] text-zinc-900">
                Individual coaching or business coaching
              </h2>
            </div>
          </ScrollReveal>

          <EditorialRowsReveal className="mt-20 md:mt-28">
            <ul className="border-t border-zinc-300">
              {routes.map((route) => (
                <li key={route.href} data-editorial-row className="border-b border-zinc-300">
                  <Link
                    href={route.href}
                    className="group block py-12 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-white md:py-16"
                  >
                    {/* Individuell coaching och företagscoaching är två sammanhang, inte
                        en ordningsföljd — därför ingen numrering här. Titeln får
                        börja i första kolumnen i stället. */}
                    <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                      <span data-row-title className="block md:col-span-5">
                        <span
                          role="heading"
                          aria-level={3}
                          className="block font-serif text-[2rem] font-medium leading-[1.2] tracking-[-0.03em] text-zinc-900 transition-colors duration-300 group-hover:text-[#7d6435] md:text-[2.75rem]"
                        >
                          {route.title}
                        </span>
                      </span>
                      <span data-row-body className="block md:col-span-5 md:col-start-8">
                        <span className="block max-w-xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-600">
                          {route.description}
                        </span>
                        <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors group-hover:decoration-zinc-900">
                          {route.ctaLabel}
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                          >
                            →
                          </span>
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="ml-auto mt-16 max-w-xl border-l border-zinc-300 pl-6 text-[0.9375rem] leading-[1.7] text-zinc-600 md:pl-8">
              Not sure which kind of coaching suits your situation? We can talk about that in the
              first call.
            </p>
          </EditorialRowsReveal>
        </div>
      </section>

      {/* ---------- 07 · Praktiskt ---------- */}
      <section className="bg-[#f4f3ef] py-24 md:py-36 lg:py-44">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          {/* Rubriken hålls på metadata-skala: raderna nedan bär scenen visuellt,
              men sektionen behöver fortfarande sin plats i rubrikträdet. */}
          <div className="flex items-baseline gap-6">
            <p className={chapterIndexOnLight}>06</p>
            <h2 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.03em] text-zinc-900">
              Practical information
            </h2>
          </div>

          {/* Praktiskt är komponerat som redaktionella rader i stället för en
              definitionslista med panelkänsla: serif-titel ensam till vänster,
              smal textspalt långt in, hårfina linjer och hög radhöjd. Alla rader
              delar samma rutnät — variationen kommer från innehållet. */}
          <EditorialRowsReveal className="mt-16 md:mt-24">
            <dl>
              {practical.map((item) => (
                <div
                  key={item.title}
                  data-editorial-row
                  className="grid gap-4 border-t border-zinc-300 py-12 md:grid-cols-12 md:gap-x-8 md:py-20"
                >
                  <dt
                    data-row-title
                    className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.03em] text-zinc-900 md:col-span-5"
                  >
                    {item.title}
                  </dt>
                  <dd
                    data-row-body
                    className="max-w-xl space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-6 md:col-start-7"
                  >
                    {item.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </EditorialRowsReveal>
        </div>
      </section>

      {/* ---------- 08 · Vanliga frågor ---------- */}
      <section className="bg-white py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="fadeUp" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <p className={`${chapterIndexOnLight} md:col-span-2`}>07</p>
            <div className="md:col-span-9 md:col-start-4">
              <ProcessFaq heading="Frequently asked questions" items={faqItems} variant="editorial" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- Så går det till & Det första samtalet (gemensamt före bokning) ---------- */}
      <section className="bg-[#f4f3ef] py-16 md:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <div data-col-left className="md:col-span-5">
              <h2 className="max-w-4xl font-serif text-[clamp(2.25rem,4.2vw,4rem)] font-medium leading-[1.12] tracking-[-0.045em] text-zinc-900">
                How it works
              </h2>
            </div>
            <div
              data-col-right
              className="max-w-2xl space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-6 md:col-start-7"
            >
              {coachingProcessParagraphsEn.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal
            variant="splitColumn"
            className="mt-16 grid gap-8 border-t border-zinc-300 pt-16 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-20"
          >
            <div data-col-left className="md:col-span-5">
              <h2 className="max-w-md font-serif text-[clamp(2.25rem,4.2vw,4rem)] font-medium text-balance leading-[1.18] tracking-[-0.035em] text-zinc-900">
                The first call
              </h2>
            </div>
            <div
              data-col-right
              className="space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-6 md:col-start-7"
            >
              <p>
                The introductory call is free. It usually takes 15–30 minutes and is a chance to
                explore whether coaching feels right for you.
              </p>
              <p>
                We talk about your situation and what you want to get out of the coaching. You have the
                chance to ask questions and share what is on your mind — without committing to
                anything.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- 09 · Avslut ---------- */}
      <section className="bg-surface-dark py-24 text-zinc-100 md:py-32 lg:py-40">
        <ScrollReveal variant="ctaStack" className="mx-auto max-w-7xl px-6 md:px-10">
          <h2
            data-cta-heading
            className="max-w-5xl font-serif text-[clamp(3rem,8vw,8rem)] font-medium leading-[1.12] tracking-[-0.05em] text-white"
          >
            Book an introductory call
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p
              data-cta-body
              className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7"
            >
              Tell me briefly what is on your mind. The first call is free and gives us the chance to
              see whether coaching with me feels right for you.
            </p>
            <div data-cta-actions className="md:col-span-5 md:col-start-7">
              <CtaLink href="/en/kontakt" variant="secondary" translucent>
                Book a free introductory call
              </CtaLink>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                A short, free first phone call.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
