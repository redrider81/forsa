import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Business coaching i Göteborg | CVB Coaching",
  description:
    "Business coaching hos CVB Coaching i Göteborg. Coaching i arbetslivet, enskilt med en medarbetare eller ledare, eller tillsammans med ett team.",
};

const relevanceList = [
  "Ett vägval ska avgöras innan informationen är komplett.",
  "Ansvaret i en roll har vuxit fortare än mandatet.",
  "Prioriteringarna skiftar oftare än verksamheten hinner ställa om.",
  "Beslut fattas i rummet men tappar kraft i vardagen.",
  "Friktion finns men benämns inte, och sänker tempot utan adressat.",
  "En nyckelperson ska bära mer och behöver någon att tänka med.",
];

const nonGoals = [
  "Inte managementkonsultation. Inga färdiga rekommendationer, och besluten förblir era.",
  "Inte teambuilding eller övningar utan koppling till verkligt arbete.",
  "Inte en engångsinsats som lämnas utan uppföljning.",
];

const processList = [
  "Ett första samtal, konfidentiellt. Vi avgör tillsammans om frågan hör hemma här.",
  "Mål, omfattning och sekretess är överenskomna innan arbetet börjar.",
  "Vad som återkopplas till beställaren bestäms i förväg.",
  "Avstämning mot målen under uppdragets gång.",
  "Avslut mot de mål som sattes vid start, och beslut om fortsättning eller avslut.",
];

const valueList = [
  "Kortare väg från diskussion till fattat beslut.",
  "Ansvar som är uttalat i stället för underförstått.",
  "Beslut som håller hela vägen ut i vardagen.",
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
              Beslut som bär längre än till nästa möte.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching är coaching i ett sammanhang där någon annan än deltagaren betalar,
              och där besluten också ska hålla i organisationen. Det gäller enskilda medarbetare och
              ledare lika väl som team.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Söker du coaching för egen räkning, se{" "}
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
              Kompetensen finns. Utrymmet att tänka gör det inte alltid.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                I en organisation är varje intern samtalspartner också part i frågan. Det gör det
                svårt att pröva ett resonemang innan det blir ett besked.
              </p>
              <p>
                Det är den funktionen CVB Coaching fyller: en utomstående som inte har något att
                vinna på vilket beslut ni landar i, bara på att det är genomtänkt.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Sex lägen där det gör störst skillnad
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
              Så ser ett uppdrag ut
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

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Ett coachingsamarbete över tid
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Ett uppdrag löper över en överenskommen period, och upplägget är detsamma oavsett om
                jag arbetar med en medarbetare, en ledare eller ett team. Det är sammanhanget som
                skiljer, inte arbetssättet.
              </p>
              <p>
                Samtalen planerar vi tillsammans och fördelar över perioden. De följer inget fast
                schema — vi lägger dem där de gör mest nytta, och flyttar dem när verksamheten kräver
                det. Ramen är överenskommen, innehållet är ert.
              </p>
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
