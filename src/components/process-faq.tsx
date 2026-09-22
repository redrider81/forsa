"use client";

import { useId, useState } from "react";

export type ProcessFaqItem = {
  question: string;
  answer: string;
};

type Props = {
  heading: string;
  items: ProcessFaqItem[];
  /**
   * "default" är kontaktsidans ton. "editorial" använder startsidans
   * display-skala och ljusa yta, för de redaktionella sidorna.
   */
  variant?: "default" | "editorial";
};

const variantStyles = {
  default: {
    heading: "text-2xl font-medium leading-tight tracking-tight md:text-[1.75rem]",
    list: "mt-10 divide-y divide-line-accent/25 border-y border-line-accent/30",
    question:
      "flex w-full items-start justify-between gap-6 py-5 text-left text-[1.0625rem] leading-[1.65] text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]",
    answer: "max-w-prose pb-6 text-[1.0625rem] leading-[1.75] text-zinc-700",
  },
  editorial: {
    heading:
      "max-w-3xl font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-zinc-900",
    list: "mt-16 divide-y divide-zinc-300 border-y border-zinc-300 md:mt-20",
    question:
      "flex w-full items-start justify-between gap-8 py-7 text-left text-[1.0625rem] font-medium leading-[1.5] tracking-tight text-zinc-900 transition-colors hover:text-[#967844] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-4 focus-visible:ring-offset-white md:py-8 md:text-[1.25rem]",
    answer:
      "max-w-2xl pb-8 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:pb-10",
  },
} as const;

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
export default function ProcessFaq({ heading, items, variant = "default" }: Props) {
  const baseId = useId();
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const styles = variantStyles[variant];

  const toggle = (index: number) =>
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  return (
    <div>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.list}>
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
                  className={styles.question}
                >
                  <span>{item.question}</span>
                  <span className="mt-[0.45rem]">
                    <FaqChevron open={open} />
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
                <p className={styles.answer}>{item.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
