import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";

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
        <section className="border-b border-zinc-300 pb-16 md:pb-20">
          <p className="text-sm font-medium tracking-[0.12em] text-zinc-600">Kontakt</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            Börja med ett konfidentiellt samtal.
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
            Kontakten med Forsa hålls enkel, diskret och tydlig från första meddelandet.
          </p>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Kontaktalternativ</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-300 bg-white p-6">
              <p className="text-sm tracking-wide text-zinc-500">E-post</p>
              <a className="mt-3 inline-block text-lg text-zinc-900" href="mailto:kontakt@forsa.se">
                kontakt@forsa.se
              </a>
            </div>
            <div className="rounded-2xl border border-zinc-300 bg-white p-6">
              <p className="text-sm tracking-wide text-zinc-500">Plats</p>
              <p className="mt-3 text-lg text-zinc-900">Göteborg</p>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad du kan inkludera i första meddelandet</h2>
          <ul className="mt-8 space-y-3 text-zinc-700">
            {messagePoints.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad som händer nästa steg</h2>
          <ul className="mt-8 space-y-3 text-zinc-700">
            {nextSteps.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-10 border-b border-zinc-300 py-16 md:grid-cols-12 md:py-20">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
            Konfidentialitet
          </h2>
          <div className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
            <p>
              All inledande dialog hanteras med diskretion. Forsa arbetar i konfidentiella
              samtalsformat där innehåll och sammanhang behandlas med omsorg.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            När ni vill inleda dialogen
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <CtaLink href="mailto:kontakt@forsa.se" variant="primary" external>
              Skriv till kontakt@forsa.se
            </CtaLink>
            <CtaLink href="/" variant="secondary">
              Till startsidan
            </CtaLink>
          </div>
        </section>
      </div>
    </main>
  );
}
