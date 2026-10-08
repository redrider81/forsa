import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Coaching i arbetslivet i Göteborg | CVB Coaching",
  description:
    "Coaching i arbetslivet hos CVB Coaching i Göteborg. För medarbetare, ledare och team som vill utvecklas i sin roll och hantera aktuella utmaningar i arbetslivet.",
};

const focusAreas = [
  "Medarbetarskap och arbetsuppgifter",
  "Ledarskap",
  "Kommunikation och samarbete",
  "Förändring och utveckling",
];

export default function BusinessCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              Coaching i arbetslivet
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För medarbetare, ledare och team som vill utvecklas i sin roll och hantera aktuella
              utmaningar i arbetslivet.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Coaching kan vara ett stöd när du vill utvecklas i din yrkesroll, hantera en aktuell
              situation eller hitta nya sätt att se på en fråga i arbetslivet. Det kan handla om
              arbetsuppgifter, ledarskap, kommunikation, samarbete eller förändringar.
            </p>
          </HeroReveal>
        </section>

        {/* List: focus areas */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">
            Vad vi kan arbeta med
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {focusAreas.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
            Utgångspunkten är alltid den situation och de behov som är aktuella.
          </p>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Vill du veta mer om coaching i arbetslivet?
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Hör gärna av dig så kan vi prata om era behov och hur ett upplägg skulle kunna se ut.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">
                Kontakta mig
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
