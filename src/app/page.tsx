import CtaLink from "@/components/cta-link";
import Link from "next/link";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroAccent from "@/components/decorative/HeroAccent";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

const relevancePoints = [
  "Ni står inför ett strategiskt vägval.",
  "Prioriteringar är oklara eller skiftar för ofta.",
  "Friktion i ledningsgruppen bromsar viktiga beslut.",
  "Bolaget är i tillväxt, omställning eller ny fas.",
  "Trycket från ägare eller styrelse ökar.",
  "Beslut fattas i rummet men tappar kraft i verkligheten.",
];

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroAccent />
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Executive coaching och ledningsstöd
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              När ledningen behöver tänka klarare.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Forsa arbetar med vd:ar, grundare och ledningsgrupper när beslut, ansvar och riktning
              behöver skärpas. Vi skapar ett konfidentiellt samtalsrum för klarare tänkande, skarpare
              prioriteringar och beslut som håller i verkligheten.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <span data-hero-cta className="inline-flex">
                <CtaLink href="/kontakt" variant="primary">Boka ett första samtal</CtaLink>
              </span>
              <span data-hero-cta className="inline-flex">
                <CtaLink href="/executive-coaching" variant="secondary">Se executive coaching</CtaLink>
              </span>
            </div>
          </HeroReveal>
        </section>

        {/* Two-col: Kompetens */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-tight tracking-tight">
              Kompetens finns ofta redan. Klarheten gör inte alltid det.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Ledningsgrupper har sällan brist på erfarenhet. Det som oftare saknas är gemensam
                skärpa i vad som är viktigast nu.
              </p>
              <p>
                När trycket ökar blir friktionen tydlig. Prioriteringar glider. Beslut tas, men får
                inte fullt fäste i genomförandet.
              </p>
              <p>Forsa arbetar där det blir avgörande att tänka klart tillsammans.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* Cards: Vad Forsa hjälper med */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad Forsa hjälper med</h2>
          <StaggerCards className="mt-10 grid gap-8 md:grid-cols-3">
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs tracking-[0.18em] text-zinc-500">01</p>
              <h3 className="text-xl font-medium">Klarhet</h3>
              <p className="mt-4 leading-7 text-zinc-700">
                Kärnfrågan ringas in snabbt, och bruset hålls utanför. Fokus hamnar där det gör
                verklig skillnad.
              </p>
            </article>
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs tracking-[0.18em] text-zinc-500">02</p>
              <h3 className="text-xl font-medium">Beslut</h3>
              <p className="mt-4 leading-7 text-zinc-700">
                Underlag, avvägningar och ansvar görs tydliga. Det ger beslut som håller även efter
                mötet.
              </p>
            </article>
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs tracking-[0.18em] text-zinc-500">03</p>
              <h3 className="text-xl font-medium">Riktning</h3>
              <p className="mt-4 leading-7 text-zinc-700">
                Ledningen håller kurs i komplexa lägen, utan att tappa tempo eller kvalitet i
                genomförandet.
              </p>
            </article>
          </StaggerCards>
        </section>

        {/* Two-col: När Forsa är relevant */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-tight tracking-tight">
              När Forsa är relevant
            </h2>
            <div data-col-right className="md:col-span-7">
              <h3 className="text-xl font-medium">När mycket står på spel</h3>
              <ScrollReveal variant="staggerList" className="mt-5">
                <ul className="space-y-3 text-zinc-700">
                  {relevancePoints.map((point) => (
                    <li key={point} data-list-item className="flex items-start gap-3 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        {/* Cards: Tjänster */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Coaching för ledare, team och organisationer
          </h2>
          <StaggerCards className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-medium">Executive coaching</h3>
              <p className="mt-3 leading-7 text-zinc-700">
                För vd:ar, grundare och seniora ledare i komplexa beslut, ansvar och rollklarhet.
              </p>
              <Link href="/executive-coaching" className="mt-5 inline-block text-sm text-zinc-600 underline-offset-4 hover:underline">
                Läs mer
              </Link>
            </article>
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-medium">Ledningsgruppscoaching</h3>
              <p className="mt-3 leading-7 text-zinc-700">
                För ledningsgrupper som behöver tydligare beslut, ansvar och gemensam riktning.
              </p>
              <Link href="/ledningsgruppscoaching" className="mt-5 inline-block text-sm text-zinc-600 underline-offset-4 hover:underline">
                Läs mer
              </Link>
            </article>
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-medium">Individuell coaching</h3>
              <p className="mt-3 leading-7 text-zinc-700">
                För ledare och nyckelpersoner som behöver klarhet i roll, prioritering och påverkan.
              </p>
              <Link href="/individuell-coaching" className="mt-5 inline-block text-sm text-zinc-600 underline-offset-4 hover:underline">
                Läs mer
              </Link>
            </article>
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-medium">Team coaching</h3>
              <p className="mt-3 leading-7 text-zinc-700">
                För team som behöver stärka samspel, ansvar och gemensamt lärande i arbetet.
              </p>
              <Link href="/team-coaching" className="mt-5 inline-block text-sm text-zinc-600 underline-offset-4 hover:underline">
                Läs mer
              </Link>
            </article>
            <article data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-medium">Coachande ledarskap</h3>
              <p className="mt-3 leading-7 text-zinc-700">
                För organisationer som vill utveckla chefers förmåga att leda genom samtal, frågor och ansvar.
              </p>
              <Link href="/coachande-ledarskap" className="mt-5 inline-block text-sm text-zinc-600 underline-offset-4 hover:underline">
                Läs mer
              </Link>
            </article>
          </StaggerCards>
        </section>

        {/* Two-col: Så arbetar Forsa */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-tight tracking-tight">
              Så arbetar Forsa
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <h3 className="text-xl font-medium text-zinc-900">Konfidentiellt. Affärsnära. Precist.</h3>
              <p>
                Arbetet sker i strukturerade samtal med tydlig koppling till ert faktiska läge. Vi
                börjar i det som är svårt på riktigt: var det skaver, vad som står still och vad som
                måste avgöras.
              </p>
              <p>
                Därifrån skärps prioritering, ansvar och beslut, med uppföljning tills riktningen syns
                i handling.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Two-col: Förtroende */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-tight tracking-tight">
              Förtroende
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <h3 className="text-xl font-medium text-zinc-900">
                Göteborgsbaserat stöd för svenska företagsledningar
              </h3>
              <p>
                Forsa är baserat i Göteborg och arbetar med svenska företagsledningar. Uppdragen
                präglas av diskretion, senioritet och affärsförståelse.
              </p>
              <p>
                Vi arbetar nära ledningen i frågor som påverkar bolagets riktning, tempo och resultat.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section id="kontakt" className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              När nästa beslut behöver bära längre än till nästa möte
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Om ni vill ha större skärpa i ledningens prioriteringar, ansvar och beslut, börjar vi med
              ett konfidentiellt första samtal.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">Boka ett första samtal</CtaLink>
              <CtaLink href="mailto:kontakt@forsa.se" variant="secondary" external>Kontakta Forsa</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
