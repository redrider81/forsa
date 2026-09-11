import type { Metadata } from "next";
import FaqAccordion from "@/components/klient/faq-accordion";
import { coachFaqCategories } from "@/components/portal/coach-faq-content";

export const metadata: Metadata = {
  title: "FAQ – CVB Base | CVB Coaching",
  description: "Så använder du coachfunktionerna i CVB Base.",
  robots: { index: false, follow: false },
};

export default function CoachFaqPage() {
  return (
    <div className="portal-faq-page mx-auto w-full max-w-4xl">
      <header className="portal-faq-hero">
        <div className="portal-faq-eyebrow">
          <span aria-hidden="true" className="portal-faq-eyebrow-line" />
          Guide för Carolina
        </div>
        <h1 className="portal-faq-title">Allt du behöver för att arbeta i CVB Base</h1>
        <p className="portal-faq-lead">
          En praktisk vägledning genom klienter, sessioner, uppdrag, avtal och material
          — från första förberedelsen till det du väljer att dela.
        </p>
        <p className="portal-faq-hint">Välj ett område för att se vanliga frågor och svar.</p>
      </header>

      <div className="portal-faq-content">
        <FaqAccordion categories={coachFaqCategories} variant="coach" />
      </div>
    </div>
  );
}
