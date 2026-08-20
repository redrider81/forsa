import {
  formatPrice,
  PRIS_ENSKILT_SAMTAL,
  PRIS_INDIVIDUELL,
  PRIS_LEDNINGSGRUPP,
  PRIS_PROGRAM_FRAN,
} from "../../content/pricing";

type PricingBlockProps = {
  locale: "sv" | "en";
  variant: "individual" | "leadershipGroup" | "program" | "individualSingle";
  className?: string;
};

const labels = {
  sv: { exVat: "exklusive moms" },
  en: { exVat: "excluding VAT" },
} as const;

export function PricingLine({ locale, variant, className = "" }: PricingBlockProps) {
  const amount =
    variant === "individual"
      ? PRIS_INDIVIDUELL
      : variant === "leadershipGroup"
        ? PRIS_LEDNINGSGRUPP
        : variant === "program"
          ? PRIS_PROGRAM_FRAN
          : PRIS_ENSKILT_SAMTAL;

  const formatted = formatPrice(amount, locale);
  if (!formatted) return null;

  return (
    <p className={`text-[1.0625rem] font-medium text-zinc-900 ${className}`}>
      {formatted}, {labels[locale].exVat}
    </p>
  );
}

type HomePricingTableProps = {
  locale: "sv" | "en";
};

export function HomePricingTable({ locale }: HomePricingTableProps) {
  const rows = [
    {
      title: locale === "sv" ? "En ledare" : "One leader",
      body:
        locale === "sv"
          ? "Individuell executive coaching för en vd, grundare eller senior ledare med ett eget utvecklingsmål."
          : "Individual executive coaching for a CEO, founder or senior leader with a defined development objective.",
      detail:
        locale === "sv"
          ? "Sex till åtta samtal över ett halvår."
          : "Six to eight sessions over six months.",
      price: PRIS_INDIVIDUELL,
    },
    {
      title: locale === "sv" ? "En ledningsgrupp" : "One executive team",
      body:
        locale === "sv"
          ? "Flera ledare i samma organisation, med separata coachingrelationer och ett gemensamt mål för ansvar och beslut."
          : "Several leaders in the same organisation, with separate coaching relationships and a shared objective for accountability and decisions.",
      detail: null,
      price: PRIS_LEDNINGSGRUPP,
    },
    {
      title: locale === "sv" ? "En hel organisation" : "A whole organisation",
      body:
        locale === "sv"
          ? "Ledarskapsprogram över flera affärsområden, med milstolpar, uppföljning och överenskommen rapportering till uppdragsgivaren."
          : "Leadership programmes across business areas, with milestones, follow-up and agreed reporting to the sponsor.",
      detail:
        locale === "sv"
          ? "Offereras per program"
          : "Quoted per programme",
      price: PRIS_PROGRAM_FRAN,
    },
  ];

  const visibleRows = rows.filter((row) => row.price !== null);
  if (visibleRows.length === 0 && PRIS_ENSKILT_SAMTAL === null) return null;

  return (
    <div className="divide-y divide-zinc-200/80 border-y border-zinc-200/80">
      {visibleRows.map((row) => {
        const formatted = formatPrice(row.price, locale);
        if (!formatted) return null;
        return (
          <div key={row.title} className="py-7">
            <h3 className="text-xl font-medium leading-tight tracking-tight text-zinc-900">
              {row.title}
            </h3>
            <p className="mt-2.5 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
              {row.body}
            </p>
            {row.detail ? (
              <p className="mt-2 text-[1.0625rem] leading-[1.7] text-zinc-700">
                {row.detail}
                {row.price === PRIS_PROGRAM_FRAN ? `, från ${formatted}` : `. ${formatted}`}
              </p>
            ) : (
              <p className="mt-2 text-[1.0625rem] leading-[1.7] text-zinc-700">
                {formatted}, {labels[locale].exVat}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function HomePricingFooter({ locale }: { locale: "sv" | "en" }) {
  const single = formatPrice(PRIS_ENSKILT_SAMTAL, locale);
  if (!single) return null;

  return (
    <p className="mt-8 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
      {locale === "sv"
        ? `Enstaka samtal utanför löpande uppdrag: ${single}. Samtliga belopp anges exklusive moms.`
        : `Single sessions outside an ongoing engagement: ${single}. All amounts are excluding VAT.`}
    </p>
  );
}

const priceValues = {
  individual: PRIS_INDIVIDUELL,
  leadershipGroup: PRIS_LEDNINGSGRUPP,
  program: PRIS_PROGRAM_FRAN,
  single: PRIS_ENSKILT_SAMTAL,
} as const;

export function ServicePricingSection({
  locale,
  lines,
}: {
  locale: "sv" | "en";
  lines: Array<{ text: string; priceKey?: keyof typeof priceValues }>;
}) {
  const rendered = lines
    .map((line) => {
      if (!line.priceKey) return line.text;
      const formatted = formatPrice(priceValues[line.priceKey], locale);
      if (!formatted) return null;
      return `${line.text} ${formatted}, ${labels[locale].exVat}.`;
    })
    .filter(Boolean);

  if (rendered.length === 0) return null;

  return (
    <div className="space-y-3 text-lg leading-8 text-zinc-700">
      {rendered.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
