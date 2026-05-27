import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";

export const metadata: Metadata = {
  title: "Om Forsa | Forsa",
  description:
    "Forsa är en senior och diskret samtalspartner för vd:ar, grundare och ledningsgrupper i komplexa affärslägen.",
};

const principles = [
  "Konfidentialitet i allt arbete.",
  "Affärsnära perspektiv i varje samtal.",
  "Precision före generella råd.",
  "Uppföljning tills beslut syns i handling.",
];

const audiences = [
  "Vd:ar och grundare med hög beslutspress.",
  "Ledningsgrupper i tillväxt, omställning eller ny fas.",
  "Seniora ledare med ansvar för riktning och genomförande.",
];

export default function OmForsaPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="border-b border-zinc-300 pb-16 md:pb-20">
          <p className="text-sm font-medium tracking-[0.12em] text-zinc-600">Om Forsa</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            Seniort stöd för ledning i komplexa lägen.
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
            Forsa finns för ledningar som behöver ett externt, konfidentiellt och affärsnära
            samtalsrum när beslut, ansvar och riktning behöver skärpas.
          </p>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Varför Forsa finns
          </h2>
          <div className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
            <p>
              I många ledningsmiljöer finns kompetensen, men inte alltid det tydliga beslutsrummet.
              Forsa finns för att bidra med den skärpan i konkreta affärslägen.
            </p>
            <p>
              Målet är inte fler ord om ledarskap, utan bättre beslut och tydligare genomförande i
              verkliga affärssituationer.
            </p>
          </div>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Hur Forsa arbetar
          </h2>
          <div className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
            <p>
              Arbetet sker i strukturerade samtal med tydlig koppling till ert faktiska läge. Varje
              uppdrag utgår från vad som behöver avgöras nu och hur besluten ska få fäste över tid.
            </p>
            <p>
              Fokus ligger på frågor som påverkar bolagets tempo, beslutskraft och resultat.
            </p>
          </div>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Principer
          </h2>
          <ul className="grid gap-4 md:col-span-7 md:grid-cols-2">
            {principles.map((item, index) => (
              <li
                key={item}
                className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700"
              >
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vem Forsa är rätt för</h2>
          <ul className="mt-8 space-y-3 text-zinc-700">
            {audiences.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Göteborg / Sverige
          </h2>
          <div className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
            <p>Forsa är baserat i Göteborg och arbetar med svenska företagsledningar.</p>
            <p>
              Uppdrag genomförs med hög diskretion och nära förståelse för den affärsmässiga
              verklighet som ledningen verkar i.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Om du vill diskutera ett aktuellt ledningsläge
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
            Vi börjar med ett konfidentiellt första samtal.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <CtaLink href="/kontakt" variant="primary">
              Boka ett första samtal
            </CtaLink>
            <CtaLink href="mailto:kontakt@forsa.se" variant="secondary" external>
              Kontakta Forsa
            </CtaLink>
          </div>
        </section>
      </div>
    </main>
  );
}
