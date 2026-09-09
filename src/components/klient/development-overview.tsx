import {
  BentoDivider,
  BentoQuietLink,
  BentoStat,
  BentoTitle,
} from "@/components/klient/bento";
import { formatDate, formatShortDate } from "@/lib/portal/format";

type RecentSession = {
  id: string;
  number: number;
  date: string;
  clientFocus: string;
};

type Props = {
  completedSessions: number;
  activeCommitments: number;
  completedCommitments: number;
  reflections: number;
  /** Klientens startdatum — ger historiken en lugn tidsram. */
  startedAt?: string;
  /** Senast genomförda sessionerna, nyast först. Redan klientfiltrerade. */
  recentSessions?: RecentSession[];
};

/**
 * "Coaching hittills" — historisk kontext, inte KPI:er. Den kronologiska
 * listan bär tyngden; siffrorna är medvetet lågmälda. Inga ringar, procent,
 * streaks eller betyg.
 */
export default function DevelopmentOverview({
  completedSessions,
  activeCommitments,
  completedCommitments,
  reflections,
  startedAt,
  recentSessions = [],
}: Props) {
  const metrics = [
    { value: completedSessions, label: "Genomförda sessioner", href: "/klient/sessioner" },
    { value: activeCommitments, label: "Aktiva åtaganden", href: "#aktuellt-fokus" },
    { value: completedCommitments, label: "Genomförda åtaganden", href: "#aktuellt-fokus" },
    { value: reflections, label: "Reflektioner", href: "/klient/reflektioner" },
  ] as const;

  return (
    <div className="flex h-full flex-col">
      <div>
        <BentoTitle id="development-overview-heading">Din väg så här långt</BentoTitle>
        {startedAt ? (
          <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-stone-600">
            Sedan {formatDate(startedAt)}
          </p>
        ) : null}
      </div>

      {/* Kronologin väger tyngst — den ligger först och får serif. */}
      {recentSessions.length > 0 ? (
        <ol className="mt-7 flex-1 space-y-6">
          {recentSessions.map((item) => (
            <li key={item.id} className="klient-marker pl-7">
              <p className="text-[0.8125rem] text-stone-500">
                <span className="font-medium text-stone-700">Session {item.number}</span>
                <span aria-hidden="true" className="px-1.5 text-stone-300">
                  ·
                </span>
                {formatShortDate(item.date)}
              </p>
              <p className="mt-2 text-[0.9375rem] leading-[1.65] text-stone-700">
                {item.clientFocus}
              </p>
            </li>
          ))}
        </ol>
      ) : null}

      <BentoDivider className="mt-8" />

      {/* Siffrorna är kontext, inte prestation. */}
      <div className="-mx-2.5 mt-6 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
        {metrics.map((metric) => (
          <BentoStat
            key={metric.label}
            value={metric.value}
            label={metric.label}
            href={metric.href}
          />
        ))}
      </div>

      <BentoDivider className="mt-7" />
      <div className="pt-5">
        <BentoQuietLink href="/klient/sessioner">Visa alla sessioner</BentoQuietLink>
      </div>
    </div>
  );
}
