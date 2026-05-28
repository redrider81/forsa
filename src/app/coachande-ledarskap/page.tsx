import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Coachande ledarskap | Forsa",
  description:
    "För organisationer som vill stärka chefers förmåga att leda genom samtal, lyssnande, frågor, feedback och ansvar.",
};

const relevanceList = [
  "Chefer behöver stärka kvaliteten i vardagliga ledarsamtal.",
  "Organisationen vill utveckla ansvar utan detaljstyrning.",
  "Feedback och utvecklingssamtal behöver bli tydligare.",
  "Samarbetet kräver mer lärande i det dagliga arbetet.",
];

const focusList = [
  "Coachande samtal för chefer.",
  "Lyssnande och frågor som ledarverktyg.",
  "Feedback och utvecklingssamtal.",
  "Ansvar utan detaljstyrning.",
  "Samtal som skapar lärande.",
];

const setupList = [
  "Ledarcoaching i mindre grupper.",
  "Praktisk träning i coachande samtal.",
  "Stöd mellan träffar för tillämpning i vardagen.",
];

const valueList = [
  "Tydligare samtal mellan chef och medarbetare.",
  "Starkare ansvarstagande i team och verksamhet.",
  "Mer lärande i det dagliga ledarskapet.",
];

export default function CoachandeLedarskapPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Coachande ledarskap
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Coachande ledarskap för tydligare samtal och större ansvar.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              För organisationer som vill stärka chefers förmåga att leda genom bättre frågor,
              lyssnande, feedback och ansvar i arbetet.
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: why */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Varför coachande ledarskap
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                När ledare utvecklar sin förmåga att leda genom samtal stärks både ansvarstagande och
                lärande i organisationen.
              </p>
              <p>
                Det skapar bättre förutsättningar för tydlighet i uppdrag, återkoppling och samarbete.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">När det är relevant</h2>
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
              Vad Forsa arbetar med
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

        {/* Two-col: setup */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Hur arbetet kan läggas upp
            </h2>
            <ScrollReveal variant="staggerList" data-col-right className="md:col-span-7">
              <ul className="space-y-3 text-zinc-700">
                {setupList.map((item) => (
                  <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </ScrollReveal>
        </section>

        {/* Cards: value */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Förväntat värde</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              När ni vill utveckla ledarskap genom bättre samtal
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Börja med ett första samtal om behov, målgrupp och upplägg.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">Boka ett första samtal</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
