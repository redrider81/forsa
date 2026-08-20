import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import { ServicePricingSection } from "@/components/pricing-block";

export const metadata: Metadata = {
  title: "Individuell coaching för chefer | CVB Coaching",
  description:
    "Professionell coaching för chefer, specialister och nyckelpersoner som behöver klarhet i roll, prioritering och genomslag i sin kommunikation.",
};

const relevanceList = [
  "Du är ny i ledarroll och ansvaret är större än vad mandatet är uttalat.",
  "Rollen har vuxit och prioriteringarna går inte längre ihop.",
  "Din kommunikation når fram men får inte genomslag.",
  "Arbetsvardagen är komplex och kräver mer medvetna avvägningar.",
];

const focusList = [
  "Övergången till större ansvar.",
  "Rollens gränser i förhållande till andra roller.",
  "Prioritering och självledning under tryck.",
  "Genomslag i de samtal som avgör något.",
  "Överblick i en komplex arbetsvardag.",
];

const nonGoals = [
  "Inte terapi eller behandling av privata frågor.",
  "Inte allmän livsstilscoaching utan koppling till arbetet.",
  "Inte rådgivning där coachen tar över dina beslut.",
];

const valueList = [
  "Ett uttalat ansvar i den egna rollen.",
  "Bättre prioritering mellan konkurrerande krav.",
  "Mer precision i de samtal som avgör något.",
];

export default function IndividuellCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Individuell coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Klarhet i den egna rollen.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För chefer, specialister och nyckelpersoner som behöver ett uttalat ansvar, bättre
              prioritering och mer genomslag i sin kommunikation.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Detta är för chefer och nyckelpersoner under ledningsnivå. För vd, grundare och
              ledningsgruppsmedlemmar, se{" "}
              <Link href="/executive-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Executive coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* List */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Fyra lägen där coaching gör skillnad
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
                Samtalen är konfidentiella och utgår från din aktuella arbetssituation. Vi arbetar med
                frågor, reflektion och ansvar, och avslutar varje samtal med ett definierat nästa steg.
              </p>
              <p>
                Fokus ligger på din yrkesroll och ditt ledarskap, med uppföljning över tid.
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
            <div data-col-right className="md:col-span-7">
              <ServicePricingSection
                locale="sv"
                lines={[
                  { text: "Sex till åtta samtal över ett halvår, eller enstaka samtal vid behov." },
                  { text: "Uppdrag:", priceKey: "individual" },
                  { text: "Enstaka samtal:", priceKey: "single" },
                ]}
              />
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
              Beskriv kort vad som behöver klarna i din roll.
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
