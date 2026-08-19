import type { ReactNode } from "react";

/** Klientportalens ytor. Lugnare och varmare än coachportalen. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[#ece7dc] bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#92753a]">
      {children}
    </p>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-2.5 text-[1.25rem] font-medium leading-[1.3] tracking-tight text-zinc-900">
      {children}
    </h2>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <p className="text-[0.9375rem] leading-[1.75] text-zinc-700">{children}</p>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-[0.8125rem] leading-relaxed text-zinc-500">{children}</p>;
}

export function OwnWords({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <figure className="border-l-2 border-[#92753a]/35 pl-4">
      <blockquote className="text-[0.9375rem] leading-[1.75] text-zinc-700">{children}</blockquote>
      {source ? <figcaption className="mt-2 text-[0.75rem] text-zinc-400">{source}</figcaption> : null}
    </figure>
  );
}

const statusTone = {
  oppet: "border-[#92753a]/25 bg-[#92753a]/8 text-[#7d6432]",
  pagar: "border-zinc-300 bg-white text-zinc-700",
  genomfort: "border-emerald-700/18 bg-emerald-700/7 text-emerald-800",
} as const;

export function StatusPill({ status, children }: { status: keyof typeof statusTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium ${statusTone[status]}`}
    >
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[#e6e0d3] bg-[#fbfaf7] px-4 py-5 text-[0.875rem] leading-relaxed text-zinc-500">
      {children}
    </p>
  );
}
