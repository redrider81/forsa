import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Delade portalprimitiver. Följer samma formspråk som cvbcoaching.se:
 * varm off-white, zinc-skala, guldaccent #92753a, rundade ytor, låg täthet.
 */

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#92753a]">
      {children}
    </p>
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
      className={`rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04)] md:p-6 ${className}`}
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
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {label ? <SectionLabel>{label}</SectionLabel> : null}
        <h2 className={`${label ? "mt-2.5" : ""} text-[1.3rem] font-medium leading-[1.25] tracking-tight text-zinc-900`}>
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const toneClass = {
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
  open: "border-[#92753a]/25 bg-[#92753a]/8 text-[#7d6432]",
  progress: "border-zinc-300 bg-white text-zinc-700",
  done: "border-emerald-700/18 bg-emerald-700/7 text-emerald-800",
  private: "border-zinc-800/15 bg-zinc-900/5 text-zinc-700",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium tracking-[0.04em] ${toneClass[tone]}`}
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
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-[#f4f2ed] font-medium tracking-[0.06em] text-zinc-600 ${sizeClass}`}
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
      className="group flex items-center gap-4 rounded-xl px-3 py-3.5 -mx-3 transition-colors duration-200 hover:bg-[#f4f2ed]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
  return <hr className="my-1 border-t border-zinc-200/80" />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-200 bg-[#faf9f7] px-4 py-5 text-[0.875rem] leading-relaxed text-zinc-500">
      {children}
    </p>
  );
}

export function QuoteBlock({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <figure className="border-l-2 border-[#92753a]/35 pl-4">
      <blockquote className="text-[0.9875rem] leading-[1.7] text-zinc-700">{children}</blockquote>
      {source ? (
        <figcaption className="mt-2 text-[0.75rem] text-zinc-400">{source}</figcaption>
      ) : null}
    </figure>
  );
}

export function DefinitionList({ items }: { items: Array<{ term: string; value: string }> }) {
  return (
    <dl className="divide-y divide-zinc-200/70">
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
        className={`${label ? "mt-3" : ""} text-[1.75rem] font-medium leading-[1.15] tracking-tight text-balance text-zinc-900 md:text-[2.1rem]`}
      >
        {title}
      </h1>
      {lead ? (
        <p className="mt-3.5 max-w-2xl text-[1rem] leading-[1.7] text-zinc-600">{lead}</p>
      ) : null}
    </header>
  );
}
