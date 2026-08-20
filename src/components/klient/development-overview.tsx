import Link from "next/link";
import { Chapter, ZoneTag } from "@/components/klient/klient-ui";

type StatProps = {
  value: number;
  label: string;
  href?: string;
};

function StatMetric({ value, label, href }: StatProps) {
  const content = (
    <>
      <p className="text-center text-[2rem] font-medium tabular-nums leading-none tracking-tight text-zinc-900 md:text-[2.25rem]">
        {value}
      </p>
      <p className="mt-2 text-center text-[0.8125rem] leading-snug text-zinc-600">{label}</p>
    </>
  );

  const interactiveClass =
    "group block px-3 py-3 text-center transition-[background-color,box-shadow] duration-150 hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/12 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-surface-neutral)] motion-reduce:transition-none md:py-4";

  if (href?.startsWith("#")) {
    return (
      <a href={href} className={interactiveClass}>
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={interactiveClass}>
        {content}
      </Link>
    );
  }

  return <div className="px-3 py-3 text-center md:py-4">{content}</div>;
}

type Props = {
  completedSessions: number;
  activeCommitments: number;
  completedCommitments: number;
  reflections: number;
};

/** Overview band — kompakt statistik med tydlig grid och dividers. */
export default function DevelopmentOverview({
  completedSessions,
  activeCommitments,
  completedCommitments,
  reflections,
}: Props) {
  const metrics = [
    { value: completedSessions, label: "Genomförda sessioner", href: "/klient/sessioner" },
    { value: activeCommitments, label: "Aktiva åtaganden", href: "#aktuellt-fokus" },
    { value: completedCommitments, label: "Genomförda åtaganden", href: "#aktuellt-fokus" },
    { value: reflections, label: "Reflektioner", href: "/klient/reflektioner" },
  ] as const;

  return (
    <Chapter surface="neutral" aria-labelledby="development-overview-heading">
      <ZoneTag tone="neutral">Översikt</ZoneTag>
      <h2 id="development-overview-heading" className="sr-only">
        Utveckling i korthet
      </h2>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-[var(--klient-border-muted)]">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`${index >= 2 ? "border-t border-[var(--klient-border-muted)] pt-1 md:border-t-0 md:pt-0" : ""} ${index % 2 === 1 ? "border-l border-[var(--klient-border-muted)] md:border-l-0" : ""}`}
          >
            <StatMetric value={metric.value} label={metric.label} href={metric.href} />
          </div>
        ))}
      </div>
    </Chapter>
  );
}
