import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import { coachingProcessParagraphsSv } from "@/lib/coaching-process";

export const metadata: Metadata = {
  title: "Coaching | CVB Coaching",
  description:
    "Så fungerar coaching hos CVB Coaching i Göteborg: när den kan vara rätt, vad arbetet består av och hur ett samarbete går till. Individuell coaching och företagscoaching.",
};

/**
 * Innehållet på den här sidan är godkänd CVB-copy som redan finns publikt på
 * startsidan, i tjänstekomponenterna och i kontaktsidans FAQ. Strängarna är
 * medvetet duplicerade i stället för importerade, eftersom startsidan efter
 * e8ea957 är låst och dess listor inte exporteras.
 */

const relevancePoints = [
  "Du står inför ett vägval och vill förstå vad som faktiskt är viktigt för dig.",
  "Du har fått ett nytt ansvar eller befinner dig i en förändring i arbetslivet eller livet i stort.",
  "Du vet att något behöver förändras, men ser ännu inte hur du vill gå vidare.",
  "Du behöver fatta ett beslut utan att ha alla svar ännu.",
  "Du vill ha ett samtal där du kan tänka fritt, utforska dina tankar och prata i förtroende.",
];

const passarNär = [
  "Frågan angår dig på riktigt, inte bara på pappret.",
  "Du vill tänka färdigt själv, inte få ett färdigt svar.",
  "Det behöver ske utanför den egna kretsen, i förtroende.",
  "Något ska förändras, inte bara diskuteras.",
];

const mindreRelevant = [
  "Du söker en expert som bedömer läget och talar om vad du ska göra.",
  "Om frågan främst handlar om ohälsa eller behandling är coaching inte rätt stöd. Då kan vård, terapi eller annan relevant professionell hjälp vara mer lämplig.",
  "Riktningen är redan bestämd och det som återstår är att verkställa.",
];

const workRows = [
  {
    index: "01",
    title: "Klarhet",
    body: "Få syn på vad som är viktigt för dig och förstå din situation tydligare.",
  },
  {
    index: "02",
    title: "Beslut",
    body: "Utforska olika möjligheter och komma närmare beslut som känns genomtänkta och förankrade i det som är viktigt för dig.",
  },
  {
    index: "03",
    title: "Riktning",
    body: "Hitta en väg framåt som känns relevant för dig och identifiera vilka steg du vill ta.",
  },
];

/** "När coaching är relevant — och när den inte är det" är dolt tills vidare på kundens begäran. */
const SHOW_COACHING_FIT = false;

const routes = [
  {
    index: "01",
    href: "/individuell-coaching",
    title: "Individuell coaching",
    description:
      "För dig som står inför ett vägval, en förändring eller ett beslut som du vill tänka färdigt.",
    ctaLabel: "Läs om individuell coaching",
  },
  {
    index: "02",
    href: "/business-coaching",
    title: "Företagscoaching",
    description:
      "För medarbetare och ledare med en fråga i arbetslivet – ett nytt ansvar, en utmanande relation eller ett beslut som påverkar andra.",
    ctaLabel: "Läs om företagscoaching",
  },
];

const practical: { title: string; body: string[] }[] = [
  {
    title: "I Göteborg eller digitalt",
    body: [
      "Jag erbjuder coaching på plats i Göteborg eller digitalt, beroende på vad som passar bäst.",
    ],
  },
  {
    title: "Samtalens längd",
    body: [
      "Vi avsätter vanligtvis 60 minuter per coachingsamtal. Det ger oss tid att utforska det som är viktigt för dig och avrunda med det du vill ta med dig vidare.",
    ],
  },
  {
    title: "Pris och upplägg",
    body: [
      "Varje coachingsamarbete utgår från dina behov och det du vill arbeta med. Kontakta mig gärna så pratar vi om vilket upplägg som passar dig och vad det kostar.",
    ],
  },
  {
    title: "Konfidentialitet och CVB Base",
    body: [
      "Innehållet i coachingsamtalen är konfidentiellt och delas inte med arbetsgivaren eller uppdragsgivaren utan klientens samtycke, annat än när lag kräver det. Eventuell administrativ återrapportering sker enligt vad som överenskommits i förväg.",
      "CVB Base är utformat med hänsyn till klientens och coachens integritet. Inloggning krävs för att använda plattformen.",
    ],
  },
  {
    title: "När företaget tar första kontakten",
    body: [
      "Ett företag kan ta initiativ till och finansiera coaching för en medarbetare eller ledare. Coachingen sker i en personlig och konfidentiell relation mellan mig och klienten.",
    ],
  },
];

const faqItems: ProcessFaqItem[] = [
  {
    question: "Vad är det första samtalet?",
    answer:
      "Ett kostnadsfritt telefonsamtal där vi pratar om din situation och vad du vill få ut av coachingen.",
  },
  {
    question: "Måste jag bestämma mig efter det första samtalet?",
    answer:
      "Nej. Du får möjlighet att ställa frågor och känna efter om coaching med mig känns rätt för dig.",
  },
  {
    question: "Hur många coachingsamtal brukar behövas?",
    answer:
      "Jag arbetar gärna med coaching över tid, eftersom det ger utrymme att utforska frågor på djupet, pröva nya perspektiv och följa det som utvecklas mellan samtalen. Jag rekommenderar vanligtvis minst sex samtal, gärna tio eller fler, beroende på dina behov och vad du vill arbeta med.",
  },
  {
    question: "Hur börjar coachingsamarbetet?",
    answer:
      "Vi kommer överens om ett övergripande mål och utforskar sedan det som känns viktigast för dig inför varje samtal.",
  },
  {
    question: "Vad är CVB Base?",
    answer:
      "Ett digitalt stöd där du kan förbereda samtal, samla reflektioner och följa dina tankar mellan våra möten.",
  },
  {
    question: "Hur arbetar du med företag?",
    answer:
      "Jag erbjuder coaching för medarbetare och ledare. Vi börjar med en dialog om behovet och uppdragets ramar. Det som sägs i coachingsamtalen förs inte vidare till uppdragsgivaren.",
  },
];

const chapterBase = "text-xs font-medium tabular-nums tracking-[0.32em]";
const chapterIndexOnLight = `${chapterBase} text-zinc-900`;
const chapterIndexOnDark = `${chapterBase} text-white`;
/** Etiketter på ljus yta — samma skala som hero, inte kapitelindex. */
const chapterLabelLight =
  "text-xs font-medium uppercase tracking-[0.16em] text-[#7d6435]";
const chapterDark = chapterIndexOnDark;

export default function CoachingPage() {
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
                Coaching hos CVB
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
                  Den här sidan beskriver när coaching kan vara relevant, hur arbetet går till och
                  vad du kan förvänta dig.
                </p>
                <div data-hero-cta className="md:col-span-2 md:col-start-11 md:justify-self-end md:self-end">
                  <Link
                    href="#vagar"
                    className="group inline-flex items-center gap-2 border-b border-zinc-400 pb-1 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4f3ef]"
                  >
                    Individuell coaching eller företagscoaching
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
                Vad kan coaching handla om?
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
            Vad kan coaching ge dig?
          </h2>
          <p data-section-intro className="mt-8 max-w-2xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:mt-10">
            Coaching kan ge dig utrymme att stanna upp, reflektera och se din situation ur nya
            perspektiv.
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
              Stöd mellan samtalen
            </h2>
          </div>
          <div
            data-col-right
            className="space-y-8 border-t border-white/60 pt-10 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-8 md:mt-40 md:pt-12"
          >
            <p data-col-paragraph>
              Samtalet står i centrum. CVB Base hjälper dig att behålla sammanhanget mellan samtalen.
            </p>
            <p data-col-paragraph>
              När det är relevant använder du CVB Base för att förbereda frågor, samla reflektioner
              och återvända till sådant du vill följa över tid. Det ger dig möjlighet att fånga upp
              tankar mellan våra möten och ta med det som känns viktigt till nästa samtal.
            </p>
            <p data-col-paragraph>
              CVB Base ersätter inte coachingen, utan är ett stöd för det arbete du gör även mellan
              samtalen.
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
                När coaching är relevant — och när den inte är det
              </h2>
            </div>
            <div data-col-right className="grid gap-14 md:col-span-7 md:col-start-6 md:grid-cols-2 md:gap-10 md:pt-24">
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
      </section>
      )}

      {/* ---------- 06 · Individuell eller företagscoaching ---------- */}
      <section id="vagar" className="scroll-mt-28 bg-white py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <p data-col-left className={`${chapterIndexOnLight} md:col-span-2`}>05</p>
            <div data-col-right className="md:col-span-8 md:col-start-5">
              <h2 className="font-serif text-[clamp(2.25rem,4.2vw,4rem)] font-medium text-balance leading-[1.18] tracking-[-0.035em] text-zinc-900">
                Individuell coaching eller företagscoaching
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
              Är du osäker på vilken form av coaching som passar din situation? Det kan vi prata om
              i det första samtalet.
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
              Praktisk information
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
              <ProcessFaq heading="Vanliga frågor" items={faqItems} variant="editorial" />
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
                Så går det till
              </h2>
            </div>
            <div
              data-col-right
              className="max-w-2xl space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-6 md:col-start-7"
            >
              {coachingProcessParagraphsSv.map((paragraph) => (
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
                Det första samtalet
              </h2>
            </div>
            <div
              data-col-right
              className="space-y-6 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-6 md:col-start-7"
            >
              <p>
                Introduktionssamtalet är kostnadsfritt. Det tar vanligtvis 15–30 minuter och är ett
                tillfälle att utforska om coaching känns rätt för dig.
              </p>
              <p>
                Vi pratar om din situation och vad du vill få ut av coachingen. Du får möjlighet att
                ställa frågor och berätta vad du funderar på — utan att förbinda dig till något.
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
            Boka ett inledande samtal
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p
              data-cta-body
              className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7"
            >
              Berätta kort vad du funderar på. Det första samtalet är kostnadsfritt och ger oss
              möjlighet att se om coaching med mig känns rätt för dig.
            </p>
            <div data-cta-actions className="md:col-span-5 md:col-start-7">
              <CtaLink href="/kontakt" variant="secondary" translucent>
                Boka ett inledande samtal
              </CtaLink>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Kort och kostnadsfritt första telefonsamtal.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
