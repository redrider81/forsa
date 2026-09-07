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
