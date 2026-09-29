import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";

export const metadata: Metadata = {
  title: "Coaching | CVB Coaching",
  description:
    "How coaching works at CVB Coaching in Gothenburg: when it can be right, what the work involves and how a collaboration works. Individual coaching and business coaching.",
};

/**
 * Engelsk version av /coaching. Texten är en direkt översättning av den
 * godkända svenska sidan och ska hållas i fas med den.
 */

const relevancePoints = [
  "You are facing a choice and need to understand what actually matters to you.",
  "You have taken on new responsibility or are going through a change at work.",
  "You know something needs to change, but cannot yet see how you want to move forward.",
  "You need to make a decision before you have all the answers.",
  "You want to speak freely, in confidence and outside your own circle.",
];

const rightFitWhen = [
  "The question genuinely matters to you, not just on paper.",
  "You want to finish the thinking yourself, not be handed an answer.",
  "It needs to happen outside your own circle, in confidence.",
  "Something is meant to change, not only be discussed.",
];

const lessSuitedWhen = [
  "You want an expert to assess the situation and tell you what to do.",
  "The question concerns ill health or needs treatment. Therapy is the right route then, not coaching.",
  "The direction is already set and what remains is carrying it out.",
];

const workRows = [
  {
    index: "01",
    title: "Clarity",
    body: "I listen and ask questions that help you sort out what the question is really about and what matters most to you.",
  },
  {
    index: "02",
    title: "Decisions",
    body: "I help you test your options and the assumptions they rest on, so you can see what you are choosing, what you are giving up and why.",
  },
  {
    index: "03",
    title: "Direction",
    body: "You turn what you have arrived at into next steps that work in your everyday life.",
  },
];

const processSteps = [
  {
    index: "01",
    title: "The first conversation",
    body: "Confidential. You tell me about your situation, and together we see whether coaching is the right support and whether we work well together.",
  },
  {
    index: "02",
    title: "What you want to get clearer about",
    body: "I help you put into words what you want to get clearer about and what you want to be able to do differently.",
  },
  {
    index: "03",
    title: "The sessions",
    body: "You and I set the rhythm together. Every session ends with something you take forward.",
  },
  {
    index: "04",
    title: "Closing",
    body: "You and I check back against what you wanted to achieve and see together whether the work is finished or should continue.",
  },
];

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
      "For employees and leaders with a question in working life — new responsibility, a difficult relationship or a decision that affects others.",
      ctaLabel: "Read about business coaching",
  },
];

const practical = [
  {
    title: "In Gothenburg or online",
    body: "CVB Coaching is based in Gothenburg. Sessions take place in person or online, depending on what suits best.",
  },
  {
    title: "Confidential",
    body: "What is said in the session stays in the session.",
  },
  {
    title: "When a company makes the first contact",
    body: "CVB Coaching works with individual employees and leaders in working life. The company may make the first contact and fund the coaching. The coaching then takes place in a personal, confidential relationship between Carolina and the client.",
  },
];

const faqItems: ProcessFaqItem[] = [
  {
    question: "What is the first conversation?",
    answer:
      "The first conversation is a short, free phone call. You tell me a little about what you are looking for, and we get a sense of whether coaching is the right path and whether it feels right to work together. It is not a coaching session, and you are not committing to anything.",
  },
  {
    question: "Do I have to decide after the first conversation?",
    answer:
      "No. The first conversation is there so we can both get a sense of whether this is right. We only move forward if it feels good and relevant for both of us.",
  },
  {
    question: "How does the coaching collaboration start?",
    answer:
      "Once we have agreed on how we want to work together, you receive a personal confirmation from me and we plan our first coaching session. You also get access to CVB Base, where we keep together what belongs to our work together.",
  },
  {
    question: "What is CVB Base?",
    answer:
      "CVB Base is part of how I work with my clients. There you can collect reflections, prepare what you want to bring to the next session and return to things we have worked on before. This way the context stays in place between our sessions.",
  },
  {
    question: "How do you work with companies?",
    answer:
      "I work with companies through individual coaching collaborations with people in the organisation. It can start with one person and be extended to more when needed. Each collaboration is separate, and before we begin we are clear about who is paying and what, if anything, is to be shared back with the commissioning company.",
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
      {/* ---------- 00 · Hero — gles, hög, asymmetrisk ---------- */}
      <section className="flex min-h-[92svh] flex-col justify-between px-6 pb-20 pt-36 md:min-h-[112svh] md:px-10 md:pb-24 md:pt-52 lg:min-h-[118svh]">
        <div className="mx-auto w-full max-w-7xl">
          <HeroReveal>
            <div className="grid md:grid-cols-12 md:gap-x-8">
              <div className="md:col-span-2">
                <div data-hero-line className="mb-8 h-px w-12 origin-left bg-[#7d6435]" />
                <p data-hero-label className={chapterLabelLight}>
                  Coaching
                </p>
              </div>
              <h1
                data-hero-headline
                className="mt-14 max-w-[15ch] font-serif text-[clamp(3rem,9vw,10rem)] font-medium leading-[1.2] tracking-[-0.055em] text-zinc-900 md:col-span-10 md:mt-0"
              >
                What coaching means at CVB.
              </h1>
            </div>
          </HeroReveal>
        </div>

        {/* Stödtexten ligger medvetet långt ned och långt till höger: öppningen
            ska läsas som en sida som börjar, inte som ett introblock. */}
        <div className="mx-auto mt-32 w-full max-w-7xl md:mt-0">
          <HeroReveal>
            <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
              <p
                data-hero-body
                className="max-w-md text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-4 md:col-start-7"
              >
                This page describes when coaching can be relevant, how the work is done and what you
                can expect.
              </p>
              <div data-hero-cta className="md:col-span-2 md:col-start-11 md:justify-self-end">
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
      </section>

      {/* ---------- 01 · När coaching kan vara rätt — tät ---------- */}
      <section className="bg-white py-20 md:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div data-col-left className="md:col-span-5">
              <p className={chapterIndexOnLight}>01</p>
              <h2 className="mt-10 max-w-md font-serif text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[1.12] tracking-[-0.045em] text-zinc-900 md:mt-16">
                When coaching can be right
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
            What the work involves
          </h2>
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

      {/* ---------- 03 · Så går det till — tät ---------- */}
      <section className="bg-white py-20 md:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <p data-col-left className={`${chapterIndexOnLight} md:col-span-2`}>03</p>
            <div data-col-right className="md:col-span-8 md:col-start-5">
              <h2 className="max-w-4xl font-serif text-[clamp(3rem,7vw,7rem)] font-medium leading-[1.12] tracking-[-0.045em] text-zinc-900">
                How it works
              </h2>
            </div>
          </ScrollReveal>

          <EditorialRowsReveal className="mt-20 md:mt-28">
            <ol className="border-t border-zinc-300">
              {processSteps.map((step) => (
                <li
                  key={step.index}
                  data-editorial-row
                  className="relative border-b border-zinc-300 py-10 md:py-14"
                >
                  {/* Samma rutnätsdisciplin som scen 02, men tätare index —
                      processen är operativ, inte signaturscen. */}
                  <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-8">
                    <div className="flex items-baseline gap-4 md:contents">
                      <span
                        data-row-index
                        aria-hidden="true"
                        className="min-w-[1.6rem] shrink-0 font-serif tabular-nums text-[1.25rem] leading-tight tracking-[-0.02em] text-zinc-400 md:col-span-1 md:min-w-0 md:text-[clamp(1.25rem,1.4vw,1.375rem)]"
                      >
                        {step.index}
                      </span>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-[1.3] tracking-tight text-zinc-900 md:col-span-4 md:col-start-2 md:text-2xl"
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p
                      data-row-body
                      className="max-w-xl text-[1.02rem] font-[450] leading-[1.7] text-zinc-600 md:col-span-5 md:col-start-8 md:text-[1.0625rem]"
                    >
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="ml-auto mt-10 max-w-xl border-l border-zinc-300 pl-6 text-[0.98rem] font-[450] leading-[1.7] text-zinc-600 md:mt-14 md:pl-8 md:text-[1.02rem]">
              The shape of the work follows the question and what you want to get out of the sessions.
            </p>
          </EditorialRowsReveal>
        </div>
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
              The conversation is at the centre. CVB Base helps you keep the context between
              sessions.
            </h2>
          </div>
          <div
            data-col-right
            className="space-y-8 border-t border-white/60 pt-10 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-8 md:mt-40 md:pt-12"
          >
            <p data-col-paragraph>
              When it is relevant, you use CVB Base to prepare questions, gather reflections and
              return to things you want to follow over time. It does not replace the coaching, but
              gives you a place for what happens between sessions.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ---------- 05 · När coaching är relevant — tätast ---------- */}
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

      {/* ---------- Paus · Statement ----------
          Frasen stod tidigare två gånger på sidan (hero och rubriken nedan).
          Den är flyttad hit som en egen paus i stället för att upprepas. */}
      <section className="flex min-h-[72svh] items-center bg-[#f4f3ef] pb-28 pt-12 md:min-h-[86svh] md:pb-40">
        <ScrollReveal variant="fadeUp" className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <p className="max-w-[20ch] font-serif text-[clamp(2.25rem,5.5vw,5.5rem)] font-medium leading-[1.14] tracking-[-0.04em] text-zinc-900 md:ml-[16.666%]">
            Individual coaching and business coaching share the same approach.
          </p>
        </ScrollReveal>
      </section>

      {/* ---------- 06 · Individuell eller business coaching ---------- */}
      <section id="vagar" className="scroll-mt-28 bg-white py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <p data-col-left className={`${chapterIndexOnLight} md:col-span-2`}>06</p>
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
                    {/* Individuell och business coaching är två sammanhang, inte
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
              Not sure which kind of coaching is relevant to your question? We clarify that in the
              first conversation.
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
            <p className={chapterIndexOnLight}>07</p>
            <h2 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.03em] text-zinc-900">
              Practical
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
                    className="max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-6 md:col-start-7"
                  >
                    {item.body}
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
            <p className={`${chapterIndexOnLight} md:col-span-2`}>08</p>
            <div className="md:col-span-9 md:col-start-4">
              <ProcessFaq heading="Frequently asked questions" items={faqItems} variant="editorial" />
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
            Book an introductory conversation
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p
              data-cta-body
              className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7"
            >
              Tell me briefly what you would like to talk about and choose a time. You do not need to
              have everything formulated. The conversation is confidential.
            </p>
            <div data-cta-actions className="md:col-span-5 md:col-start-7">
              <CtaLink href="/en/kontakt" variant="secondary" translucent>
                Book an introductory conversation
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
