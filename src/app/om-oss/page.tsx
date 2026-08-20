import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "Om CVB Coaching – Carolina von Braun | CVB Coaching",
  description:
    "CVB Coaching grundades av Carolina von Braun i Göteborg. Kommersiell bakgrund från kapitalmarknad och styrelsearbete, diplomerad coach.",
};

const t = svDictionary;

const principles = [
  "Konfidentialitet i allt arbete.",
  "Affärsnära perspektiv i varje samtal.",
  "Precision före generella råd.",
  "Uppföljning tills beslut syns i handling.",
];

const audiences = [
  "Vd:ar och grundare med hög beslutspress.",
  "Ledningsgrupper i tillväxt, omställning eller ny ägarfas.",
  "Seniora ledare med ansvar för riktning och genomförande.",
  "Organisationer som vill utveckla flera chefer inom ett gemensamt program.",
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Om CVB Coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Ett externt beslutsrum för svenska företagsledningar.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              CVB Coaching arbetar med vd:ar, grundare och ledningsgrupper när beslut, ansvar och
              riktning behöver skärpas.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Varför CVB Coaching finns
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                I många ledningsmiljöer finns kompetensen, men inte det uttalade beslutsrummet. CVB
                Coaching finns för att tillföra det i konkreta affärslägen.
              </p>
              <p>
                Målet är inte fler ord om ledarskap, utan bättre beslut och tydligare genomförande i
                verkliga affärssituationer.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">
                Grundare
              </p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">Grundare och coach</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Carolina von Braun grundade CVB Coaching i Göteborg. Hon arbetar med vd:ar, grundare
                och ledningsgrupper när beslut, ansvar och riktning behöver bli tydligare.
              </p>
              <p>
                Bakgrunden är kommersiell. Den omfattar värdepappershandel på Nordea och fyra
                styrelseuppdrag inom fastighetsförvaltning och investeringar. Det är också
                utgångspunkten i samtalen: besluten prövas i affärsmässiga termer.
              </p>
              <p>
                Hon studerade marknadsföring vid Handelshögskolan vid Göteborgs universitet
                1996–2002. År 2025 diplomerades hon i coachning vid Gothia Akademi, steg 1 och 2,
                och medverkar som utbildningsassistent i akademins ledarskapsutbildningar.
              </p>
              <p>
                Förhållningssättet är coachande: klienten äger sina mål, sina insikter och sina
                beslut. Coachens uppgift är att göra tänkandet klarare, inte att leverera svar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Principer
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {principles.map((item, index) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Konfidentialitet
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>Vad som sägs i samtalet stannar i samtalet.</p>
              <p>
                När uppdraget beställs av någon annan än deltagaren avtalas skriftligt i förväg exakt
                vad som återrapporteras: normalt måluppfyllelse och närvaro, aldrig samtalsinnehåll.
              </p>
              <p>
                Anteckningar förvaras separat från uppdragsgivarens system och raderas senast tolv
                månader efter avslutat uppdrag. Personuppgifter behandlas enligt
                dataskyddsförordningen.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vem CVB Coaching är rätt för</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {audiences.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Göteborg, med uppdrag i hela Sverige
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching är baserat i Göteborg och arbetar med svenska företagsledningar.
                Samtalen hålls på plats eller sker digitalt.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Beskriv kort vilket ledningsläge som är aktuellt.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">{t.cta.primary}</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
