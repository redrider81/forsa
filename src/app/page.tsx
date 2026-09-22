import type { Metadata } from "next";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import KineticTeamHybrid from "@/components/ui/kinetic-team-hybrid";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "CVB Coaching – individuell coaching och business coaching i Göteborg",
  description:
    "CVB Coaching i Göteborg. Individuell coaching för dig som står inför ett vägval, och business coaching för medarbetare och ledare i arbetslivet.",
};

const t = svDictionary;

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

const DISPLAY =
  "font-serif text-[clamp(2.75rem,5.6vw,5.25rem)] font-medium leading-[1.12] tracking-[-0.04em]";
const DISPLAY_SM =
  "font-serif text-[clamp(2.125rem,4.2vw,3.5rem)] font-medium leading-[1.18] tracking-[-0.035em]";
const SUB =
  "font-serif text-[clamp(2.375rem,4.6vw,4.5rem)] font-medium leading-[1.14] tracking-[-0.035em]";
const CHAPTER = "text-xs font-medium tabular-nums tracking-[0.32em]";
const CHAPTER_ON_LIGHT = `${CHAPTER} text-zinc-900`;
const CHAPTER_ON_DARK = `${CHAPTER} text-white`;

const relevancePoints = [
  "Du står inför ett vägval och behöver förstå vad som faktiskt är viktigt för dig.",
  "Du har fått ett nytt ansvar eller befinner dig i en förändring i arbetslivet.",
  "Du vet att något behöver förändras, men ser ännu inte hur du vill gå vidare.",
  "Du behöver fatta ett beslut utan att ha alla svar ännu.",
  "Du vill prata fritt, i förtroende och utanför din egen krets.",
];

const passarNär = [
  "Frågan angår dig på riktigt, inte bara på pappret.",
  "Du vill tänka färdigt själv, inte få ett färdigt svar.",
  "Det behöver ske utanför den egna kretsen, i förtroende.",
  "Något ska förändras, inte bara diskuteras.",
];

const mindreRelevant = [
  "Du söker en expert som bedömer läget och talar om vad du ska göra.",
  "Frågan handlar om ohälsa eller behöver behandlas. Då är terapi rätt väg, inte coaching.",
  "Riktningen är redan bestämd och det som återstår är att verkställa.",
];

const workRows = [
  {
    index: "01",
    title: "Klarhet",
    body: "Jag lyssnar och ställer frågor som hjälper dig att sortera vad frågan faktiskt handlar om och vad som är viktigast för dig.",
  },
  {
    index: "02",
    title: "Beslut",
    body: "Jag hjälper dig att pröva dina alternativ och de antaganden de vilar på, så att du ser vad du väljer, vad du väljer bort och varför.",
  },
  {
    index: "03",
    title: "Riktning",
    body: "Du omsätter det du kommit fram till i nästa steg som fungerar i din vardag.",
  },
];

const firstCallValueRows = [
  {
    index: "01",
    title: "Klarare fråga",
    body: "Vi sätter ord på det du står i och vad du behöver bli klarare i.",
  },
  {
    index: "02",
    title: "Rätt stöd",
    body: "Vi skiljer coaching från sådant som bättre löses med rådgivning, terapi eller en annan insats.",
  },
  {
    index: "03",
    title: "Nästa steg",
    body: "Du går därifrån med en tydligare bild av vad som skulle hjälpa dig vidare — oavsett om vi fortsätter eller inte.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      <ParallaxController>
        {/* ======================= AKT 00 · HERO ======================= */}
        <section
          data-hero-sticky
          className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
        >
          <HeroVideoBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" aria-hidden="true" />
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
                    Det finns frågor man inte tänker färdigt ensam.
                  </h1>
                </div>
                <p
                  data-hero-body
                  className="mt-6 max-w-[34ch] text-[1.0625rem] font-[450] leading-[1.6] text-balance text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] md:mt-7 md:max-w-[46ch] md:text-lg"
                >
                  Professionell coaching med Carolina von Braun för dig som står inför ett vägval,
                  en förändring eller en fråga där nästa steg ännu inte är självklart.
                </p>
                <div className="mt-9 flex w-full flex-row flex-wrap items-center justify-center gap-3 sm:gap-3.5 md:mt-10 md:relative md:left-1/2 md:w-screen md:max-w-[100vw] md:-translate-x-1/2">
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/kontakt" variant="primary" translucent>
                      Boka ett inledande samtal
                    </CtaLink>
                  </span>
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/#coaching" variant="secondary" translucent>
                      {t.cta.secondary}
                    </CtaLink>
                  </span>
                </div>
              </HeroReveal>
            </div>
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
                    Individuell coaching eller företags coaching
                  </h2>
                </div>
              </ScrollReveal>

              <div className="mt-14 md:mt-16">
                <CoachingServicesGrid locale="sv" dense variant="editorial" />
              </div>

              {/* Rörelse 2 — när coaching kan vara rätt · dokumentär bild + lista */}
              <ScrollReveal
                variant="splitColumn"
                className="mt-32 grid gap-10 md:mt-48 md:grid-cols-12 md:items-start md:gap-x-8"
              >
                <div data-col-left className="md:col-span-5">
                  <h2 className={`max-w-[11ch] ${DISPLAY} text-zinc-900`}>
                    När coaching kan vara rätt
                  </h2>
                  <figure className="relative mt-10 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.25rem] sm:max-w-md md:mt-12 md:max-w-lg md:rounded-[1.75rem] lg:max-w-xl lg:rounded-[2rem]">
                    <Image
                      src="/carolina-02.jpg"
                      alt="Carolina von Braun i samtal vid ett mötesbord."
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
                  När coaching är relevant — och när den inte är det
                </h2>
                <div data-col-right className="grid gap-14 md:col-span-6 md:col-start-7 md:grid-cols-2 md:gap-10">
                  <ScrollReveal variant="staggerList">
                    <h3 className="text-lg font-medium leading-[1.35] text-zinc-900">Coaching kan vara relevant när</h3>
                    <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-700">
                      {passarNär.map((item) => (
                        <li key={item} data-list-item className="border-t border-zinc-300 pt-5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                  <ScrollReveal variant="staggerList">
                    <h3 className="text-lg font-medium leading-[1.35] text-zinc-900">Coaching är inte rätt stöd när</h3>
                    <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-600">
                      {mindreRelevant.map((item) => (
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
                  className={`mt-10 max-w-3xl ${DISPLAY} text-zinc-900 md:mt-14`}
                >
                  Vad arbetet består av
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
          <KineticTeamHybrid />

          {/* ============ YTA 4 · ljus · akt 04 · processen ============
              Stegen och det som släpper kravet på att veta allt i förväg är
              en och samma rörelse: så går det till, och så mycket behöver du
              inte ha klart för dig innan. Ingen ytväxling emellan. */}
          <div data-parallax-section className="pt-24 pb-28 md:pt-32 md:pb-40 lg:pt-40">
            <EngagementSection locale="sv" variant="field" />

            <section className="mt-24 md:mt-32">
              <EditorialRowsReveal className="mx-auto max-w-7xl px-6 md:px-10">
                <p className={CHAPTER_ON_LIGHT}>DET FÖRSTA SAMTALET</p>
                <h2
                  data-section-heading
                  className={`mt-8 max-w-3xl ${DISPLAY} text-zinc-900 md:mt-10`}
                >
                  Det första samtalet ska ge dig något
                </h2>
                <p className="mt-8 max-w-2xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-10">
                  Du behöver inte ha bestämt dig för coaching. Det första samtalet är ett tillfälle att
                  förstå frågan bättre, pröva om coaching är rätt stöd och känna efter om vi fungerar bra
                  tillsammans.
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
                Du behöver inte veta allt från början
              </h2>
              <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-4">
                <p
                  data-col-paragraph
                  className="max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600"
                >
                  Du behöver inte veta i förväg hur många samtal som behövs eller ha formulerat
                  frågan helt. Det klarnar i det första samtalet.
                </p>
                <div data-col-paragraph className="mt-10">
                  <CtaLink href="/kontakt" variant="primary">Boka ett inledande samtal</CtaLink>
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
            className="relative overflow-hidden bg-surface-dark pt-28 pb-24 text-zinc-100 md:pt-44 md:pb-32"
          >
            {/* -------------------- AKT 05 · KONTINUITET -------------------- */}
            <section className="mx-auto max-w-7xl px-6 md:px-10">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
                <div data-col-left className="md:col-span-7">
                  <p className={CHAPTER_ON_DARK}>06</p>
                  <h2 className={`mt-10 max-w-3xl ${DISPLAY} text-white md:mt-14`}>
                    Samtalet står i centrum. CVB Base behåller sammanhanget mellan samtalen.
                  </h2>
                </div>
                <div
                  data-col-right
                  className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-8 md:mt-14"
                >
                  <p data-col-paragraph className="max-w-xl">
                    När det är relevant använder du CVB Base för att förbereda frågor, samla
                    reflektioner och återvända till sådant du vill följa över tid. Det ersätter inte
                    coachingen, utan ger dig en plats för det som händer mellan samtalen.
                  </p>
                  <figure className="relative mt-10 aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[1.25rem] md:mt-12 md:rounded-[1.75rem] lg:rounded-[2rem]">
                    <Image
                      src="/cvb-base-ipad.jpg"
                      alt="Person som håller en surfplatta — CVB Base mellan samtalen."
                      fill
                      sizes="(min-width: 768px) 36vw, 94vw"
                      className="object-cover object-center"
                      quality={80}
                    />
                  </figure>
                </div>
              </ScrollReveal>
            </section>

            <div className="relative left-1/2 mt-16 w-screen max-w-[100vw] -translate-x-1/2 bg-[#f2f1ed] py-16 text-zinc-900 md:mt-20 md:py-20 lg:py-24">
              <div className="mx-auto max-w-7xl px-6 md:px-10">
                <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:items-stretch md:gap-x-8 lg:gap-x-10">
                  <div data-col-left className="md:col-span-6 lg:col-span-5">
                    <div className="space-y-8 md:space-y-10">
                      <h2 className={`max-w-md ${DISPLAY_SM} text-zinc-900`}>
                        När företaget tar första kontakten
                      </h2>
                      <h2 className={`max-w-md ${DISPLAY_SM} text-zinc-900`}>
                        I Göteborg eller digitalt
                      </h2>
                    </div>
                    <div className="mt-10 space-y-8 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-12 md:space-y-7">
                      <div className="space-y-6">
                        <p data-col-paragraph className="max-w-xl">
                          CVB Coaching arbetar med enskilda medarbetare och ledare i arbetslivet. Företaget
                          kan ta den första kontakten och finansiera coachingen.
                        </p>
                        <p data-col-paragraph className="max-w-xl">
                          Därefter sker coachingen i en personlig och konfidentiell relation mellan Carolina
                          och klienten. I den första dialogen pratar jag med företaget om behovet, ramarna
                          för samarbetet och hur kontakten fungerar.
                        </p>
                      </div>
                      <div className="space-y-6 border-t border-zinc-300 pt-8 md:pt-7">
                        <p data-col-paragraph className="max-w-xl">
                          CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, beroende på
                          vad som passar bäst.
                        </p>
                        <p data-col-paragraph className="max-w-xl">
                          Vad som sägs i samtalet stannar i samtalet.
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
                      alt="Göteborgs hamn vid solnedgång — segelfartyg och silhuett av staden."
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
                  Boka ett inledande samtal
                </h2>
                <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
                  <p data-cta-body className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7">
                    Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
                    Samtalet är konfidentiellt.
                  </p>
                  <div data-cta-actions className="md:col-span-5 md:col-start-7">
                    <CtaLink href="/kontakt" variant="secondary" translucent>Boka ett inledande samtal</CtaLink>
                    <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                      Personlig coaching · Konfidentiella samtal · Göteborg eller digitalt
                    </p>
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
