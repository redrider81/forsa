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
    "Så fungerar coaching hos CVB Coaching i Göteborg: när den kan vara rätt, vad arbetet består av och hur ett samarbete går till. Individuell coaching och business coaching.",
};

/**
 * Innehållet på den här sidan är godkänd CVB-copy som redan finns publikt på
 * startsidan, i tjänstekomponenterna och i kontaktsidans FAQ. Strängarna är
 * medvetet duplicerade i stället för importerade, eftersom startsidan efter
 * e8ea957 är låst och dess listor inte exporteras.
 */

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

const processSteps = [
  {
    index: "01",
    title: "Första samtalet",
    body: "Konfidentiellt. Du berättar om din situation, och tillsammans ser vi om coaching är rätt stöd och om vi fungerar bra ihop.",
  },
  {
    index: "02",
    title: "Vad du vill bli klarare i",
    body: "Jag hjälper dig att sätta ord på vad du vill bli klarare i och vad du vill kunna göra annorlunda.",
  },
  {
    index: "03",
    title: "Samtalen",
    body: "Du och jag bestämmer rytmen tillsammans. Varje samtal avslutas med något du tar med dig vidare.",
  },
  {
    index: "04",
    title: "Avslut",
    body: "Du och jag stämmer av mot det du ville uppnå och ser tillsammans om arbetet är klart eller ska fortsätta.",
  },
];

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
    title: "Business coaching",
    description:
      "För medarbetare och ledare med en fråga i arbetslivet — ett nytt ansvar, en svår relation eller ett beslut som påverkar andra.",
    ctaLabel: "Läs om business coaching",
  },
];

const practical = [
  {
    title: "I Göteborg eller digitalt",
    body: "CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, beroende på vad som passar bäst.",
  },
  {
    title: "Konfidentiellt",
    body: "Vad som sägs i samtalet stannar i samtalet.",
  },
  {
    title: "När företaget tar första kontakten",
    body: "CVB Coaching arbetar med enskilda medarbetare och ledare i arbetslivet. Företaget kan ta den första kontakten och finansiera coachingen. Därefter sker coachingen i en personlig och konfidentiell relation mellan Carolina och klienten.",
  },
];

const faqItems: ProcessFaqItem[] = [
  {
    question: "Vad är det första samtalet?",
    answer:
      "Det första samtalet är ett kort och kostnadsfritt telefonsamtal. Du berättar lite om vad du söker, och vi känner efter om coaching är rätt väg och om det känns rätt att arbeta tillsammans. Det är inte en coachingsession och du förbinder dig inte till något.",
  },
  {
    question: "Måste jag bestämma mig efter det första samtalet?",
    answer:
      "Nej. Det första samtalet är till för att vi båda ska kunna känna efter om det här är rätt. Vi går bara vidare om det känns bra och relevant för oss båda.",
  },
  {
    question: "Hur börjar coachingsamarbetet?",
    answer:
      "När vi har kommit överens om hur vi vill arbeta tillsammans får du en personlig bekräftelse från mig och vi planerar vårt första coachingsamtal. Du får också tillgång till CVB Base, där vi samlar det som hör till vårt arbete tillsammans.",
  },
  {
    question: "Vad är CVB Base?",
    answer:
      "CVB Base är en del av hur jag arbetar med mina klienter. Där kan du samla reflektioner, förbereda sådant du vill ta med till nästa samtal och återvända till sådant vi tidigare har arbetat med. På så sätt finns sammanhanget kvar även mellan våra samtal.",
  },
  {
    question: "Hur arbetar du med företag?",
    answer:
      "Jag arbetar med företag genom individuella coachingsamarbeten med personer i verksamheten. Det kan börja med en person och vid behov utökas med fler. Varje samarbete är separat, och innan vi börjar är vi tydliga med vem som betalar och vad som, om något, ska återkopplas till beställaren.",
  },
];

/**
 * Kapitelmetadata. Guldet på ljus yta är en mörkare variant av #967844:
 * varumärkesguldet ger 3,73:1 mot #f4f3ef, vilket underkänns av WCAG AA för
 * text i 12 px. Den här nyansen ger 5,07:1 och ligger kvar i samma familj.
 */
const chapterLight = "text-xs font-medium tabular-nums tracking-[0.32em] text-[#7d6435]";
const chapterDark = "text-xs font-medium tabular-nums tracking-[0.32em] text-[#b89a60]";

export default function CoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      {/* ---------- 00 · Hero — gles, hög, asymmetrisk ---------- */}
      <section className="flex min-h-[92svh] flex-col justify-between px-6 pb-20 pt-36 md:min-h-[112svh] md:px-10 md:pb-24 md:pt-52 lg:min-h-[118svh]">
        <div className="mx-auto w-full max-w-7xl">
          <HeroReveal>
            <div className="grid md:grid-cols-12 md:gap-x-8">
              <div className="md:col-span-2">
                <div data-hero-line className="mb-8 h-px w-12 origin-left bg-[#7d6435]" />
                <p data-hero-label className={chapterLight}>
                  Coaching
                </p>
              </div>
              <h1
                data-hero-headline
                className="mt-14 max-w-[15ch] font-serif text-[clamp(3rem,9vw,10rem)] font-medium leading-[0.88] tracking-[-0.055em] text-zinc-900 md:col-span-10 md:mt-0"
              >
                Vad coaching innebär hos CVB.
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
                Den här sidan beskriver när coaching kan vara relevant, hur arbetet går till och
                vad du kan förvänta dig.
              </p>
              <div data-hero-cta className="md:col-span-2 md:col-start-11 md:justify-self-end">
                <Link
                  href="#vagar"
                  className="group inline-flex items-center gap-2 border-b border-zinc-400 pb-1 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4f3ef]"
                >
                  Individuell eller business coaching
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
              <p className={chapterLight}>01</p>
              <h2 className="mt-10 max-w-md font-serif text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em] text-zinc-900 md:mt-16">
                När coaching kan vara rätt
              </h2>
            </div>
            <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-28 lg:pt-40">
              <ScrollReveal variant="staggerList">
                <ul className="divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {relevancePoints.map((point) => (
                    <li key={point} data-list-item className="grid grid-cols-[1rem_1fr] gap-5 py-6 md:py-7">
                      <span className="mt-[0.72rem] h-1 w-1 bg-[#967844]" aria-hidden />
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
          <p className={chapterLight}>02</p>
          <h2
            data-section-heading
            className="mt-10 max-w-3xl font-serif text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.96] tracking-[-0.04em] text-zinc-900 md:mt-16"
          >
            Vad arbetet består av
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
                      className="text-2xl font-medium leading-tight tracking-tight text-zinc-900 md:col-span-4 md:col-start-2 md:text-3xl"
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
            <p data-col-left className={`${chapterLight} md:col-span-2`}>03</p>
            <div data-col-right className="md:col-span-8 md:col-start-5">
              <h2 className="max-w-4xl font-serif text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.94] tracking-[-0.045em] text-zinc-900">
                Så går det till
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
                        className="text-xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:col-span-4 md:col-start-2 md:text-2xl"
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
            <p className="ml-auto mt-10 max-w-xl border-l border-[#967844]/60 pl-6 text-[0.98rem] font-[450] leading-[1.7] text-zinc-600 md:mt-14 md:pl-8 md:text-[1.02rem]">
              Upplägget följer frågan och vad du vill få ut av samtalen.
            </p>
          </EditorialRowsReveal>
        </div>
      </section>

      {/* ---------- 04 · CVB Base (mörk scen) ---------- */}
      <section className="bg-zinc-950 py-28 text-zinc-100 md:py-40 lg:py-48">
        <ScrollReveal
          variant="splitColumn"
          className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-12 md:gap-x-8 md:px-10"
        >
          <div data-col-left className="md:col-span-7">
            <p className={chapterDark}>04</p>
            <h2 className="mt-12 max-w-3xl font-serif text-[clamp(3rem,4.4vw,4.75rem)] font-medium text-balance leading-[0.98] tracking-[-0.04em] text-white md:mt-16">
              Samtalet står i centrum. CVB Base hjälper dig att behålla sammanhanget mellan
              samtalen.
            </h2>
          </div>
          <div
            data-col-right
            className="space-y-8 border-t border-[#967844]/60 pt-10 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-8 md:mt-40 md:pt-12"
          >
            <p data-col-paragraph>
              När det är relevant använder du CVB Base för att förbereda frågor, samla reflektioner
              och återvända till sådant du vill följa över tid. Det ersätter inte coachingen, utan
              ger dig en plats för det som händer mellan samtalen.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ---------- 05 · När coaching är relevant — tätast ---------- */}
      <section className="bg-[#f4f3ef] pb-16 pt-20 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div data-col-left className="md:col-span-5">
              <p className={chapterLight}>05</p>
              <h2 className="mt-10 max-w-md font-serif text-[clamp(2.25rem,4vw,4rem)] font-medium leading-[1] tracking-[-0.035em] text-zinc-900 md:mt-16">
                När coaching är relevant — och när den inte är det
              </h2>
            </div>
            <div data-col-right className="grid gap-14 md:col-span-7 md:col-start-6 md:grid-cols-2 md:gap-10 md:pt-24">
              <ScrollReveal variant="staggerList">
                <h3 className="text-lg font-medium text-zinc-900">Coaching kan vara relevant när</h3>
                <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-700">
                  {passarNär.map((item) => (
                    <li key={item} data-list-item className="border-t border-zinc-300 pt-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
              <ScrollReveal variant="staggerList">
                <h3 className="text-lg font-medium text-zinc-900">Coaching är inte rätt stöd när</h3>
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

      {/* ---------- Paus · Statement ----------
          Frasen stod tidigare två gånger på sidan (hero och rubriken nedan).
          Den är flyttad hit som en egen paus i stället för att upprepas. */}
      <section className="flex min-h-[72svh] items-center bg-[#f4f3ef] pb-28 pt-12 md:min-h-[86svh] md:pb-40">
        <ScrollReveal variant="fadeUp" className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <p className="max-w-[20ch] font-serif text-[clamp(2.25rem,5.5vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-zinc-900 md:ml-[16.666%]">
            Individuell coaching och business coaching utgår från samma arbetssätt.
          </p>
        </ScrollReveal>
      </section>

      {/* ---------- 06 · Individuell eller business coaching ---------- */}
      <section id="vagar" className="scroll-mt-28 bg-white py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <p data-col-left className={`${chapterLight} md:col-span-2`}>06</p>
            <div data-col-right className="md:col-span-8 md:col-start-5">
              <h2 className="font-serif text-[clamp(2.25rem,4.2vw,4rem)] font-medium text-balance leading-[1] tracking-[-0.035em] text-zinc-900">
                Individuell coaching eller business coaching
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
                          className="block font-serif text-[2rem] font-medium leading-[1.05] tracking-[-0.03em] text-zinc-900 transition-colors duration-300 group-hover:text-[#7d6435] md:text-[2.75rem]"
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
            <p className="ml-auto mt-16 max-w-xl border-l border-[#967844]/60 pl-6 text-[0.9375rem] leading-[1.7] text-zinc-600 md:pl-8">
              Är du osäker på vilken form av coaching som är relevant för din fråga? Det klargör vi
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
            <p className={chapterLight}>07</p>
            <h2 className={chapterLight}>Praktiskt</h2>
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
                    className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-zinc-900 md:col-span-5"
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
            <p className={`${chapterLight} md:col-span-2`}>08</p>
            <div className="md:col-span-9 md:col-start-4">
              <ProcessFaq heading="Vanliga frågor" items={faqItems} variant="editorial" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- 09 · Avslut ---------- */}
      <section className="bg-zinc-950 py-24 text-zinc-100 md:py-32 lg:py-40">
        <ScrollReveal variant="ctaStack" className="mx-auto max-w-7xl px-6 md:px-10">
          <h2
            data-cta-heading
            className="max-w-5xl font-serif text-[clamp(3rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.05em] text-white"
          >
            Boka ett inledande samtal
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p
              data-cta-body
              className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7"
            >
              Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
              Samtalet är konfidentiellt.
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
