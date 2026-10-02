import type { Metadata } from "next";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import { LogoMark } from "@/components/brand/logo";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import KineticTeamHybrid from "@/components/ui/kinetic-team-hybrid";
import CvbBaseBenefitsAccordion from "@/components/cvb-base-benefits-accordion";
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
  title: "CVB Coaching – individual and business coaching in Gothenburg",
  description:
    "CVB Coaching in Gothenburg. Individual coaching for you when you face a choice, a change or a question, and business coaching for employees and leaders in working life.",
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
const CHAPTER_ON_LIGHT = `${CHAPTER} text-zinc-900`;
const CHAPTER_ON_DARK = `${CHAPTER} text-white`;

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

const firstCallValueRows = [
  {
    index: "01",
    title: "A clearer question",
    body: "We put words to where you are and what you need to get clearer about.",
  },
  {
    index: "02",
    title: "The right support",
    body: "We separate coaching from what is better served by advice, therapy or another kind of support.",
  },
  {
    index: "03",
    title: "Next step",
    body: "You leave with a clearer picture of what would help you move forward — whether or not we continue.",
  },
];

const cvbBaseBenefits = [
  {
    title: "Coaching that continues between sessions",
    body: "Prepare the next session, capture reflections as they arise and return to what has become important without starting from scratch each time.",
  },
  {
    title: "Built for both the individual and the company engagement",
    body: "When a company funds the coaching, several relationships exist at once. CVB Base is designed to keep the commissioning company's framework, Carolina's work and the client's personal coaching relationship clearly separate.",
  },
  {
    title: "You decide what you share",
    body: "Your own material can stay private. What you choose to share, Carolina can use as input for the coaching, while her own working notes are kept out of the client view.",
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
          className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
        >
          <HeroVideoBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/45" aria-hidden="true" />
          <SiteNavigation />
          <div className="pointer-events-none absolute inset-0 z-[2]">
            <div className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[max(clamp(2.5rem,8svh,4.5rem),env(safe-area-inset-bottom,0px))] md:absolute md:left-[5.5vw] md:top-[66%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
              <div
                className="w-full shrink-0 min-h-[min(38svh,22rem)] md:hidden"
                aria-hidden="true"
              />
              <HeroReveal className="relative flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center sm:max-w-[24rem] md:max-w-lg md:items-start md:text-left lg:max-w-xl">
                <div className="relative w-full md:max-w-lg lg:max-w-xl">
                  <h1
                    data-hero-headline
                    className="relative mx-auto max-w-[18ch] font-serif text-4xl font-bold leading-[1.22] tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:mx-0 md:max-w-none md:text-6xl md:leading-[1.2] lg:text-7xl"
                  >
                    Some questions are not meant to be thought through alone.
                  </h1>
                </div>
                <p
                  data-hero-body
                  className="mt-6 max-w-[34ch] text-[1.0625rem] font-[450] leading-[1.6] text-balance text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] md:mt-7 md:max-w-[46ch] md:text-lg"
                >
                  Professional coaching for you when you face a choice, a
                  change or a question where the next step is not yet obvious.
                </p>
                <div className="mt-9 flex w-full max-w-full flex-col items-center gap-3 sm:gap-3.5 md:mt-10 md:items-start">
                  <span data-hero-cta className="inline-flex justify-center md:justify-start">
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
          <div data-parallax-section className="pt-24 pb-28 md:pt-32 md:pb-44 lg:pt-40">
            {/* -------------------- AKT 01 · COACHING --------------------
                Vägvalet, relevansen, bilden och avgränsningen är en enda akt.
                De låg tidigare i två sektioner med var sin yta; nu skiljs
                rörelserna åt av marginal i stället för av en ny bakgrund. */}
            <section
              id="coaching"
              className="mx-auto max-w-7xl scroll-mt-24 px-6 md:px-10 md:scroll-mt-32"
            >
              <ScrollReveal variant="splitColumn" className="max-w-3xl">
                <div data-col-left>
                  <h2 className={`${DISPLAY} text-zinc-900`}>
                    Individual coaching or business coaching
                  </h2>
                </div>
              </ScrollReveal>

              <div className="mt-14 md:mt-16">
                <CoachingServicesGrid locale="en" dense variant="editorial" />
              </div>

              <p className="mt-10 max-w-2xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-12">
                The conversation is at the centre. When it is relevant, the work is held together between sessions.
              </p>

              {/* Rörelse 2 — när coaching kan vara rätt · dokumentär bild + lista */}
              <ScrollReveal
                variant="splitColumn"
                className="mt-32 grid gap-10 md:mt-48 md:grid-cols-12 md:items-start md:gap-x-8"
              >
                <div data-col-left className="md:col-span-5">
                  <h2 className={`max-w-[12ch] md:max-w-[11ch] ${DISPLAY} text-zinc-900`}>
                    When coaching can be right
                  </h2>
                  <figure className="relative mt-10 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.25rem] sm:max-w-md md:mt-12 md:max-w-lg md:rounded-[1.75rem] lg:max-w-xl lg:rounded-[2rem]">
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
                  <ScrollReveal variant="staggerList" className="flex min-h-0 flex-1 flex-col">
                    <ul className="flex w-full flex-col divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700 md:min-h-full md:flex-1">
                      {relevancePoints.map((point) => (
                        <li
                          key={point}
                          data-list-item
                          className="flex flex-1 items-start gap-5 py-6 md:items-center md:py-5"
                        >
                          <span
                            className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900 md:mt-0"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </section>

            {/* Rörelse 3 — avgränsningen, en kvalificerande rörelse och därför
                ett steg ned i display-skalan, inte en egen akt. */}
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

            {/* -------------------- AKT 02 · ARBETET --------------------
                Aktens signaturmoment ligger i posttiteln, inte i siffran.
                De tidigare lösryckta jättesiffrorna i zinc-200 konkurrerade
                med titlarna; med index, titel och brödtext i samma radgrammatik
                som resten av sajten blir den uppskalade titeln det som syns. */}
            <section className="mt-40 md:mt-56">
              <EditorialRowsReveal className="mx-auto max-w-7xl px-6 md:px-10">
                <p className={CHAPTER_ON_LIGHT}>03</p>
                <h2
                  data-section-heading
                  className={`mt-10 max-w-3xl max-md:max-w-[16.5ch] ${DISPLAY} text-zinc-900 md:mt-14`}
                >
                  What the work involves
                </h2>
                <div className="mt-20 border-t border-zinc-300 md:mt-28">
                  {workRows.map((row) => (
                    <article
                      key={row.index}
                      data-editorial-row
                      className="border-b border-zinc-300 py-14 md:py-24"
                    >
                      <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                        {/* Index och titel hör ihop. På smal skärm står de på samma
                            rad; från md upplöses omslaget (contents) så att båda
                            blir egna kolumner i radens gemensamma rutnät. */}
                        <div className="flex items-baseline gap-4 md:contents">
                          {/* Siffran är struktur, inte innehåll — titeln och
                              brödtexten bär betydelsen. */}
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
                </div>
              </EditorialRowsReveal>
            </section>
          </div>

          {/* ============ YTA 3 · mörk · akt 03 · Carolina ============ */}
          <KineticTeamHybrid locale="en" />

          {/* ============ YTA 4 · ljus · akt 04 · processen ============
              Stegen och det som släpper kravet på att veta allt i förväg är
              en och samma rörelse: så går det till, och så mycket behöver du
              inte ha klart för dig innan. Ingen ytväxling emellan. */}
          <div data-parallax-section className="pt-24 pb-28 md:pt-32 md:pb-40 lg:pt-40">
            <EngagementSection locale="en" variant="field" />

            <section className="mt-24 md:mt-32">
              <EditorialRowsReveal className="mx-auto max-w-7xl px-6 md:px-10">
                <p className={CHAPTER_ON_LIGHT}>THE FIRST CONVERSATION</p>
                <h2
                  data-section-heading
                  className={`mt-8 max-w-3xl ${DISPLAY} text-zinc-900 md:mt-10`}
                >
                  The first conversation should give you something
                </h2>
                <p className="mt-8 max-w-2xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-10">
                  You do not need to have decided on coaching. The first conversation is a chance to
                  understand the question better, test whether coaching is the right support and get a
                  sense of whether we work well together.
                </p>
                <div className="mt-12 border-t border-zinc-300 md:mt-16">
                  {firstCallValueRows.map((row) => (
                    <article
                      key={row.index}
                      data-editorial-row
                      className="border-b border-zinc-300 py-10 md:py-14"
                    >
                      <div className="grid gap-5 md:grid-cols-12 md:items-start md:gap-x-8">
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
                </div>
              </EditorialRowsReveal>
            </section>

            <ScrollReveal
              variant="splitColumn"
              className="mx-auto mt-32 grid max-w-7xl gap-10 px-6 md:mt-44 md:grid-cols-12 md:gap-x-8 md:px-10"
            >
              <h2 data-col-left className={`max-w-xl ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
                You do not need to know everything from the start
              </h2>
              <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-4">
                <p
                  data-col-paragraph
                  className="max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600"
                >
                  You do not need to know in advance how many sessions it will take, or to have fully
                  formulated the question. That becomes clear in the first conversation.
                </p>
                <div data-col-paragraph className="mt-10">
                  <CtaLink href="/en/kontakt" variant="tertiary">{t.cta.primary}</CtaLink>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ======= YTA 5 · mörk · akt 05 och akt 06 · uttoning =======
              Sidan mörknar en sista gång och stannar mörk. CVB Base, den
              första företagskontakten och det praktiska är en enda rörelse
              om kontinuitet, och avslutet ligger på samma yta — skillnaden
              mellan dem är skala och luft, inte en ny bakgrund. */}
          <div
            data-parallax-section
            className="relative overflow-hidden bg-surface-dark pt-28 pb-0 text-zinc-100 md:pt-44 md:pb-32"
          >
            {/* -------------------- AKT 05 · KONTINUITET -------------------- */}
            <section className="mx-auto max-w-7xl px-6 md:px-10">
              <ScrollReveal
                variant="splitColumn"
                className="grid gap-12 md:grid-cols-12 md:items-start md:gap-x-8 lg:gap-x-10"
              >
                <div data-col-left className="md:col-span-7">
                  <LogoMark
                    descriptor="base"
                    withCoaching={false}
                    className="h-12 w-auto md:h-14 lg:h-16"
                  />
                  <h2 className={`mt-6 max-w-3xl ${DISPLAY_BASE} text-white md:mt-8 lg:max-w-4xl`}>
                    Developed for professional coaching in a Swedish context.
                  </h2>
                  <div className="mt-8 space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:mt-10">
                    <p data-col-paragraph className="max-w-2xl">
                      CVB Coaching is developing CVB Base for individual coaching and business coaching in Swedish
                      settings. It is a Swedish-language digital support being developed to hold together what
                      matters before, between and after the sessions — in situations where a client, a commissioning
                      company and a coach need a clear framework.
                    </p>
                    <p data-col-paragraph className="max-w-2xl">
                      Clear roles and control over what is shared are therefore an integral part of CVB Base — not
                      an add-on around the coaching.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-12">
                  <div className="mt-12 border-t border-white/20 md:mt-16">
                    <CvbBaseBenefitsAccordion items={cvbBaseBenefits} />
                  </div>
                  <p className="mt-12 max-w-2xl border-t border-white/20 pt-10 font-serif text-lg font-medium italic leading-[1.45] tracking-[-0.02em] text-balance text-zinc-400 md:mt-14 md:max-w-3xl md:pt-12 md:text-xl lg:max-w-4xl">
                    <span className="max-sm:whitespace-nowrap">CVB Base as support</span> before, between
                    <br className="sm:hidden" aria-hidden="true" />
                    {" "}and after the sessions.
                  </p>
                </div>

                <figure
                  data-col-right
                  className="relative aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[1.25rem] md:col-span-5 md:col-start-8 md:row-start-1 md:mt-6 md:aspect-[2/3] md:max-w-2xl md:self-start md:rounded-[1.75rem] lg:mt-10 lg:rounded-[2rem]"
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
              </ScrollReveal>
            </section>

            <div className="relative left-1/2 mt-16 w-screen max-w-[100vw] -translate-x-1/2 bg-[#f2f1ed] py-16 text-zinc-900 md:mt-20 md:py-20 lg:py-24">
              <div className="mx-auto max-w-7xl px-6 md:px-10">
                <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:items-stretch md:gap-x-8 lg:gap-x-10">
                  <div data-col-left className="md:col-span-6 lg:col-span-5">
                    <div className="space-y-8 md:space-y-10">
                      <h2 className={`max-w-md ${DISPLAY_SM} text-zinc-900`}>
                        When a company makes the first contact
                      </h2>
                      <h2 className={`max-w-md ${DISPLAY_SM} text-zinc-900`}>
                        In Gothenburg or online
                      </h2>
                    </div>
                    <div className="mt-10 space-y-8 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-12 md:space-y-7">
                      <div className="space-y-6">
                        <p data-col-paragraph className="max-w-xl">
                          CVB Coaching works with individual employees and leaders in working life. The company
                          may make the first contact and fund the coaching.
                        </p>
                        <p data-col-paragraph className="max-w-xl">
                          The coaching then takes place in a personal, confidential relationship between Carolina
                          and the client. In the first dialogue I speak with the company about the need, the
                          boundaries of the collaboration and how contact works.
                        </p>
                      </div>
                      <div className="space-y-6 border-t border-zinc-300 pt-8 md:pt-7">
                        <p data-col-paragraph className="max-w-xl">
                          CVB Coaching is based in Gothenburg. Sessions take place in person or online, depending
                          on what suits best.
                        </p>
                        <p data-col-paragraph className="max-w-xl">
                          What is said in the session stays in the session.
                        </p>
                      </div>
                    </div>
                  </div>
                  <figure
                    data-col-right
                    className="relative aspect-[4/5] w-full min-h-0 overflow-hidden rounded-[1.25rem] md:col-span-6 md:col-start-7 md:aspect-auto md:h-full md:max-h-none lg:rounded-[1.75rem]"
                  >
                    <Image
                      src="/goteborg-hamn.jpg"
                      alt="Gothenburg harbour at sunset — a sailing ship and the city skyline."
                      fill
                      sizes="(min-width: 1024px) 42vw, (min-width: 768px) 38vw, 94vw"
                      className="object-cover object-center"
                      quality={80}
                    />
                  </figure>
                </ScrollReveal>
              </div>
            </div>

            {/* -------------------- AKT 07 · AVSLUT -------------------- */}
            <section id="kontakt" className="mx-auto mt-28 max-w-7xl scroll-mt-24 px-6 md:mt-36 md:px-10 md:scroll-mt-32">
              <ScrollReveal variant="ctaStack">
                <p className={CHAPTER_ON_DARK}>07</p>
                <h2 data-cta-heading className={`mt-10 max-w-3xl ${DISPLAY} text-white md:mt-14`}>
                  Book an introductory conversation
                </h2>
                <div className="mt-14 border-t border-white/20 pt-10 max-md:flex max-md:flex-col max-md:gap-8 md:mt-20 md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-10 md:pt-12">
                  <p
                    data-cta-body
                    className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 max-md:mt-6 md:col-span-5 md:col-start-7 md:mt-0"
                  >
                    Tell me briefly what you would like to talk about and choose a time. You do not need to
                    have everything formulated. The conversation is confidential.
                  </p>
                  <div
                    data-cta-actions
                    className="flex flex-col items-center pb-6 text-center md:col-span-5 md:col-start-7 md:items-start md:pb-0 md:text-left"
                  >
                    <CtaLink href="/en/kontakt" variant="secondary" translucent>{t.cta.primary}</CtaLink>
                  </div>
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </ParallaxController>
    </main>
  );
}
