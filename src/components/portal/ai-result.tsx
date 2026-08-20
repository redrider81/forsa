"use client";

import { parseAiText } from "@/lib/ai/format";

export function AiResult({ text }: { text: string }) {
  const blocks = parseAiText(text);

  return (
    <div className="max-w-[68ch] space-y-3.5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`${index}-h`}
              className={`text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[#92753a] ${
                index === 0 ? "" : "pt-2.5"
              }`}
            >
              {block.text}
            </h3>
          );
        }
        if (block.type === "bullet") {
          return (
            <p key={`${index}-b`} className="flex gap-3 text-[0.9375rem] leading-[1.7] text-zinc-700">
              <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
              <span>{block.text}</span>
            </p>
          );
        }
        return (
          <p key={`${index}-p`} className="text-[0.9375rem] leading-[1.7] text-zinc-700">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function AiSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <p className="flex items-center gap-2.5 text-[0.8125rem] text-zinc-500">
        <span
          aria-hidden="true"
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-zinc-300 border-t-[#92753a]"
        />
        {label}
      </p>
      <div className="space-y-2.5 pt-1" aria-hidden="true">
        {[92, 78, 96, 64, 88, 54].map((width, index) => (
          <div
            key={width}
            className="h-2.5 animate-pulse rounded-full bg-zinc-200/80"
            style={{ width: `${width}%`, animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AiDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-[var(--klient-text-block-bg)] px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-zinc-500">
      <span aria-hidden="true" className="mt-[0.3rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--klient-accent-gold-muted)]" />
      <span>{children}</span>
    </p>
  );
}
