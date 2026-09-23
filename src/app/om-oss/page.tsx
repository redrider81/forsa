import type { Metadata } from "next";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach i Göteborg | CVB Coaching",
  description:
    "Carolina von Braun driver CVB Coaching i Göteborg. Kommersiell bakgrund från kapitalmarknad och styrelsearbete, diplomerad coach vid Gothia Akademi.",
};

const t = svDictionary;

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
const BODY_STACK = `space-y-7 ${BODY}`;
const SECTION_STACK = "mt-32 md:mt-48";
const SECTION_GRID = "grid gap-14 md:grid-cols-12 md:gap-x-8 md:gap-y-16";

const principles = [
  "Konfidentialitet.",
  "Frågor före råd. Du äger dina slutsatser.",
  "Precision framför uppmuntran.",
  "Uppföljning tills något faktiskt har hänt.",
];

const audiences = [
  "Privatpersoner som står inför ett vägval, en förändring eller ett beslut som väger.",
  "Medarbetare och ledare som behöver tänka klart med någon utanför den egna arbetsplatsen.",
  "Personer som vill sortera ansvar, prioriteringar eller beslut i en arbetsrelaterad situation.",
];

export default function AboutPage() {
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
              Personen du ska ha samtalen med.
            </h1>
            <p
              data-hero-body
              className={`mt-16 max-w-xl text-left md:mt-24 ${BODY}`}
            >
              Att välja coach är att välja vem man tänker högt inför. Här är vad du behöver veta om
              mig för att avgöra om det ska vara jag.
            </p>
          </HeroReveal>
        </div>
      </section>

      {/* Ljus yta */}
      <div className="pb-32 md:pb-52">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Varför CVB Coaching finns
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                De flesta har människor omkring sig som vill väl. Färre har någon vars enda
                uppgift är att hjälpa dig att tänka färdigt, utan att ha en åsikt om utgången.
              </p>
              <p>
                Jag erbjuder den platsen — för dig som kommer på egen hand och för dig som kommer
                genom ditt arbete.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={`${SECTION_GRID} md:items-stretch`}>
            <div data-col-left className="md:col-span-5">
              <p className={LABEL}>Coach</p>
              <h2 className={`mt-6 ${DISPLAY_SM} text-zinc-900`}>Carolina von Braun</h2>
            </div>
            <figure className="relative mt-10 aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.25rem] md:col-span-5 md:row-start-2 md:mt-12 md:aspect-auto md:h-full md:min-h-[20rem] md:rounded-[1.75rem]">
              <Image
                src="/carolina-om-oss.jpg"
                alt="Carolina von Braun, coach och grundare av CVB Coaching."
                fill
                sizes="(min-width: 768px) 20rem, 94vw"
                className="object-cover object-[center_22%]"
                quality={80}
              />
            </figure>
            <div
              data-col-right
              className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:row-start-2 md:mt-12 md:flex md:min-h-0 md:flex-col md:justify-between md:space-y-0 md:gap-8 lg:gap-10`}
            >
              <p>
                Jag heter Carolina von Braun och driver CVB Coaching i Göteborg. Jag är diplomerad coach
                vid Gothia Akademi och har genomgått ICF-ackrediterad coachutbildning på Level 1 och Level
                2.
              </p>
              <p>
                Min yrkesbakgrund omfattar värdepappershandel på Nordea, styrelseuppdrag inom
                fastighetsförvaltning och investeringar samt studier i marknadsföring vid
                Handelshögskolan vid Göteborgs universitet. Den erfarenheten tar jag med mig som
                bakgrund och förståelse — inte som ett facit för dina beslut.
              </p>
              <p>
                I coachingen är rollerna tydliga: du äger dina mål, insikter och beslut. Min
                uppgift är att skapa skärpa i tänkandet, pröva perspektiv och föra samtalet framåt
                utan att ta över dina slutsatser.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-sm ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Principer
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
              Konfidentialitet
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>Vad som sägs i samtalet behandlas konfidentiellt.</p>
              <p>
                När samtalen beställs av någon annan än klienten kommer vi överens om vad som
                återkopplas, innan arbetet börjar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Vilka jag arbetar med
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
              Göteborg, eller digitalt när det passar bättre
            </h2>
            <div data-col-right className={`md:col-span-6 md:col-start-7 md:pt-4 ${BODY}`}>
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, och var du
                befinner dig avgör inte om det fungerar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Det första samtalet är till för att känna efter.
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                Du behöver inte ha formulerat frågan färdigt. I ett kort och kostnadsfritt första
                telefonsamtal får du berätta var du befinner dig, förstå om coaching är rätt stöd och
                känna efter om Carolina är rätt person att prata med.
              </p>
              <p className="text-[0.875rem] leading-[1.6] text-zinc-500">
                Det är inte en coachingsession och innebär inget åtagande.
              </p>
              <div>
                <CtaLink href="/kontakt" variant="primary">
                  Boka ett inledande samtal
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
            Boka ett inledande samtal
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p data-cta-body className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7">
              Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
              Samtalet är konfidentiellt.
            </p>
            <div data-cta-actions className="md:col-span-5 md:col-start-7">
              <CtaLink href="/kontakt" variant="secondary" translucent>
                {t.cta.primary}
              </CtaLink>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Kort och kostnadsfritt. Inte en coachingsession. Inget åtagande.
              </p>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Personlig coaching · Konfidentiella samtal · Göteborg eller digitalt
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
