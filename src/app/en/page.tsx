import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import { LogoMark } from "@/components/brand/logo";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import KineticTeamHybrid from "@/components/ui/kinetic-team-hybrid";
import ClientTestimonial from "@/components/client-testimonial";
import CvbBaseBenefitsAccordion from "@/components/cvb-base-benefits-accordion";
import MobileStickyCta from "@/components/mobile-sticky-cta";
import HeroCoachingPathLinks, {
  heroPathLinksPlacementClass,
} from "@/components/hero-coaching-path-links";
import { enDictionary } from "@/lib/i18n/dictionaries/en";
import {
  HOME_DISPLAY,
  HOME_DISPLAY_BASE,
  HOME_DISPLAY_SM,
} from "@/lib/homepage-typography";

export const metadata: Metadata = {
  alternates: pageAlternates("", "en"),
  title: "CVB Coaching – individual and business coaching in Gothenburg",
  description:
    "CVB Coaching in Gothenburg. Individual coaching for when you are facing a choice, and business coaching for employees and leaders.",
};

const t = enDictionary;

/* ---------------------------------------------------------------------------
   Startsidan är komponerad som fem ytor, inte som tio sektioner.

   YTA 1  mörk   akt 00  hero
   YTA 2  ljus   akt 01  coaching  +  akt 02  arbetet
   YTA 3  mörk   akt 03  Carolina
   YTA 4  ljus   akt 04  processen
   YTA 5  mörk   akt 05  kontinuitet  +  akt 06  avslut

   Tidigare bytte sidan yta vid varje sektion, med identisk symmetrisk luft
   (160px upp och ned) i varje skarv. Då blir varje övergång en gräns, och
   sidan läses som staplade block. Nu bär ytan akten: skarven finns bara där
   ljuset faktiskt växlar, och rytmen inne i ett fält skapas av osymmetriska
   marginaler i stället för av upprepad sektionsluft.

   Typografin har tre steg i stället för nio display-storlekar. Storleken
   betyder något igen: DISPLAY är en akt, DISPLAY_SM är en rörelse inne i en
   akt, SUB är en post. Alla aktrubriker börjar dessutom i samma vänsterkant.
--------------------------------------------------------------------------- */

const DISPLAY = HOME_DISPLAY;
/** Base-akt: något mer auktoritet än standard DISPLAY, tak ~72px på stor desktop. */
const DISPLAY_BASE = HOME_DISPLAY_BASE;
const DISPLAY_SM = HOME_DISPLAY_SM;
const SUB =
  "font-serif text-[clamp(2.375rem,4.6vw,4.5rem)] font-medium leading-[1.14] tracking-[-0.035em]";
const CHAPTER = "text-xs font-medium tabular-nums tracking-[0.32em]";
const CHAPTER_ON_DARK = `${CHAPTER} text-white`;

/** "When coaching is relevant — and when it is not" är dolt tills vidare på kundens begäran. */
const SHOW_COACHING_FIT = false;

const relevanceIntro = [
  "Sometimes it starts with a question that will not quite let go.",
  "It might be that …",
];

const relevancePoints = [
  "Face a choice and seek clarity about what truly matters.",
  "Find your way in a new role or greater responsibility.",
  "Feel that something needs to change, without yet knowing what or how.",
  "Make a decision with greater clarity and trust in your own judgement.",
  "Have space to think freely, explore new perspectives and discover what has not been clear before.",
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

const bookingIntro = [
  "Curious about coaching and want to know whether it could be right for you or your organisation?",
  "Book a first, free call where we talk about your situation, your needs and what you want to develop. The call usually takes 15–30 minutes, and I will call you during the time window you choose.",
  "After the call, we decide together whether and how to move forward.",
];

const cvbBaseBenefits = [
  {
    title: "Coaching that continues between sessions",
    body: "Prepare for your sessions, gather your reflections, follow your thoughts and bring what feels important to the next session.",
  },
  {
    title: "For the individual and the company engagement",
    body: "CVB Base makes room for the client's own reflections while supporting a clear structure around the coaching engagement.",
  },
  {
    title: "Your privacy in CVB Base",
    body: "Your reflections and details are handled with respect for your privacy. CVB Base has clear permissions for which information you and your coach can access.",
  },
  {
    title: "One place for the whole coaching process",
    body: "Direction, sessions, approved summaries, commitments, reflections and relevant material can be kept together around the same coaching work instead of being scattered across emails, documents and separate tools.",
  },
];

export default function HomePageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      <ParallaxController>
        {/* ======================= AKT 00 · HERO ======================= */}
        <section
          data-hero-sticky
          data-hero-fluid
          className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
        >
          <HeroVideoBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/45" aria-hidden="true" />
          <SiteNavigation />
          <div data-hero-overlay className="pointer-events-none absolute inset-0 z-[2]">
            <div data-hero-column className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[max(clamp(2.5rem,8svh,4.5rem),env(safe-area-inset-bottom,0px))] md:absolute md:left-[5.5vw] md:top-[62%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
              <div
                data-hero-spacer
                className="w-full shrink-0 min-h-[min(34svh,20rem)] md:hidden"
                aria-hidden="true"
              />
              <HeroReveal className="relative flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center sm:max-w-[24rem] md:max-w-lg md:items-start md:text-left lg:max-w-xl">
                <div className="relative w-full md:max-w-lg lg:max-w-xl">
                  <h1
                    data-hero-headline
                    className="relative mx-auto max-w-[18ch] font-serif text-4xl font-bold leading-[1.22] tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:mx-0 md:max-w-none md:text-6xl md:leading-[1.2] lg:text-7xl"
                  >
                    Time to think. Room to grow
                  </h1>
                </div>
                <div data-hero-body className="flex w-full flex-col items-center md:items-start">
                  <p className="mt-6 max-w-[34ch] text-[1.0625rem] font-[450] leading-[1.6] text-balance text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] md:mt-6 md:max-w-[46ch] md:text-lg">
                    Professional coaching for anyone who wants to develop, make decisions or find new
                    perspectives, in life or at work.
                  </p>
                </div>
                <div className="mt-8 flex w-full max-w-full flex-col items-center gap-3 sm:gap-3.5 md:mt-9 md:items-start">
                  <span data-hero-cta className="flex w-full justify-center md:inline-flex md:w-auto md:justify-start">
                    <CtaLink href="/en/kontakt" variant="primary" translucent>
                      {t.cta.primary}
                    </CtaLink>
                  </span>
                </div>
              </HeroReveal>
            </div>
            <HeroCoachingPathLinks locale="en" className={heroPathLinksPlacementClass} />
          </div>
        </section>

        <div className="relative z-10 isolate bg-[#f4f3ef]">
          {/* ============ YTA 2 · ljus · akt 01 och akt 02 ============ */}
          <div data-parallax-section className="pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28">
            {/* -------------------- AKT 01 · COACHING --------------------
                Vägvalet, relevansen, bilden och avgränsningen är en enda akt.
                De låg tidigare i två sektioner med var sin yta; nu skiljs
                rörelserna åt av marginal i stället för av en ny bakgrund. */}
            <section
              id="coaching"
              className="mx-auto max-w-7xl scroll-mt-24 px-6 md:px-10 md:scroll-mt-32"
            >
              <ScrollReveal variant="splitColumn" emphasis className="max-w-3xl">
                <div data-col-left>
                  <h2 className={`${DISPLAY} text-zinc-900`}>
                    Individual coaching or business coaching
                  </h2>
                </div>
              </ScrollReveal>

              <div className="mt-10 md:mt-12">
                <CoachingServicesGrid locale="en" dense variant="editorial" />
              </div>

              {/* Sammanslaget avsnitt: vad coaching kan ge + vad det kan handla om */}
              <ScrollReveal
                variant="mediaSplit"
                className="mt-20 grid gap-8 md:mt-20 md:grid-cols-12 md:items-start md:gap-x-8"
              >
                <div data-col-left data-reveal-group className="md:col-span-5">
                  <p className={`${CHAPTER} text-zinc-900`}>03</p>
                  <h2
                    className={`mt-5 max-w-[14ch] md:mt-6 md:max-w-[22ch] xl:max-w-[14ch] ${DISPLAY} text-zinc-900`}
                  >
                    <span className="md:hidden">What can coaching give you?</span>
                    <span className="hidden md:block xl:hidden">
                      What can coaching
                      <br />
                      give you?
                    </span>
                    <span className="hidden xl:inline">What can coaching give you?</span>
                  </h2>
                  <p className="mt-10 max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-12">
                    Coaching can give you space to pause, reflect and see your situation from new
                    perspectives.
                  </p>
                  <figure className="relative mt-8 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.25rem] sm:max-w-md md:mt-8 md:aspect-[16/10] md:max-w-lg md:rounded-[1.75rem] lg:max-w-xl lg:rounded-[2rem]">
                    <Image
                      src="/carolina-02.jpg"
                      alt="Carolina von Braun in conversation at a meeting table."
                      fill
                      sizes="(min-width: 1024px) 36rem, (min-width: 768px) 32rem, 24rem"
                      className="object-cover object-[42%_center] md:object-[36%_40%]"
                      quality={80}
                    />
                  </figure>
                </div>
                <div
                  data-col-right
                  className="flex md:col-span-6 md:col-start-7 md:h-full md:flex-col md:pt-2 lg:pt-6"
                >
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div
                      data-reveal-group
                      className="mb-8 space-y-4 text-[1.0625rem] font-semibold leading-[1.75] text-zinc-700 md:mb-10"
                    >
                      {relevanceIntro.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    <ul className="flex w-full flex-col divide-y divide-zinc-300 border-t border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700 md:flex-1">
                      {relevancePoints.map((point) => (
                        <li
                          key={point}
                          data-list-item
                          className="flex flex-1 items-start gap-5 py-5 md:items-center md:py-4"
                        >
                          <span
                            className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900 md:mt-0"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              <EditorialRowsReveal
                emphasis
                className="mt-16 border-t border-zinc-300 md:mt-24 md:pt-12 lg:mt-28 lg:pt-14"
              >
                {workRows.map((row) => (
                  <article
                    key={row.index}
                    data-editorial-row
                    className="border-b border-zinc-300 py-10 md:py-12"
                  >
                    <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                      <div className="flex items-baseline gap-4 md:contents">
                        <span
                          data-row-index
                          aria-hidden="true"
                          className="min-w-[2.5rem] shrink-0 font-serif tabular-nums text-[2rem] leading-tight tracking-[-0.02em] text-zinc-400 md:col-span-1 md:min-w-0 md:text-[clamp(2.25rem,3.2vw,2.875rem)]"
                        >
                          {row.index}
                        </span>
                        <h3
                          data-row-title
                          className={`${SUB} text-zinc-900 md:col-span-4 md:col-start-2`}
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
              </EditorialRowsReveal>
            </section>

            {/* Rörelse 3 — avgränsningen, en kvalificerande rörelse och därför
                ett steg ned i display-skalan, inte en egen akt. */}
            {SHOW_COACHING_FIT && (
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <ScrollReveal
                variant="splitColumn"
                className="mt-24 grid gap-12 border-t border-zinc-300 pt-16 md:mt-36 md:grid-cols-12 md:gap-x-8 md:pt-20"
              >
                <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-balance text-zinc-900 md:col-span-5`}>
                  When coaching is relevant — and when it is not
                </h2>
                <div data-col-right className="grid gap-14 md:col-span-6 md:col-start-7 md:grid-cols-2 md:gap-10">
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
            )}
          </div>

          <div data-parallax-gap aria-hidden="true" className="relative z-0">
            <div
              data-parallax-gap-surface
              className="relative z-0 h-14 bg-[#f4f3ef] md:h-20 lg:h-24"
            />
          </div>

          {/* ============ YTA 3 · mörk · akt 03 · Carolina ============ */}
          <div data-parallax-cover className="relative z-10">
            <KineticTeamHybrid locale="en" />

            {/* Samma mörka yta · en klients röst efter Carolinas presentation */}
            <ClientTestimonial locale="en" />
          </div>

          <div data-parallax-gap aria-hidden="true" className="relative z-0">
            <div
              data-parallax-gap-surface
              className="relative z-0 h-14 bg-[#f4f3ef] md:h-20 lg:h-24"
            />
          </div>

          {/* ======= YTA 5 · mörk · akt 05 · CVB Base ======= */}
          <div
            data-parallax-cover
            data-parallax-section
            className="relative z-10 overflow-hidden bg-surface-dark pt-20 pb-0 text-zinc-100 md:pt-32"
          >
            {/* -------------------- AKT 05 · KONTINUITET -------------------- */}
            <section className="mx-auto max-w-7xl px-6 md:px-10">
              <ScrollReveal
                variant="mediaSplit"
                className="grid gap-12 md:grid-cols-12 md:gap-x-8 lg:gap-x-10"
              >
                <div className="md:col-span-12">
                  <LogoMark
                    descriptor="base"
                    withCoaching={false}
                    className="h-12 w-auto md:h-14 lg:h-16"
                  />
                  <div
                    className="mt-6 md:mt-8 md:grid md:grid-cols-12 md:items-stretch md:gap-x-8 lg:gap-x-10"
                  >
                    <div data-col-left data-reveal-group className="md:col-span-7">
                      <p className={CHAPTER_ON_DARK}>05</p>
                      <h2
                        className={`mt-5 max-w-3xl md:mt-6 ${DISPLAY_BASE} text-white lg:max-w-4xl`}
                      >
                        A digital support throughout the coaching process
                      </h2>
                      <div
                        data-reveal-group
                        className="mt-8 space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:mt-10"
                      >
                        <p data-col-paragraph className="max-w-2xl">
                          CVB Base is my digital support for individual coaching and business coaching, developed for a
                          Swedish context.
                        </p>
                        <p data-col-paragraph className="max-w-2xl">
                          It lets you prepare for sessions, capture thoughts and reflections between sessions and return
                          to what has become important along the way. What you work on in coaching stays there to
                          explore and build on – even between our meetings.
                        </p>
                      </div>
                    </div>

                    <figure
                      data-col-right
                      className="relative mt-10 aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[1.25rem] md:mt-0 md:col-span-5 md:aspect-auto md:h-full md:min-h-0 md:max-w-none md:rounded-[1.75rem] lg:rounded-[2rem]"
                    >
                      <Image
                        src="/cvb-base-ipad.jpg"
                        alt="A person holding a tablet — CVB Base between sessions."
                        fill
                        sizes="(min-width: 768px) 36vw, 94vw"
                        className="object-cover object-center"
                        quality={80}
                      />
                    </figure>
                  </div>
                </div>

                <div data-reveal-group className="md:col-span-12">
                  <div className="mt-12 border-t border-white/20 md:mt-16">
                    <CvbBaseBenefitsAccordion items={cvbBaseBenefits} />
                  </div>
                  <p className="mt-12 max-w-2xl border-t border-white/20 pt-10 pb-14 font-serif text-lg font-medium italic leading-[1.45] tracking-[-0.02em] text-balance text-zinc-400 md:mt-14 md:max-w-3xl md:pt-12 md:pb-20 md:text-xl lg:max-w-4xl lg:pb-24">
                    <span className="max-sm:whitespace-nowrap">CVB Base – support</span> before, between
                    <br className="sm:hidden" aria-hidden="true" />
                    {" "}and after the sessions.
                  </p>
                </div>
              </ScrollReveal>
            </section>
          </div>

          <div data-parallax-gap aria-hidden="true" className="relative z-0">
            <div
              data-parallax-gap-surface
              className="relative z-0 h-14 bg-[#f4f3ef] md:h-20 lg:h-24"
            />
          </div>

          {/* ======= YTA 5 · mörk · akt 06 · avslut ======= */}
          <div
            data-parallax-cover
            data-parallax-section
            className="relative z-10 overflow-hidden bg-surface-dark pb-20 text-zinc-100 md:pb-24"
          >
            {/* -------------------- AKT 06 · AVSLUT -------------------- */}
            <section id="kontakt" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-20 md:px-10 md:scroll-mt-32 md:pt-28">
              <ScrollReveal variant="ctaStack" emphasis>
                <p data-cta-label className={CHAPTER_ON_DARK}>06</p>
                <h2 data-cta-heading className={`mt-8 max-w-3xl ${DISPLAY} text-white md:mt-10`}>
                  Book a free introductory call
                </h2>
                <div className="mt-10 border-t border-white/20 pt-8 max-md:flex max-md:flex-col max-md:gap-8 md:mt-14 md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-10 md:pt-10">
                  <div
                    data-cta-body
                    className="max-w-xl space-y-5 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 max-md:mt-4 md:col-span-5 md:col-start-7 md:mt-0"
                  >
                    {bookingIntro.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div
                    data-cta-actions
                    className="flex flex-col items-center pb-6 md:col-span-5 md:col-start-7 md:items-start md:pb-0"
                  >
                    <CtaLink href="/en/kontakt" variant="secondary" translucent>
                      Book a free introductory call
                    </CtaLink>
                  </div>
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </ParallaxController>
      <MobileStickyCta>
        <CtaLink href="/en/kontakt" variant="primary" translucent>
          {t.cta.primary}
        </CtaLink>
      </MobileStickyCta>
    </main>
  );
}
