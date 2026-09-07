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
      "Ett kort och kostnadsfritt telefonsamtal där vi stämmer av vad du söker, om coaching är rätt stöd och om vi har förutsättningar för ett relevant samarbete. Det är inte en coachingsession och innebär inget åtagande.",
  },
  {
    question: "Vad händer om vi vill gå vidare?",
    answer:
      "Då kommer vi överens om vad coachingsamarbetet ska fokusera på, dess omfattning och praktiska upplägg. Pris och övriga villkor är klargjorda innan samarbetet börjar.",
  },
  {
    question: "Hur börjar coachingsamarbetet?",
    answer:
      "När upplägget är överenskommet bekräftar Carolina starten och det första coachingsamtalet planeras. Du får därefter tillgång till CVB Base som stöd för det fortsatta samarbetet.",
  },
  {
    question: "Vad är CVB Base?",
    answer:
      "CVB Base är CVB Coachings eget stöd runt coachingsamarbetet. Där kan du samla reflektioner, förbereda nästa samtal, återvända till tidigare arbete och ha relevant material samlat på ett ställe.",
  },
  {
    question: "Om ett företag betalar för coachingen?",
    answer:
      "Du är fortfarande den som coachas. I början av uppdraget klargör vi vem som betalar och vad som, om något, återkopplas till beställaren.",
  },
  {
    question: "Måste jag bestämma mig efter det första samtalet?",
    answer:
      "Nej. Samtalet används för att avgöra om det finns ett relevant coachingsamarbete att gå vidare med. Vi går vidare först när båda vill det.",
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
