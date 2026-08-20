import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import { ServicePricingSection } from "@/components/pricing-block";

export const metadata: Metadata = {
  title: "Ledningsgruppscoaching Göteborg | CVB Coaching",
  description:
    "För ledningsteam där prioriteringar glider och beslut tappar kraft mellan mötena. Vi arbetar med mandat, ansvar och beslutsmekanik – inte teambuilding.",
};

const patterns = [
  {
    title: "Prioriteringsglidning",
    body: "Prioriteringarna ändras oftare än organisationen hinner ställa om. Ingen enskild ändring är fel. Summan blir otydlig riktning.",
  },
  {
    title: "Mandatglapp",
    body: "Ansvaret är fördelat men mandatet är det inte. Frågor fastnar i gränssnitten mellan funktioner.",
  },
  {
    title: "Genomförandetapp",
    body: "Beslutet fattas i rummet men saknar ägare, tidpunkt och mått. Det återkommer på nästa agenda.",
  },
  {
    title: "Friktion utan adressat",
    body: "Motsättningar finns men benämns inte. De sänker tempot utan att någon kan peka på var.",
  },
];

const focusList = [
  "Ledningsgruppens beslutsmekanik: vad som avgörs här och vad som avgörs någon annanstans.",
  "Gemensam prioritering, och vad som aktivt väljs bort.",
  "Ansvar och mandat i gränssnitten mellan roller.",
  "Friktion som benämns och hanteras i stället för att bäras.",
  "Vägen från fattat beslut till genomförande i vardagen.",
];

const nonGoals = [
  "Inte teambuilding eller gruppövningar.",
  "Inte strategiarbete åt ledningen. Ni äger besluten.",
  "Inte en engångsinsats utan uppföljning.",
];

const outcomes = [
  "Kortare väg från diskussion till fattat beslut.",
  "Konsekvens mellan beslut, ansvar och uppföljning.",
  "Ledningen håller samman när trycket ökar.",
];

export default function LedningsgruppscoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Ledningsgruppscoaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Ledningsgruppen som beslutsrum, inte mötesforum.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För ledningsteam som behöver gemensamma prioriteringar, högre beslutskvalitet och beslut
              som överlever mötet.
            </p>
          </HeroReveal>
        </section>

        {/* Cards: patterns */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Fyra mönster som dränerar beslutskraft
          </h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-2">
            {patterns.map((item, index) => (
              <div data-card key={item.title} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                <p className="mt-2 font-medium text-zinc-900">{item.title}</p>
                <p className="mt-2 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* Cards: focus */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Vad vi arbetar med
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {focusList.map((item) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        {/* Two-col: how */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Så arbetar vi
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Arbetet utgår från ledningsgruppens verkliga beslutsfrågor, inte från övningar. Vi gör
                samtalet mer precist, prioriteringarna färre och ansvaret explicit.
              </p>
              <p>
                Mellan träffarna följs besluten upp så att riktningen syns i handling.
              </p>
              <p>
                Fokus ligger på mandat och ansvarssystem, inte på teambuilding eller workshopformat.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: non-goals */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad det inte är</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nonGoals.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* Cards: outcomes */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Förväntat utfall</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomes.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* Pricing */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Omfattning och investering
            </h2>
            <div data-col-right className="space-y-6 md:col-span-7">
              <ServicePricingSection
                locale="sv"
                lines={[
                  {
                    text: "Flera ledare i samma organisation, med separata coachingrelationer och ett gemensamt mål för ansvar och beslut. Omfattningen sätts efter gruppens storlek och uppdragets längd.",
                  },
                  { text: "Investering:", priceKey: "leadershipGroup" },
                ]}
              />
              <CtaLink href="/#uppdrag" variant="secondary">
                Så ser ett uppdrag ut →
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Beskriv kort var i beslutskedjan det skaver. Samtalet är konfidentiellt.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">
                Boka ett första samtal
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
