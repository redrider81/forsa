import type { Metadata } from "next";
import FaqAccordion from "@/components/klient/faq-accordion";
import { BentoLabel } from "@/components/klient/bento";
import { readClientSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "FAQ – CVB Base | CVB Coaching",
  description: "Så fungerar CVB Base.",
  robots: { index: false, follow: false },
};

/**
 * Klientens FAQ. Statisk produktvägledning — ingen datahämtning utöver den
 * autentiserade klientlayouten. Bredden är satt för läsning, inte för ett
 * andra bento-raster.
 */
export default async function ClientFaqPage() {
  const session = await readClientSession();
  if (!session) return null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="klient-reveal">
        <BentoLabel>FAQ</BentoLabel>
        <h1 className="mt-4 font-serif text-[1.75rem] font-medium leading-[1.15] tracking-[-0.015em] text-stone-900 md:text-[2.25rem]">
          Så fungerar CVB Base
        </h1>
        <p className="mt-5 max-w-[58ch] text-[1rem] leading-[1.8] text-stone-600 md:text-[1.0625rem]">
          Här hittar du svar om hur de olika delarna i CVB Base fungerar och hur de används i ditt
          coachingsamarbete med Carolina.
        </p>
      </header>

      <div className="klient-reveal klient-reveal--1 mt-9 md:mt-11">
        <FaqAccordion />
      </div>
    </div>
  );
}
