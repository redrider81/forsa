import type { Metadata } from "next";
import FaqAccordion from "@/components/klient/faq-accordion";
import { coachFaqCategories } from "@/components/portal/coach-faq-content";
import { PageHeading } from "@/components/portal/ui";

export const metadata: Metadata = {
  title: "FAQ – CVB Base | CVB Coaching",
  description: "Så använder du coachfunktionerna i CVB Base.",
  robots: { index: false, follow: false },
};

export default function CoachFaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading
        label="FAQ"
        title="Så fungerar CVB Base"
        lead="Här hittar du svar om hur du arbetar med klienter, sessioner, uppdrag, avtal och material i coachportalen."
      />
      <div className="mt-9 md:mt-11">
        <FaqAccordion categories={coachFaqCategories} />
      </div>
    </div>
  );
}
