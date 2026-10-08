import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Individuell coaching i Göteborg | CVB Coaching",
  description:
    "Individuell coaching hos CVB Coaching i Göteborg. För dig som står inför ett vägval, en förändring eller ett beslut som inte låter sig skjutas upp.",
};

const relevanceList = [
  "Livsfrågor och förändringar",
  "Karriär och arbetsliv",
  "Beslut och vägval",
  "Utveckling och självledarskap",
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
              Individuell Coaching
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För dig som vill utvecklas, fatta beslut eller ta nästa steg i livet eller karriären.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Coaching kan vara ett sätt att få tid och utrymme att tänka kring det som är viktigt för
              dig. Det kan handla om en förändring, ett beslut eller en situation du vill förstå
              bättre. Det kan också handla om att ta vara på dina styrkor, utvecklas eller utforska nya
              möjligheter.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Du behöver inte ha alla svar från början. Vi utgår från det som är aktuellt för dig och
              arbetar tillsammans med det du vill förändra, utveckla eller komma vidare med.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Betalas coachingen av en arbetsgivare, eller gäller frågan din roll i arbetslivet,
              se{" "}
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
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
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
          <h2 className="text-3xl font-medium leading-[1.25] tracking-tight">
            Det kan handla om
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

        {/* Two-col: how */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
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

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-[1.25] tracking-tight md:col-span-5">
              Ett coachingsamarbete över tid
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                När frågan behöver följas över tid gör vi coachingen till ett samarbete med en
                överenskommen ram. Du och jag kommer överens om vad arbetet ska handla om, och över
                hur lång period vi arbetar, innan vi börjar.
              </p>
              <p>
                Samtalen planerar vi tillsammans och fördelar över perioden. De följer inget fast
                schema — vi lägger dem där de gör mest nytta, och flyttar dem när det du arbetar med
                kräver något annat.
              </p>
              <p>
                Under perioden stämmer vi av om fokus fortfarande stämmer eller om frågan har flyttat
                sig. Och samarbetet får ett medvetet avslut, ett sista samtal där vi går igenom vad
                perioden gav och vad du tar vidare på egen hand.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight md:text-4xl">
              Nyfiken på om coaching är något för dig?
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat
              allt. Samtalet är konfidentiellt.
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
