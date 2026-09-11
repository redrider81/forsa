"use client";

import { useId, useRef, useState } from "react";
import type { FaqCategory } from "@/components/faq/faq-types";
import { faqCategories as clientFaqCategories } from "@/components/klient/faq-content";

/**
 * FAQ-dragspel för klientportalen.
 *
 * En kategori i taget är öppen. Rörelsen ligger i CSS (`.klient-faq-*` i
 * klient-tokens.css) — inget nytt animationsberoende. Stängda paneler får
 * `visibility: hidden` via klassen, så länkar i dem hamnar aldrig i
 * tabbordningen.
 */
export default function FaqAccordion({
  categories = clientFaqCategories,
  variant = "client",
}: {
  categories?: FaqCategory[];
  variant?: "client" | "coach";
}) {
  const baseId = useId().replace(/:/g, "");
  const [openId, setOpenId] = useState<string | null>(
    variant === "coach" ? (categories[0]?.id ?? null) : null,
  );
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTrigger(index: number) {
    const count = categories.length;
    const next = ((index % count) + count) % count;
    triggers.current[next]?.focus();
  }

  return (
    <div className={`klient-faq-stack ${variant === "coach" ? "portal-faq-stack" : ""}`}>
      {categories.map((category, index) => {
        const open = openId === category.id;
        const headerId = `${baseId}-faq-header-${category.id}`;
        const panelId = `${baseId}-faq-panel-${category.id}`;

        return (
          <section
            key={category.id}
            className={`klient-card klient-faq-item ${variant === "coach" ? "portal-faq-item" : ""} ${open ? "is-open" : "klient-card--quiet"}`}
          >
            <h2 className="klient-faq-heading">
              <button
                type="button"
                id={headerId}
                ref={(node) => {
                  triggers.current[index] = node;
                }}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : category.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    focusTrigger(index + 1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    focusTrigger(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    focusTrigger(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    focusTrigger(categories.length - 1);
                  }
                }}
                className="klient-faq-trigger"
              >
                {variant === "coach" ? (
                  <span aria-hidden="true" className="portal-faq-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.0625rem] font-medium leading-snug tracking-[-0.015em] text-stone-900 md:text-[1.125rem]">
                    {category.title}
                  </span>
                  <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-stone-600">
                    {category.summary}
                  </span>
                </span>

                <span aria-hidden="true" className="klient-faq-indicator">
                  <span className="klient-faq-indicator-bar" />
                  <span className="klient-faq-indicator-bar klient-faq-indicator-bar--vertical" />
                </span>
              </button>
            </h2>

            <div id={panelId} role="region" aria-labelledby={headerId} className="klient-faq-panel">
              <div className="klient-faq-panel-clip">
                <div className="klient-faq-panel-inner">
                  <dl className="klient-faq-list">
                    {category.entries.map((entry) => (
                      <div key={entry.question} className="klient-faq-entry">
                        <dt className="text-[0.9375rem] font-medium leading-[1.5] tracking-[-0.005em] text-stone-900">
                          {entry.question}
                        </dt>
                        <dd className="mt-2.5 space-y-3">
                          {entry.answer.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="max-w-[62ch] text-[0.9375rem] leading-[1.75] text-stone-700"
                            >
                              {paragraph}
                            </p>
                          ))}
                          {entry.contactEmail ? (
                            <p className="max-w-[62ch] text-[0.9375rem] leading-[1.75]">
                              <a href={`mailto:${entry.contactEmail}`} className="klient-faq-link">
                                {entry.contactEmail}
                              </a>
                            </p>
                          ) : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
