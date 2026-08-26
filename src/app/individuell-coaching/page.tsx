import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Individuell coaching i Göteborg | CVB Coaching",
  description:
    "Individuell coaching hos CVB Coaching i Göteborg. För dig som står inför ett vägval, en förändring eller ett beslut som inte låter sig skjutas upp.",
};

const relevanceList = [
  "Du står inför ett val och kommer inte fram på egen hand.",
  "Något har tagit slut och nästa sak har inte tagit form.",
  "Du gör allt du brukar göra och rör dig ändå inte framåt.",
  "Rollen eller livet har växt fortare än sättet du hanterar det på.",
  "Du vet vad du borde göra, men gör det inte.",
];

const focusList = [
  "Vägval och beslut som får konsekvenser en tid framåt.",
  "Övergångar: ny roll, ny fas, nytt sammanhang.",
  "Riktning när flera alternativ ser rimliga ut.",
  "Vanor och mönster som kostar mer än de ger.",
  "Arbete, karriär och rollens gränser.",
  "Nya perspektiv på något du redan vänt på länge.",
];

const nonGoals = [
  "Inte terapi eller behandling. Handlar frågan om ohälsa är terapi rätt väg, och det säger jag då.",
  "Inte rådgivning. Jag tar inte över dina beslut och ger dig inte min uppfattning som facit.",
  "Inte peppning. Du får motstånd när det behövs, inte tillrop.",
];

const valueList = [
  "Du vet vad frågan faktiskt gäller, inte bara hur den känns.",
  "Du fattar beslutet i stället för att bära det.",
  "Du har ett sätt att tänka som håller även nästa gång.",
];

export default function IndividuellCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Individuell coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Frågan är din. Strukturen är min.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Individuell coaching är ett samtal du bokar för egen räkning. Du tar med dig det som
              faktiskt upptar dig — ett vägval, en förändring, en fråga som inte släpper — och kommer
              längre med den än du gör på egen hand.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Betalas samtalen av en arbetsgivare, eller gäller frågan ett team eller en
              ledningsgrupp, se{" "}
              <Link href="/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Business coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: premise */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Du har oftast redan svaret. Sällan i ordning.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Det som saknas är sällan information. Det är någon som ställer frågorna i rätt
                ordning och inte nöjer sig med det första svaret.
              </p>
              <p>
                Vänner vill ditt bästa. Kollegor är parter i frågan. Ett coachingsamtal har ingen
                åsikt om vad du väljer, bara intresse av att du väljer med öppna ögon.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Lägen där det brukar låsa sig
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
              Vad frågorna kan handla om
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
              Så arbetar jag
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Samtalen är konfidentiella. Du sätter frågan, jag ställer den vidare tills den blir
                skarp. Vi arbetar med det du kan påverka och lämnar resten.
              </p>
              <p>
                Varje samtal avslutas med något konkret du tar med dig. Nästa gång börjar vi där —
                med vad som faktiskt hände, inte med vad som var tänkt.
              </p>
              <p>
                Hur många samtal det blir avgörs av frågan. Ibland räcker ett. Ibland behövs en
                följeslagare över en längre period.
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
          <h2 className="text-3xl font-medium tracking-tight">Vad du tar med dig</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item, index) => (
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
              Skriv några rader om vad du vill ta upp, och välj en tid som passar.
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
