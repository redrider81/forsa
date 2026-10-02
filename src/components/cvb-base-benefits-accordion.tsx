"use client";

import { useEffect, useId, useState } from "react";

export type CvbBaseBenefitItem = {
  title: string;
  body: string;
};

const triggerFocusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark";

export default function CvbBaseBenefitsAccordion({
  items,
}: {
  items: CvbBaseBenefitItem[];
}) {
  const baseId = useId().replace(/:/g, "");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");

    function syncOpenIndex() {
      setOpenIndex(media.matches ? 0 : null);
    }

    syncOpenIndex();
    media.addEventListener("change", syncOpenIndex);
    return () => media.removeEventListener("change", syncOpenIndex);
  }, []);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="divide-y divide-white/20">
      {items.map((row, index) => {
        const open = openIndex === index;
        const headerId = `${baseId}-benefit-trigger-${index}`;
        const panelId = `${baseId}-benefit-panel-${index}`;
        const isPrivacyRow = index === 2;

        return (
          <div key={row.title}>
            <h3 className="font-serif font-medium leading-[1.3] tracking-[-0.02em] text-white">
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className={`flex w-full items-start justify-between gap-4 py-5 text-left md:gap-6 md:py-6 ${triggerFocusClass}`}
              >
                <span
                  className={`min-w-0 flex-1 text-balance ${
                    isPrivacyRow
                      ? "text-xl md:text-[1.4375rem]"
                      : "text-lg md:text-[1.3125rem]"
                  }`}
                >
                  {row.title}
                </span>
                <span
                  className="mt-0.5 shrink-0 font-sans text-[1.125rem] font-light leading-none tabular-nums text-zinc-400"
                  aria-hidden="true"
                >
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              aria-hidden={!open}
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p
                  className={`max-w-lg pb-5 text-[1rem] font-[450] leading-[1.72] md:pb-6 md:text-[1.0625rem] md:leading-[1.75] lg:max-w-xl ${
                    isPrivacyRow ? "text-zinc-300" : "text-zinc-400"
                  }`}
                >
                  {row.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
