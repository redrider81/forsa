import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Team coaching | Forsa",
  description:
    "Team coaching för team, projektgrupper och specialistgrupper som behöver starkare samspel, ansvar och gemensamt lärande i arbetet.",
};

const relevanceList = [
  "Teamet har höga krav men otydligt gemensamt arbetssätt.",
  "Ansvar faller mellan stolar i vardagens samarbete.",
  "Kommunikation och feedback fungerar ojämnt.",
  "Gruppen behöver gå från individer till fungerande team.",
];

const focusList = [
  "Teamets gemensamma syfte i det dagliga arbetet.",
  "Samspel och ansvar i uppgifter och leveranser.",
  "Kommunikation och feedback i teamet.",
  "Psykologisk trygghet i arbetet.",
  "Från grupp till fungerande team.",
];

const valueList = [
  "Tydligare ansvar i teamets samarbete.",
  "Bättre kommunikation i det gemensamma arbetet.",
  "Starkare lärande i hur teamet arbetar tillsammans.",
];

export default function TeamCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Team coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Team coaching för starkare samspel och gemensamt ansvar.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För team, projektgrupper och specialistgrupper som behöver utveckla sitt samarbete,
              ansvarstagande och lärande i arbetet.
            </p>
          </HeroReveal>
        </section>

        {/* List */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">När team coaching är relevant</h2>
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
              Hur team coaching fungerar
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Arbetet sker i strukturerade team-samtal där teamet tränar på att lyssna, ställa frågor,
                ge feedback och ta gemensamt ansvar.
              </p>
              <p>
                Fokus ligger på hur samarbetet fungerar i uppdraget, inte på individuella bedömningar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Two-col: difference */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Skillnaden mot ledningsgruppscoaching
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Ledningsgruppscoaching handlar om ledningens beslut, mandat och riktning i organisationen.
              </p>
              <p>
                Team coaching handlar om teamets samspel, ansvar och gemensamma arbetssätt i det operativa
                arbetet.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Cards: value */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Förväntat värde</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              När teamet behöver arbeta mer samlat
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Börja med ett första samtal om teamets nuläge och behov.
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
