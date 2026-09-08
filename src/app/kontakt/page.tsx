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
      "Det första samtalet är ett kort och kostnadsfritt telefonsamtal. Tvåtimmarsperioden du väljer i kalendern är ett tidsfönster — den period jag kan ringa upp inom, inte samtalets längd. Du berättar lite om vad du söker, och vi känner efter om coaching är rätt väg och om det känns rätt att arbeta tillsammans. Det är inte en coachingsession och du förbinder dig inte till något.",
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
              Välj ett tidsfönster som passar och skriv några rader om vad du vill ta upp. Jag
              ringer upp under den valda perioden. Det första samtalet är ett kort, kostnadsfritt
              telefonsamtal där vi stämmer av om coaching är rätt stöd och om vi vill gå vidare
              tillsammans.
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
