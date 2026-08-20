import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import { ServicePricingSection } from "@/components/pricing-block";

export const metadata: Metadata = {
  title: "Coachande ledarskap – ledarprogram | CVB Coaching",
  description:
    "Programformat för organisationer som vill stärka chefers förmåga att leda genom frågor, feedback och ansvar. Fem tillfällen över ett halvår.",
};

const relevanceList = [
  "Kvaliteten i vardagens ledarsamtal varierar för mycket mellan chefer.",
  "Organisationen vill utveckla ansvar utan att öka detaljstyrningen.",
  "Feedback och utvecklingssamtal ger inte det de ska ge.",
  "Lärandet stannar hos individer i stället för i verksamheten.",
];

const programFormatList = [
  "Grupper om sex till tio chefer.",
  "Fem tillfällen à tre timmar över ett halvår.",
  "Träning i coachande samtal mellan tillfällena, tillämpad i den egna gruppen.",
  "Individuell avstämning per deltagare vid halvtid.",
  "Avslutande utvärdering mot de mål som sattes vid start, återrapporterad till uppdragsgivaren.",
];

const focusList = [
  "Det coachande samtalet som chefsverktyg.",
  "Frågor och lyssnande i stället för instruktioner.",
  "Feedback och utvecklingssamtal som ger effekt.",
  "Ansvar utan detaljstyrning.",
  "Samtal som skapar lärande i verksamheten.",
];

const valueList = [
  "Jämnare kvalitet i samtalen mellan chef och medarbetare.",
  "Starkare ansvarstagande i team och verksamhet.",
  "Lärande som stannar i organisationen.",
];

export default function CoachandeLedarskapPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Coachande ledarskap
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Ledarskap som fungerar genom samtal.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Programformat för organisationer som vill stärka chefers förmåga att leda genom frågor,
              lyssnande, feedback och ansvar.
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: why */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Varför coachande ledarskap
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Chefer som leder genom samtal får ansvarstagande utan detaljstyrning. Uppdrag blir
                uttalade, återkoppling ges i tid och lärandet stannar i organisationen i stället för
                hos enskilda individer.
              </p>
              <p>
                Effekten syns först i kvaliteten på vardagens ledarsamtal, därefter i hur snabbt problem
                kommer upp till ytan.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Fyra lägen där programmet är relevant
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {relevanceList.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* Two-col: program format */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Programformat
            </h2>
            <ScrollReveal variant="staggerList" data-col-right className="md:col-span-7">
              <ul className="space-y-3 text-zinc-700">
                {programFormatList.map((item) => (
                  <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </ScrollReveal>
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

        {/* Cards: value */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Förväntat utfall</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item, index) => (
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
                    text: "Programmet offereras per uppdrag efter en genomgång av målgrupp, gruppstorlek och önskad omfattning. Från",
                    priceKey: "program",
                  },
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
              Beskriv kort målgrupp, antal chefer och vad programmet ska åstadkomma.
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
