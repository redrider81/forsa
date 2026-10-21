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
    question: "Vad händer efter att jag skickat en bokningsförfrågan?",
    answer:
      "Jag går igenom din förfrågan och ringer upp dig under det tidsfönster du har valt.",
  },
  {
    question: "Vad är det första samtalet?",
    answer:
      "Det är ett kort och kostnadsfritt telefonsamtal där vi pratar om din situation, vad du vill få ut av coaching och om coaching med mig känns rätt för dig.",
  },
  {
    question: "Måste jag bestämma mig efter det första samtalet?",
    answer:
      "Nej. Samtalet är till för att vi ska få en bild av vad du söker och se om coaching med mig passar dig. Du förbinder dig inte till något.",
  },
  {
    question: "Vad händer om vi vill gå vidare?",
    answer:
      "Vi pratar om vad du vill arbeta med, kommer överens om ett upplägg och sätter en gemensam riktning för coachingen.",
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
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              Boka ett kostnadsfritt introduktionssamtal
            </h1>
            <div data-hero-body className="mt-8 max-w-3xl space-y-6 text-lg leading-8 text-zinc-700">
              <p>
                Är du nyfiken på coaching och vill veta om det kan vara rätt för dig eller din
                verksamhet?
              </p>
              <p>
                Boka ett första, kostnadsfritt samtal där vi pratar om din situation, dina behov och
                vad du vill utveckla. Samtalet tar vanligtvis 15–30 minuter och jag ringer upp dig under
                det tidsfönster du väljer.
              </p>
              <p>
                Efter samtalet ser vi tillsammans om och hur vi vill gå vidare.
              </p>
            </div>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="Vanliga frågor" items={processFaq} />
            </aside>
          </div>
        </section>

      </div>
    </main>
  );
}
