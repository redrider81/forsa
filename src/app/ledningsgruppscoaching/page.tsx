import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Ledningsgruppscoaching | Forsa",
  description:
    "Forsa arbetar med ledningsgrupper som behöver tydligare prioriteringar, bättre beslutskvalitet och beslut som håller i genomförandet.",
};

const relevanceList = [
  "Prioriteringar förändras ofta och skapar osäker riktning.",
  "Viktiga beslut tas men tappar kraft mellan möten.",
  "Ansvar är otydligt i gränssnitten mellan roller.",
  "Friktion i ledningsgruppen bromsar tempo och kvalitet.",
];

const focusList = [
  "Ledningsgruppen som beslutsrum.",
  "Gemensam riktning och prioritering.",
  "Ansvar, mandat och roller mellan funktioner.",
  "Friktion och samspel i ledningen.",
  "Från möte till genomförande i vardagen.",
];

const outcomes = [
  "Kortare väg från diskussion till tydligt beslut.",
  "Större konsekvens mellan beslut, ansvar och uppföljning.",
  "Ökad samling i ledningen när trycket ökar.",
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
              När ledningsgruppen behöver bli ett tydligare beslutsrum.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För ledningsteam som behöver tydligare gemensamma prioriteringar, högre beslutskvalitet
              och bättre genomförande från möte till vardag.
            </p>
          </HeroReveal>
        </section>

        {/* Two-col */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Varför beslutskraften tappar tydlighet
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Kompetensen är ofta hög, men tryck, tempo och många beroenden gör att fokus glider.
                Frågor diskuteras, men beslutsmekaniken blir inte tillräckligt tydlig.
              </p>
              <p>
                Resultatet blir oklara prioriteringar, otydligt ansvar mellan roller och svagare
                genomförande mellan möten.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            När ledningsgruppens beslutsarbete behöver skärpas
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
              Vad Forsa arbetar med
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
              Hur arbetet sker
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Arbetet utgår från ledningsgruppens aktuella läge och verkliga beslutsfrågor. Vi gör
                samtalet mer precist, prioriteringar tydligare och ansvar mer konkret.
              </p>
              <p>
                Mellan träffarna följs beslut upp så att riktningen syns i handling, inte bara i
                protokoll.
              </p>
              <p>
                Fokus ligger på ledningens mandat och ansvarssystem, inte på teambuilding eller workshopformat.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Cards: outcomes */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Typiska resultat</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomes.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              När ledningen behöver tydligare riktning i praktiken
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Börja med ett konfidentiellt samtal om var er ledningsgrupp behöver mest skärpa.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">Boka ett första samtal</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
