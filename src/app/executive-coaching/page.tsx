import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Executive coaching för vd och grundare | CVB Coaching",
  description:
    "Ett externt samtalsrum utan intern agenda, för beslut som fattas med ofullständig information och höga konsekvenser.",
};

const relevanceList = [
  "Beslutet måste fattas innan informationen är komplett.",
  "Ansvaret i rollen har vuxit fortare än mandatet.",
  "Två prioriteringar utesluter varandra och båda har starka förespråkare.",
  "Förändringstakten kräver att fel beslut upptäcks tidigare än förut.",
];

const focusList = [
  "Beslutsunderlaget prövas innan beslutet fattas, särskilt när informationen är ofullständig.",
  "Var rollens ansvar börjar och slutar i förhållande till ägare, styrelse och ledningsgrupp.",
  "Vägval under osäkerhet, där avvägningarna görs explicita.",
  "Förberedelse inför samtal och besked som inte tål att missförstås.",
  "Hur riktningen hålls när belastningen i rollen är hög.",
];

const nonGoals = [
  "Inte terapi eller bearbetning av privata frågor.",
  "Inte managementkonsultation med färdiga rekommendationer.",
];

const valuePoints = [
  "Från öppen fråga till definierat nästa steg.",
  "Beslut som håller när de ska genomföras.",
  "Lägre belastning i rollen när besluten väger tungt.",
];

export default function ExecutiveCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Executive coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Ett rum utan intern agenda.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För vd:ar, grundare och seniora ledare som fattar beslut med ofullständig information och
              höga konsekvenser. Konfidentiellt, affärsnära och kopplat till det som faktiskt ska avgöras.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Executive coaching är en form av{" "}
              <Link href="/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                business coaching
              </Link>
              . Söker du coaching för egen räkning, se{" "}
              <Link href="/individuell-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Individuell coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              I toppen finns erfarenheten. Det som saknas är motståndet.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Seniora ledare har sällan brist på analys. Det som saknas i pressade lägen är någon som
                prövar resonemanget utan egen agenda i frågan.
              </p>
              <p>
                Internt är varje samtalspartner part i målet. Externt går det att tänka färdigt innan
                beslutet blir offentligt.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Fyra lägen där samtalet gör störst skillnad
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
              Fokus i samtalen
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
              Så går arbetet till
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Arbetet utgår från ert faktiska läge, inte från teoretiska modeller. Samtalen håller
                en fast rytm, och varje samtal avslutas med ett definierat nästa steg.
              </p>
              <p>
                Det är ett konfidentiellt coachingsamtal för reflektion och ansvar, inte
                strategikonsultation. Klienten äger sina mål, sina insikter och sina beslut.
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
            {valuePoints.map((item, index) => (
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
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Beskriv kort vilken fråga som ligger på bordet. Samtalet är konfidentiellt.
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
