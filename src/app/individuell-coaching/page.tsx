import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Individuell coaching i Göteborg | CVB Coaching",
  description:
    "Individuell coaching hos CVB Coaching i Göteborg. För dig som vill utvecklas, fatta beslut eller ta nästa steg i livet eller karriären.",
};

const focusAreas = [
  "Liv och förändring",
  "Karriär och arbetsliv",
  "Beslut och vägval",
  "Styrkor och utveckling",
];

export default function IndividuellCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              Individuell coaching
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För dig som vill utvecklas, fatta beslut eller ta nästa steg i livet eller karriären.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Coaching kan vara ett sätt att få tid och utrymme att tänka kring det som är viktigt för
              dig. Det kan handla om en förändring, ett beslut eller en situation du vill förstå
              bättre. Det kan också handla om att ta vara på dina styrkor, utvecklas eller utforska nya
              möjligheter. Du behöver inte ha alla svar från början. Vi utgår från det som är aktuellt
              för dig och arbetar tillsammans med det du vill förändra, utveckla eller komma vidare med.
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
            Det är dina frågor och det som är viktigt för dig som styr vad vi arbetar med.
          </p>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Nyfiken på om coaching kan vara rätt för dig?
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Boka ett första samtal så ser vi tillsammans om coaching är rätt för dig och vad du vill
              få ut av våra samtal.
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
