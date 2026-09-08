# 02a — Swedish about and contact pages

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

About Carolina, the contact/booking page, and the process FAQ disclosure component.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/app/om-oss/page.tsx

### Affected route(s)
/om-oss

### Current source

```tsx
import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach i Göteborg | CVB Coaching",
  description:
    "Carolina von Braun driver CVB Coaching i Göteborg. Kommersiell bakgrund från kapitalmarknad och styrelsearbete, diplomerad coach vid Gothia Akademi.",
};

const t = svDictionary;

const principles = [
  "Konfidentialitet.",
  "Frågor före råd. Du äger dina slutsatser.",
  "Precision framför uppmuntran.",
  "Uppföljning tills något faktiskt har hänt.",
];

const audiences = [
  "Privatpersoner som står inför ett vägval, en förändring eller ett beslut som väger.",
  "Ledare och medarbetare som behöver tänka klart med någon utanför organisationen.",
  "Team där ansvar, prioritering och beslut behöver skärpas.",
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Om Carolina
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Personen du ska ha samtalen med.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Att välja coach är att välja vem man tänker högt inför. Här är vad du behöver veta om
              mig för att avgöra om det ska vara jag.
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
                De flesta av oss har människor omkring oss som vill väl. Färre har någon vars enda
                uppgift är att hjälpa oss tänka färdigt, utan att ha en åsikt om utgången.
              </p>
              <p>
                CVB Coaching finns för att göra den platsen tillgänglig — för den som kommer på egen
                hand och för den som kommer genom sitt arbete.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">
                Coach
              </p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">CVB Coaching, Göteborg</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Carolina von Braun heter jag som driver CVB Coaching i Göteborg och är utbildad och
                diplomerad coach vid Gothia Akademi genom ICF-ackrediterad coachutbildning på Level 1
                och Level 2.
              </p>
              <p>
                Bakgrunden omfattar värdepappershandel på Nordea, styrelseuppdrag inom
                fastighetsförvaltning och investeringar samt studier i marknadsföring vid
                Handelshögskolan vid Göteborgs universitet. Erfarenheten ger en affärsmässig
                förståelse för situationer där ansvar, vägval och konsekvenser behöver vägas mot
                varandra.
              </p>
              <p>
                I coachingen är rollerna tydliga: klienten äger sina mål, insikter och beslut. CVB
                Coachings uppgift är att skapa skärpa i tänkandet, utmana perspektiv och föra
                samtalet framåt utan att ta över slutsatserna.
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
              <p>Vad som sägs i samtalet behandlas konfidentiellt.</p>
              <p>
                När samtalen beställs av någon annan än deltagaren kommer vi överens om vad som
                återkopplas, innan arbetet börjar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vilka jag arbetar med</h2>
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
              Göteborg, eller digitalt när det passar bättre
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, och var du
                befinner dig avgör inte om det fungerar.
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
              Skriv några rader om vad du vill ta upp, och välj en tid som passar.
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
```

---

## File: src/app/kontakt/page.tsx

### Affected route(s)
/kontakt

### Current source

```tsx
import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import ContactPageScrollReset from "@/components/contact-page-scroll-reset";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import HeroReveal from "@/components/animations/HeroReveal";

export const metadata: Metadata = {
  title: "Boka ett första samtal | CVB Coaching",
  description:
    "Boka ett kort och kostnadsfritt telefonsamtal där vi stämmer av om coaching är rätt stöd. Samtalet är konfidentiellt, oavsett om du kommer på egen hand eller genom din arbetsgivare.",
};

const processFaq: ProcessFaqItem[] = [
  {
    question: "Vad är det första samtalet?",
    answer:
      "Det första samtalet är ett kort och kostnadsfritt telefonsamtal. Du berättar lite om vad du söker, och vi känner efter om coaching är rätt väg och om det känns rätt att arbeta tillsammans. Det är inte en coachingsession och du förbinder dig inte till något.",
  },
  {
    question: "Vad händer om vi vill gå vidare?",
    answer:
      "Om vi båda vill gå vidare pratar vi igenom vad du vill arbeta med och hur vårt coachingsamarbete kan se ut. Vi kommer överens om omfattning, praktiskt upplägg och pris innan vi börjar.",
  },
  {
    question: "Hur börjar coachingsamarbetet?",
    answer:
      "När vi har kommit överens om hur vi vill arbeta tillsammans får du en personlig bekräftelse från mig och vi planerar vårt första coachingsamtal. Du får också tillgång till CVB Base, där vi samlar det som hör till vårt arbete tillsammans.",
  },
  {
    question: "Vad är CVB Base?",
    answer:
      "CVB Base är en del av hur jag arbetar med mina klienter. Där kan du samla reflektioner, förbereda sådant du vill ta med till nästa samtal och återvända till sådant vi tidigare har arbetat med. På så sätt finns sammanhanget kvar även mellan våra samtal.",
  },
  {
    question: "Hur arbetar du med företag?",
    answer:
      "Jag arbetar med företag genom individuella coachingsamarbeten med personer i verksamheten. Det kan börja med en person och vid behov utökas med fler. Varje samarbete är separat, och innan vi börjar är vi tydliga med vem som betalar och vad som, om något, ska återkopplas till beställaren.",
  },
  {
    question: "Måste jag bestämma mig efter det första samtalet?",
    answer:
      "Nej. Det första samtalet är till för att vi båda ska kunna känna efter om det här är rätt. Vi går bara vidare om det känns bra och relevant för oss båda.",
  },
];

export default function KontaktPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <ContactPageScrollReset />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        <section className="relative overflow-hidden border-b border-zinc-300/80 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Kontakt
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Börja med ett samtal.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Välj en tid som passar och skriv några rader om vad du vill ta upp. Det första samtalet
              är ett kort, kostnadsfritt telefonsamtal där vi stämmer av om coaching är rätt stöd och
              om vi vill gå vidare tillsammans.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="Vad händer efter att du bokat?" items={processFaq} />
            </aside>
          </div>
        </section>

      </div>
    </main>
  );
}
```

---

## File: src/components/process-faq.tsx

### Affected route(s)
shared — /kontakt, /en/kontakt

### Current source

```tsx
"use client";

import { useId, useState } from "react";

export type ProcessFaqItem = {
  question: string;
  answer: string;
};

type Props = {
  heading: string;
  items: ProcessFaqItem[];
};

function FaqChevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 shrink-0 opacity-75 motion-reduce:transition-none transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2.5 4.5 6 8 9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Vad som händer efter bokningen. Enkel disclosure — varje fråga är en egen
 * knapp som styr sitt eget svar, flera kan vara öppna samtidigt.
 */
export default function ProcessFaq({ heading, items }: Props) {
  const baseId = useId();
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (index: number) =>
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  return (
    <div>
      <h2 className="text-2xl font-medium leading-tight tracking-tight md:text-[1.75rem]">
        {heading}
      </h2>
      <ul className="mt-10 divide-y divide-line-accent/25 border-y border-line-accent/30">
        {items.map((item, index) => {
          const open = openIndexes.includes(index);
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;
          return (
            <li key={item.question}>
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left text-[1.0625rem] leading-[1.65] text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
                >
                  <span>{item.question}</span>
                  <span className="mt-[0.45rem]">
                    <FaqChevron open={open} />
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
                <p className="max-w-prose pb-6 text-[1.0625rem] leading-[1.75] text-zinc-700">
                  {item.answer}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```
