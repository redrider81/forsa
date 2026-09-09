import Link from "next/link";
import { FileText, MessageSquare, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import type { CommitmentStatus } from "@/lib/portal/types";

/**
 * Bento-primitiver för klientens översikt.
 *
 * Additivt lager. `klient-ui.tsx` lämnas orört eftersom coachens klientvy
 * (/cvb-base/klienter/[id]/klientvy) delar de primitiverna.
 */

type CardTone = "primary" | "strategic" | "reflection" | "neutral" | "quiet";

const toneClass: Record<CardTone, string> = {
  primary: "",
  strategic: "klient-card--strategic",
  reflection: "klient-card--reflection",
  neutral: "klient-card--neutral",
  quiet: "klient-card--quiet",
};

/** Bento-kort. Mjukt glas, stor radie, tunn lysande kant. */
export function BentoCard({
  children,
  tone = "primary",
  className = "",
  padding = "regular",
  reveal,
  lift = false,
  id,
  "aria-labelledby": ariaLabelledby,
}: {
  children: ReactNode;
  tone?: CardTone;
  className?: string;
  padding?: "regular" | "spacious" | "compact";
  /** 0–7. Ger en dämpad inträdesförskjutning. */
  reveal?: number;
  lift?: boolean;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const paddingClass =
    padding === "spacious"
      ? "p-6 md:p-8 lg:p-9"
      : padding === "compact"
        ? "p-5 md:p-6"
        : "p-5 md:p-7";

  const revealClass =
    reveal === undefined ? "" : `klient-reveal klient-reveal--${Math.min(reveal, 7)}`;

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`klient-card ${toneClass[tone]} ${lift ? "klient-card--lift" : ""} ${paddingClass} ${revealClass} ${className}`
        .replace(/\s+/g, " ")
        .trim()}
    >
      {children}
    </section>
  );
}

/** Versal mikroetikett. Sans, spärrad, mycket tyst. */
export function BentoLabel({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "gold";
  className?: string;
}) {
  const tones = {
    muted: "text-stone-500",
    gold: "text-[var(--klient-accent-gold-muted)]",
  };
  return (
    <p
      className={`text-[0.6875rem] font-semibold uppercase tracking-[0.16em] ${tones[tone]} ${className}`.trim()}
    >
      {children}
    </p>
  );
}

/**
 * Fältetikett i sentence case. Används för fältnamn inuti ett kort
 * (t.ex. "Fokus inför sessionen"), där versal-spärrad text bara läses
 * som brus.
 */
export function BentoFieldLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-[0.8125rem] font-medium text-stone-600 ${className}`.trim()}>{children}</p>
  );
}

/** Metadatarad: tid, plats, koppling. */
export function BentoMeta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-[0.8125rem] leading-relaxed text-stone-500 ${className}`.trim()}>
      {children}
    </p>
  );
}

/** Rubrik i serif — datum, riktning, betydelsebärande påståenden. */
export function BentoSerif({
  children,
  id,
  size = "regular",
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  id?: string;
  size?: "regular" | "large";
  className?: string;
  as?: "h2" | "h3" | "p";
}) {
  const sizeClass =
    size === "large"
      ? "text-[1.75rem] leading-[1.12] md:text-[2.25rem] lg:text-[2.5rem]"
      : "text-[1.25rem] leading-[1.2] md:text-[1.5rem]";
  return (
    <Tag
      id={id}
      className={`font-serif font-medium tracking-[-0.015em] text-stone-900 ${sizeClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

/** Rubrik i sans för funktionella moduler. */
export function BentoTitle({
  children,
  id,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      id={id}
      className={`text-[1.1875rem] font-medium leading-snug tracking-[-0.02em] text-stone-900 md:text-[1.25rem] ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

/** Tyst hårfin avdelare inuti ett kort. */
export function BentoDivider({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`border-0 border-t border-[var(--klient-border-hairline)] ${className}`.trim()}
    />
  );
}

/** Inre panel — lugn yta för fokus/underlag inuti ett kort. */
export function BentoInset({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`klient-inset px-4 py-4 md:px-5 md:py-5 ${className}`.trim()}>{children}</div>
  );
}

/**
 * Citatblock — klientens egna ord. Redaktionell guldlinjal i stället för
 * ännu en inramad ruta, så citatet läses som text och inte som en widget.
 */
export function BentoQuote({
  children,
  source,
  className = "",
  clamp = false,
  tone = "rule",
}: {
  children: ReactNode;
  source?: string;
  className?: string;
  /** Förhandsvisning — begränsa höjden utan att ändra innehållet. */
  clamp?: boolean;
  /** "rule" = guldlinjal, "quiet" = neutral linjal. */
  tone?: "rule" | "quiet";
}) {
  return (
    <figure
      className={`${tone === "rule" ? "klient-rule" : "klient-rule--quiet"} pl-5 md:pl-6 ${className}`.trim()}
    >
      <blockquote
        className={`font-serif text-[1.0625rem] leading-[1.72] text-stone-700 md:text-[1.125rem] ${
          clamp ? "line-clamp-3" : ""
        }`.trim()}
      >
        {children}
      </blockquote>
      {source ? (
        <figcaption className="mt-3.5 text-[0.8125rem] tracking-[0.01em] text-stone-600">
          {source}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Tomt tillstånd — streckad, varm, aldrig larmande. */
export function BentoEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--klient-radius-nested)] border border-dashed border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] px-4 py-5 text-[0.875rem] leading-relaxed text-stone-500">
      {children}
    </p>
  );
}

/**
 * Återhållsam statusindikator. Samma semantik och färgfamiljer som
 * `StatusBadge` — men tonad i stället för fylld, så färgen kommunicerar
 * tillstånd utan att dekorera kortet.
 */
const quietStatusTone: Record<CommitmentStatus, { dot: string; text: string; shell: string }> = {
  pagar: {
    dot: "bg-emerald-600",
    text: "text-emerald-800",
    shell: "border-emerald-700/18 bg-emerald-600/8",
  },
  oppet: {
    dot: "bg-orange-500",
    text: "text-orange-800",
    shell: "border-orange-500/22 bg-orange-500/8",
  },
  genomfort: {
    dot: "bg-emerald-700/55",
    text: "text-emerald-900/70",
    shell: "border-emerald-800/12 bg-emerald-800/5",
  },
};

const quietStatusLabel: Record<CommitmentStatus, string> = {
  pagar: "Pågående",
  oppet: "Ej startat",
  genomfort: "Genomfört",
};

export function QuietStatusPill({ status }: { status: CommitmentStatus }) {
  const tone = quietStatusTone[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium ${tone.shell} ${tone.text}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {quietStatusLabel[status]}
    </span>
  );
}

/** Tyst navigationslänk ut ur en modul. */
export const bentoQuietLinkClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--klient-border-muted)] bg-white/55 px-4 py-2 text-[0.8125rem] font-medium text-stone-700 backdrop-blur-sm transition-[background-color,border-color,color] duration-200 hover:border-[var(--klient-accent-gold-line)] hover:bg-white/90 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none";

/** Navigationslänk. Text plus pil, ingen pillform. */
export const bentoNavLinkClass =
  "group inline-flex min-h-9 items-center gap-1.5 rounded-[var(--klient-radius-control)] text-[0.875rem] font-medium text-[var(--klient-accent-gold-muted)] underline decoration-[var(--klient-accent-gold-line)] decoration-1 underline-offset-[5px] transition-colors duration-200 hover:decoration-[var(--klient-accent-gold)] hover:text-[var(--klient-accent-gold-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none";

export function BentoQuietLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${bentoNavLinkClass} ${className}`.trim()}>
      {children}
      <span
        aria-hidden="true"
        className="text-[0.9em] leading-none transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
      >
        →
      </span>
    </Link>
  );
}

/** Primär åtgärd i ett kort — varm, låg kontrast, tydlig träffyta. */
export const bentoPrimaryActionClass =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--klient-accent-gold-line)] bg-[var(--klient-accent-gold-muted)] px-6 py-3 text-sm font-medium text-[#fdfbf7] shadow-[0_1px_2px_rgba(72,60,44,0.08),0_10px_24px_-14px_rgba(146,117,58,0.7)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[var(--klient-accent-gold-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto";

export function BentoPrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${bentoPrimaryActionClass} ${className}`.trim()}>
      {children}
    </Link>
  );
}

/**
 * Kompakt nyckeltal i historikmodulen. Medvetet lågmält — talen ska väga
 * mindre än den kronologiska listan under dem.
 */
export function BentoStat({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="block text-[1.375rem] font-medium tabular-nums leading-none tracking-tight text-stone-700 md:text-[1.5rem]">
        {value}
      </span>
      <span className="mt-2 block text-[0.75rem] leading-snug tracking-[0.01em] text-stone-600">
        {label}
      </span>
    </>
  );

  const interactive =
    "klient-row group block px-2.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none";

  if (href?.startsWith("#")) {
    return (
      <a href={href} className={interactive}>
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={interactive}>
        {content}
      </Link>
    );
  }
  return <div className="px-2.5 py-2.5">{content}</div>;
}

/** Tyst dokumentmarkör för materialrader. Rent presentationsvärde. */
export function BentoDocCue({ variant = "file" }: { variant?: "file" | "note" | "shared" }) {
  const Icon = variant === "note" ? StickyNote : variant === "shared" ? MessageSquare : FileText;
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--klient-radius-control)] border border-[var(--klient-border-hairline)] bg-[var(--klient-surface-inset)] text-[var(--klient-accent-gold-muted)]"
    >
      <Icon size={15} strokeWidth={1.5} />
    </span>
  );
}
