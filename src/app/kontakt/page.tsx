import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Kontakt | Forsa",
  description: "Börja med ett konfidentiellt samtal med Forsa.",
};

const messagePoints = [
  "Kort beskrivning av er situation och vad som är viktigast nu.",
  "Vilka beslut eller prioriteringar som behöver större klarhet.",
  "Om frågan gäller executive coaching eller ledningsgruppscoaching.",
];

const nextSteps = [
  "Vi bekräftar mottagandet och återkommer med förslag på första samtal.",
  "Samtalet används för att klargöra behov, läge och nästa steg.",
  "Om det finns god matchning föreslår vi ett upplägg med tydlig inriktning.",
];

export default function KontaktPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Kontakt
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Börja med ett konfidentiellt samtal.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Kontakten med Forsa hålls enkel, diskret och tydlig från första meddelandet.
            </p>
          </HeroReveal>
        </section>

        {/* Cards: contact options */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Kontaktalternativ</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-2">
            <div data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm tracking-wide text-zinc-500">E-post</p>
              <a className="mt-3 inline-block text-lg text-zinc-900" href="mailto:kontakt@forsa.se">
                kontakt@forsa.se
              </a>
            </div>
            <div data-card className="rounded-2xl border border-zinc-300 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm tracking-wide text-zinc-500">Plats</p>
              <p className="mt-3 text-lg text-zinc-900">Göteborg</p>
            </div>
          </StaggerCards>
        </section>

        {/* List: message */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Vad du kan inkludera i första meddelandet
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {messagePoints.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* List: next steps */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad som händer nästa steg</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nextSteps.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* Two-col: confidentiality */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Konfidentialitet
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                All inledande dialog hanteras med diskretion. Forsa arbetar i konfidentiella
                samtalsformat där innehåll och sammanhang behandlas med omsorg.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              När ni vill inleda dialogen
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="mailto:kontakt@forsa.se" variant="primary" external>
                Skriv till kontakt@forsa.se
              </CtaLink>
              <CtaLink href="/" variant="secondary">Till startsidan</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
