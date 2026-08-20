import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cvbStatusTone } from "@/lib/portal/status-tones";

/**
 * Delade portalprimitiver. Följer samma formspråk som klientportalen:
 * ljusgrå sida, vita kort, kapslar och pill-knappar.
 */

export const portalButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] px-6 py-3 text-sm font-medium text-[var(--klient-button-text)] transition-colors duration-150 hover:bg-[var(--klient-button-bg-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalAiPrepareButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-medium text-emerald-800 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalAiButtonSmClass =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[0.8125rem] font-medium text-emerald-800 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalAiChipClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[0.8125rem] font-medium text-emerald-800 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none";

/** Solid black AI sparkle — filled silhouette, not stroke icon. */
export function AiSparkleIcon({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#000000"
        d="M9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5L9 4z"
      />
      <path
        fill="#000000"
        d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9z"
      />
    </svg>
  );
}

type AiActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  compact?: boolean;
};

/** Primary/secondary coach-portal control that triggers AI. */
export function AiActionButton({
  children,
  className = "",
  compact = false,
  type = "button",
  ...props
}: AiActionButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`${compact ? portalAiButtonSmClass : portalAiPrepareButtonClass} ${className}`.trim()}
    >
      {children}
      <AiSparkleIcon className={compact ? "size-4" : undefined} />
    </button>
  );
}

type AiActionLinkProps = ComponentProps<typeof Link>;

/** Link styled like the AI action button — e.g. navigate to prep flow. */
export function AiActionLink({ children, className = "", ...props }: AiActionLinkProps) {
  return (
    <Link {...props} className={`${portalAiPrepareButtonClass} ${className}`.trim()}>
      {children}
      <AiSparkleIcon />
    </Link>
  );
}

export const portalButtonSmClass =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] px-4 py-2 text-[0.8125rem] font-medium text-[var(--klient-button-text)] transition-colors duration-150 hover:bg-[var(--klient-button-bg-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalLinkButtonClass =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-900 bg-white px-4 py-2 text-[0.8125rem] font-medium text-zinc-900 transition-colors duration-150 hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalPageStackClass = "space-y-8 md:space-y-10";

export const portalChipClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] px-3.5 py-2 text-[0.8125rem] text-zinc-700 transition-colors duration-150 hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalFieldClass =
  "w-full rounded-xl border border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.9375rem] text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

export const portalTextareaClass = `${portalFieldClass} resize-y leading-[1.7]`;

export const portalInsetClass =
  "rounded-2xl border border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] p-4 md:p-5";

export const portalOutlineButtonClass =
  "inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors duration-150 hover:border-zinc-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalGhostButtonClass =
  "inline-flex min-h-10 items-center rounded-full px-4 py-2 text-[0.8125rem] font-medium text-zinc-500 transition-colors hover:text-zinc-800";

export const portalQuietLinkClass =
  "inline-flex items-center gap-1 text-[0.8125rem] font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export const portalSegmentClass =
  "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-button-border)] focus-visible:ring-offset-2 motion-reduce:transition-none";

export const portalSegmentActiveClass =
  "border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] text-[var(--klient-button-text)]";

export const portalSegmentInactiveClass =
  "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 inline-flex w-fit items-center rounded-md border border-[var(--klient-button-border)] bg-[var(--klient-button-bg)] px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--klient-button-text)]">
      {children}
    </span>
  );
}

export function Panel({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-[var(--klient-border-soft)] bg-white p-5 shadow-[var(--klient-shadow-soft)] md:p-7 min-w-0 overflow-hidden ${className}`}
    >
      {children}
    </Tag>
  );
}

export function PanelHeading({
  label,
  title,
  action,
}: {
  label?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <PortalSectionHeader label={label} title={title} action={action} />
  );
}

export function PortalSectionHeader({
  label,
  title,
  context,
  action,
}: {
  label?: string;
  title: string;
  context?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        {label ? <SectionLabel>{label}</SectionLabel> : null}
        <h2
          className={`${label ? "mt-3.5" : ""} text-[1.35rem] font-medium leading-[1.25] tracking-tight text-zinc-900 md:text-[1.45rem]`}
        >
          {title}
        </h2>
        {context ? (
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-zinc-600">{context}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const toneClass = {
  neutral: cvbStatusTone.neutral,
  open: cvbStatusTone.action,
  progress: cvbStatusTone.active,
  done: cvbStatusTone.completed,
  private: cvbStatusTone.private,
} as const;

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClass;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium tracking-[0.04em] ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function MetaRow({ items }: { items: Array<string | null | undefined> }) {
  const visible = items.filter((item): item is string => Boolean(item));
  if (visible.length === 0) return null;
  return (
    <p className="text-[0.8125rem] leading-relaxed text-zinc-500">
      {visible.map((item, index) => (
        <span key={item}>
          {index > 0 ? <span aria-hidden="true" className="px-1.5 text-zinc-300">·</span> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-[0.6875rem]" : size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--klient-border-soft)] bg-[var(--klient-text-block-bg)] font-medium tracking-[0.06em] text-zinc-600 ${sizeClass}`}
    >
      {initials}
    </span>
  );
}

export function RowLink({
  href,
  title,
  subtitle,
  meta,
  trailing,
  leading,
  multiline = false,
}: {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
  trailing?: ReactNode;
  leading?: ReactNode;
  /** Låter titeln brytas över två rader i stället för att kapas. */
  multiline?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-6 rounded-xl px-3 py-3.5 -mx-3 transition-colors duration-200 hover:bg-[var(--klient-text-block-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[0.9875rem] font-medium leading-snug text-zinc-900 ${
            multiline ? "line-clamp-2" : "truncate"
          }`}
        >
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[0.8125rem] leading-snug text-zinc-500">
            {subtitle}
          </span>
        ) : null}
        {meta ? (
          <span className="mt-1 block text-[0.75rem] leading-snug text-zinc-400">{meta}</span>
        ) : null}
      </span>
      {trailing ?? (
        <svg
          aria-hidden="true"
          viewBox="0 0 14 14"
          className="h-3.5 w-3.5 shrink-0 text-zinc-300 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-500"
          fill="none"
        >
          <path d="M4 2.5 8.5 7 4 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Link>
  );
}

export function Divider() {
  return <hr className="my-1 border-t border-[var(--klient-border-muted)]" />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-5 text-[0.875rem] leading-relaxed text-zinc-500">
      {children}
    </p>
  );
}

export function QuoteBlock({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <figure className="rounded-xl border border-[var(--klient-border-soft)]/70 bg-[var(--klient-text-block-bg)] px-5 py-4 md:px-6 md:py-5">
      <blockquote className="font-serif text-[1.0625rem] leading-[1.72] text-zinc-700">{children}</blockquote>
      {source ? (
        <figcaption className="mt-2.5 text-[0.75rem] text-zinc-600">{source}</figcaption>
      ) : null}
    </figure>
  );
}

export function DefinitionList({ items }: { items: Array<{ term: string; value: string }> }) {
  return (
    <dl className="divide-y divide-[var(--klient-border-muted)]">
      {items.map((item) => (
        <div key={item.term} className="py-3.5 first:pt-0 last:pb-0">
          <dt className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-400">
            {item.term}
          </dt>
          <dd className="mt-1.5 text-[0.9375rem] leading-[1.65] text-zinc-700">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PageHeading({
  label,
  title,
  lead,
}: {
  label?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="pb-2">
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <h1
        className={`${label ? "mt-3" : ""} font-serif text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2rem]`}
      >
        {title}
      </h1>
      {lead ? (
        <p className="mt-3.5 max-w-2xl text-balance text-[0.9375rem] leading-[1.65] text-zinc-600 sm:text-[1rem] sm:leading-[1.7]">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
