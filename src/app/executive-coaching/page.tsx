import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";

export const metadata: Metadata = {
  title: "Executive coaching | Forsa",
  description:
    "Ett konfidentiellt samtal för vd:ar, grundare och seniora ledare när beslut, ansvar och riktning behöver skärpas.",
};

const relevanceList = [
  "Beslut behöver tas med ofullständig information och höga konsekvenser.",
  "Ansvarsfrågor i ledarrollen blir otydliga eller tynger mer än tidigare.",
  "Viktiga prioriteringar konkurrerar med varandra och skapar intern friktion.",
  "Förändringstakten ökar och kräver större precision i vad som ska göras nu.",
];

const focusList = [
  "Beslutsstöd för vd och seniora ledare.",
  "Rollklarhet och ledarskapsansvar i förändring.",
  "Strategiska vägval under osäkerhet.",
  "Svåra samtal och ledningskommunikation.",
  "Ledarskap under press med bibehållen riktning.",
];

const nonGoals = [
  "Inte terapi eller bearbetning av privata frågor.",
  "Inte motivationssamtal utan tydlig affärskoppling.",
  "Inte generiska coachmodeller utan förankring i ert faktiska läge.",
];

const valuePoints = [
  "Snabbare väg från osäkerhet till tydligt nästa steg.",
  "Beslut som håller bättre över tid och i genomförande.",
  "Större lugn i ledarskapet när mycket står på spel.",
];

export default function ExecutiveCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="border-b border-zinc-300 pb-16 md:pb-20">
          <p className="text-sm font-medium tracking-[0.12em] text-zinc-600">Executive coaching</p>
          <h1 className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            Ett konfidentiellt samtal när besluten väger tungt.
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
            För vd:ar, grundare och seniora ledare som behöver tänka klarare när trycket ökar.
            Samtalet är konfidentiellt och affärsnära, med fokus på beslut, rollklarhet och ansvar i
            lägen där konsekvenserna är höga.
          </p>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            När ledarrollen behöver ett skarpare samtalsrum
          </h2>
          <div className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
            <p>
              I seniora roller finns ofta erfarenheten redan. Det som saknas i pressade lägen är
              utrymme för skarp reflektion utan intern agenda.
            </p>
            <p>Ett externt samtal skärper avvägningar och beslut när belastningen i rollen är hög.</p>
          </div>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">När ett konfidentiellt ledningsstöd behövs</h2>
          <ul className="mt-8 space-y-3 text-zinc-700">
            {relevanceList.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Vad Forsa arbetar med
          </h2>
          <ul className="grid gap-4 md:col-span-7 md:grid-cols-2">
            {focusList.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Hur arbetet sker
          </h2>
          <div className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
            <p>
              Arbetet sker i strukturerade samtal med tydlig rytm och uppföljning. Vi utgår från ert
              faktiska läge, inte från teoretiska ideal.
            </p>
            <p>
              Fokus ligger på att ringa in kärnfrågan, skärpa beslutet och tydliggöra nästa steg i
              genomförandet.
            </p>
            <p>
              Det är ett konfidentiellt coachingsamtal för reflektion och ansvar, inte strategikonsultation.
            </p>
          </div>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad det inte är</h2>
          <ul className="mt-8 space-y-3 text-zinc-700">
            {nonGoals.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Förväntat värde</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {valuePoints.map((item, index) => (
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

        <section className="py-16 md:py-20">
          <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            När du behöver ett tydligare beslutsunderlag i ledarrollen
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
            Vi börjar med ett konfidentiellt första samtal om var skärpa behövs mest just nu.
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
