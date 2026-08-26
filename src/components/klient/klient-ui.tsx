import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { CommitmentStatus } from "@/lib/portal/types";

/** Klientportalens ytor. Lugnare och varmare än coachportalen. */

const transition = "transition-[color,background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none";

/* ---------------------------------------------------------------- surfaces */

export type ChapterSurface = "primary" | "strategic" | "reflection" | "neutral" | "open";

const chapterSurfaces: Record<Exclude<ChapterSurface, "open">, string> = {
  primary: `rounded-2xl border border-[var(--klient-border-soft)] bg-[var(--klient-surface-primary)] p-5 shadow-[var(--klient-shadow-soft)] md:p-7 ${transition}`,
  strategic: `rounded-2xl border border-[var(--klient-border-soft)]/80 bg-[var(--klient-surface-strategic)] p-5 md:p-7 ${transition}`,
  reflection: `rounded-2xl border border-[var(--klient-border-muted)]/90 bg-[var(--klient-surface-reflection)] p-5 md:p-7 ${transition}`,
  neutral: `rounded-2xl border border-[var(--klient-border-muted)]/70 bg-[var(--klient-surface-neutral)] p-5 md:p-7 ${transition}`,
};

/** Visuellt kapitel — tydlig zon med egen surface. */
export function Chapter({
  children,
  surface = "open",
  className = "",
  id,
  "aria-labelledby": ariaLabelledby,
}: {
  children: ReactNode;
  surface?: ChapterSurface;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const surfaceClass = surface === "open" ? "" : chapterSurfaces[surface];
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`${surfaceClass} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

/** Legacy card — behålls för övriga klientroutes. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[#ece7dc] bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- labels */

/** Legacy label — samma form och färg som ZoneTag. */
export function Label({ children }: { children: ReactNode }) {
  return <ZoneTag>{children}</ZoneTag>;
}

/** Legacy — mappas till ZoneTag i overview. */
export function CategoryLabel({ children }: { children: ReactNode }) {
  return <ZoneTag>{children}</ZoneTag>;
}

/** Funktionell sektionsetikett — capsule med border och ton. */
export function ZoneTag({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "neutral" | "muted";
}) {
  const tones = {
    gold: "border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] text-[var(--klient-button-text)]",
    neutral:
      "border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] text-[var(--klient-button-text)]",
    muted:
      "border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] text-[var(--klient-button-text)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Serif-rubrik — strategiska och operativa höjdpunkter. */
export function SerifHeading({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={`mt-3 font-serif text-[1.375rem] font-medium leading-[1.2] tracking-tight text-zinc-900 md:text-[1.875rem] ${className}`}
    >
      {children}
    </h2>
  );
}

/** Sektionsrubrik nivå 2. */
export function SectionTitle({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h3
      id={id}
      className={`mt-3 text-[1.125rem] font-medium leading-snug tracking-tight text-zinc-900 md:text-[1.25rem] ${className}`}
    >
      {children}
    </h3>
  );
}

/** Legacy alias. */
export function SectionHeading({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <SectionTitle id={id} className={className}>
      {children}
    </SectionTitle>
  );
}

/** Mikroetikett för metadata. */
export function MetaLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[0.625rem] font-medium uppercase tracking-[0.1em] text-zinc-400 ${className}`.trim()}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- legacy surfaces (other routes) */

export function PrimarySurface({
  children,
  className = "",
  id,
  "aria-labelledby": ariaLabelledby,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <Chapter surface="primary" id={id} aria-labelledby={ariaLabelledby} className={className}>
      {children}
    </Chapter>
  );
}

export function SecondarySurface({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Chapter surface="neutral" id={id} className={className}>
      {children}
    </Chapter>
  );
}

export function EditorialSection({
  children,
  className = "",
  id,
  bordered = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={`max-w-prose ${bordered ? "border-t border-[#ece7dc] pt-8 md:pt-9" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- content blocks */

export function InnerFocus({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--klient-border-muted)]/80 bg-[var(--klient-surface-inset)] px-4 py-4 md:px-5 md:py-5">
      <MetaLabel className="!font-bold text-zinc-900">{label}</MetaLabel>
      <div className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">{children}</div>
    </div>
  );
}

export function QuoteBlock({
  children,
  source,
}: {
  children: ReactNode;
  source?: string;
}) {
  return (
    <figure className="mt-4 rounded-xl border border-[var(--klient-border-soft)]/70 bg-[var(--klient-text-block-bg)] px-5 py-4 md:px-6 md:py-5">
      <blockquote className="font-serif text-[1.0625rem] leading-[1.72] text-zinc-700">
        {children}
      </blockquote>
      {source ? (
        <figcaption className="mt-2.5 text-[0.75rem] text-zinc-600">{source}</figcaption>
      ) : null}
    </figure>
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
    <figure className="rounded-xl border border-[var(--klient-border-soft)]/60 bg-[var(--klient-text-block-bg)] px-4 py-4 md:px-5 md:py-5">
      <blockquote className="font-serif text-[0.9375rem] leading-[1.75] text-zinc-700">
        {children}
      </blockquote>
      {source ? <figcaption className="mt-2 text-[0.75rem] text-zinc-400">{source}</figcaption> : null}
    </figure>
  );
}

const statusTone = {
  oppet: "border-orange-400 bg-orange-400 text-white",
  pagar: "border-emerald-500 bg-emerald-500 text-white",
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

const statusBadgeTone: Record<CommitmentStatus, string> = {
  pagar: "border-emerald-500 bg-emerald-500 text-white",
  oppet: "border-orange-400 bg-orange-400 text-white",
  genomfort: "border-emerald-700/20 bg-emerald-700/6 text-emerald-900",
};

const statusBadgeLabel: Record<CommitmentStatus, string> = {
  pagar: "Pågående",
  oppet: "Ej startat",
  genomfort: "Genomfört",
};

/** Status-badge för läsläge. */
export function StatusBadge({ status }: { status: CommitmentStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em] ${statusBadgeTone[status]}`}
    >
      {statusBadgeLabel[status]}
    </span>
  );
}

/** Delningsstatus för coachingmaterial. */
export function SharingBadge({
  material,
}: {
  material: import("@/lib/portal/types").CoachingMaterial;
}) {
  if (material.source === "coach_shared") {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--klient-accent-gold)]/22 bg-[var(--klient-accent-gold)]/8 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-[var(--klient-accent-gold-muted)]">
        Delat av Carolina
      </span>
    );
  }
  if (material.sharingLevel === "private") {
    return (
      <span className="inline-flex items-center rounded-full border border-zinc-300/80 bg-zinc-50 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-zinc-600">
        Privat för mig
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-300/80 bg-white px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-zinc-700">
      Delat med Carolina
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-5 text-[0.875rem] leading-relaxed text-zinc-500">
      {children}
    </p>
  );
}

/** Pill-länk — svart ram, vit bakgrund. */
export const klientLinkButtonClass =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-700 bg-white px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 motion-reduce:transition-none";

export function QuietLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${klientLinkButtonClass} ${className}`.trim()}>
      {children}
    </Link>
  );
}

/** Sekundär pill-knapp för tysta åtgärder (t.ex. Ta bort, Avböj). */
export const klientGhostButtonClass =
  "inline-flex min-h-9 items-center justify-center gap-1 rounded-full border border-[var(--klient-border-muted)] bg-white px-4 py-2 text-[0.8125rem] font-medium text-zinc-600 transition-colors duration-150 hover:border-zinc-400 hover:bg-[var(--klient-text-block-bg)] hover:text-zinc-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

/** Primär knappstil — ljus blågrå (#F0F4F5), mörk text. */
export const klientButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] px-6 py-3 text-sm font-medium text-[var(--klient-button-text)] transition-colors duration-150 hover:bg-[var(--klient-button-bg-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

/** Kompakt variant för inline-åtgärder. */
export const klientButtonSmClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] px-5 py-2.5 text-[0.8125rem] font-medium text-[var(--klient-button-text)] transition-colors duration-150 hover:bg-[var(--klient-button-bg-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

export function KlientButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button type="button" className={`${klientButtonClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${klientLinkButtonClass} w-full sm:w-auto ${className}`.trim()}>
      {children}
    </Link>
  );
}
