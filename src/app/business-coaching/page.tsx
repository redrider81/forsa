import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Business coaching i Göteborg | CVB Coaching",
  description:
    "Personlig business coaching med Carolina von Braun för medarbetare och ledare som behöver tänka klart i en arbetsrelaterad fråga. Företaget kan initiera och finansiera coachingen; samtalen är individuella och konfidentiella.",
};

const relevanceList = [
  "Du står inför ett vägval eller beslut och behöver tänka klart innan du går vidare.",
  "Du har fått ett större ansvar eller befinner dig i en förändring.",
  "Prioriteringarna skiftar och du behöver sortera vad som är viktigast.",
  "Ett beslut har fattats, men behöver få fäste i vardagen.",
  "Du behöver prata fritt och konfidentiellt utanför den egna arbetsplatsen.",
];

const nonGoals = [
  "Inte rådgivning med färdiga rekommendationer. Du äger dina beslut.",
  "Inte terapi eller behandling. Om frågan handlar om ohälsa är terapi rätt väg.",
  "Inte ett standardiserat program. Upplägget följer frågan och det du vill bli klarare i.",
];

const processList = [
  "Företaget kan ta den första kontakten och finansiera coachingen.",
  "Jag pratar med företaget om behovet, ramarna för samarbetet och hur kontakten fungerar.",
  "Coachingen sker sedan i en personlig och konfidentiell relation mellan Carolina och klienten.",
  "Om någon återkoppling till beställaren är relevant är den tydligt överenskommen i förväg.",
];

const valueList = [
  "Vad frågan faktiskt handlar om.",
  "Vilka alternativ som finns och vad de innebär.",
  "Vilket nästa steg som är rätt för dig.",
];

export default function BusinessCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Business coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              En fråga i arbetslivet behöver ibland ett eget rum.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching är personlig coaching i arbetslivet. Den passar medarbetare och
              ledare som behöver tänka klart i en arbetsrelaterad fråga.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Företaget kan ta den första kontakten och finansiera coachingen, medan samtalen är
              individuella och konfidentiella.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Betalar du själv för coachingen, se{" "}
              <Link href="/individuell-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Individuell coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: premise */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Du tänker inte i ett vakuum
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                I arbetslivet påverkas en fråga ofta av ansvar, relationer och förväntningar. I
                coachingen är fokus ändå din situation, dina överväganden och dina val.
              </p>
              <p>
                Jag är en utomstående samtalspartner utan egen agenda i beslutet. Min uppgift är att
                hjälpa dig tänka klart — inte att tala om för dig vad du ska göra.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            När coaching i arbetslivet kan vara rätt
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

        {/* List: process */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Så fungerar ett samarbete
            </h2>
            <div data-col-right className="md:col-span-7">
              <ScrollReveal variant="staggerList">
                <ul className="space-y-3 text-lg leading-8 text-zinc-700">
                  {processList.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
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
          <h2 className="text-3xl font-medium tracking-tight">Det du kan bli klarare i</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Ett samarbete som följer frågan
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Om frågan behöver följas över tid kommer du och jag överens om ett upplägg som passar
                din situation.
              </p>
              <p>
                Vi bestämmer rytmen tillsammans och stämmer löpande av om fokus fortfarande är rätt.
                När arbetet är klart avslutar vi med ett samtal om vad du vill ta med dig vidare.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Boka ett inledande samtal
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
              Samtalet är konfidentiellt.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">
                Boka ett inledande samtal
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
