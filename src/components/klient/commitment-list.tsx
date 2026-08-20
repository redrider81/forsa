"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusControl from "@/components/klient/status-control";
import { Empty, MetaLabel, SectionTitle, ZoneTag, klientButtonSmClass } from "@/components/klient/klient-ui";
import type { CommitmentStatus } from "@/lib/portal/types";

export type ClientCommitment = {
  id: string;
  text: string;
  dueLabel: string;
  status: CommitmentStatus;
  clientNote?: string;
  sessionLabel?: string;
  completedAt?: string;
};

function sortByRelevance(items: ClientCommitment[]): ClientCommitment[] {
  const statusOrder: Record<CommitmentStatus, number> = {
    pagar: 0,
    oppet: 1,
    genomfort: 2,
  };

  return [...items].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
  });
}

function selectOverviewCommitments(
  items: ClientCommitment[],
  limit: number,
): { visible: ClientCommitment[]; hidden: ClientCommitment[] } {
  const sorted = sortByRelevance(items);
  const ongoing = sorted.filter((item) => item.status === "pagar");
  const open = sorted.filter((item) => item.status === "oppet");
  const completed = sorted.filter((item) => item.status === "genomfort");

  const picked: ClientCommitment[] = [];
  for (const item of [...ongoing, ...open, ...completed]) {
    if (picked.length >= limit) break;
    if (!picked.some((entry) => entry.id === item.id)) picked.push(item);
  }

  const hidden = sorted.filter((item) => !picked.some((entry) => entry.id === item.id));
  return { visible: picked, hidden };
}

type Props = {
  commitments: ClientCommitment[];
  activeCount: number;
  /** When set, only the most relevant commitments are shown until expanded. */
  overviewLimit?: number;
};

/** Klientägda åtaganden. Klienten uppdaterar själv — inget prestationsspråk. */
export default function CommitmentList({ commitments, activeCount, overviewLimit }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => sortByRelevance(commitments), [commitments]);
  const overview = useMemo(
    () => (overviewLimit ? selectOverviewCommitments(commitments, overviewLimit) : null),
    [commitments, overviewLimit],
  );

  const displayed =
    overviewLimit && overview && !expanded ? overview.visible : sorted;
  const hiddenCount = overview?.hidden.length ?? 0;

  async function update(id: string, status: CommitmentStatus, clientNote?: string) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch("/api/klient/atagande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentId: id, status, clientNote }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att spara just nu. Försök igen.");
      } else {
        setNoteFor(null);
        setNote("");
        router.refresh();
      }
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
    } finally {
      setBusyId(null);
    }
  }

  const activeLabel =
    activeCount === 0
      ? "Inga aktiva just nu"
      : activeCount === 1
        ? "1 aktivt just nu"
        : `${activeCount} aktiva just nu`;

  return (
    <>
      <ZoneTag>Aktuellt fokus</ZoneTag>
      <SectionTitle id="commitments-heading">Dina åtaganden</SectionTitle>
      <p className="mt-1.5 text-[0.8125rem] text-zinc-500">{activeLabel}</p>

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        {displayed.length === 0 ? (
          <Empty>Inga aktuella åtaganden just nu.</Empty>
        ) : (
          <ul className="divide-y divide-[var(--klient-border-muted)]">
            {displayed.map((commitment) => (
              <li
                key={commitment.id}
                className="py-4 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-zinc-50/40 md:px-2 md:-mx-2 md:rounded-lg motion-reduce:transition-none"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5">
                  <p className="flex-1 text-[0.9375rem] font-medium leading-[1.6] text-zinc-900">
                    {commitment.text}
                  </p>

                  <StatusControl
                    commitmentId={commitment.id}
                    status={commitment.status}
                    disabled={busyId === commitment.id}
                    align="right"
                    onChange={(nextStatus) =>
                      void update(commitment.id, nextStatus, commitment.clientNote)
                    }
                  />
                </div>

                {(commitment.sessionLabel || commitment.dueLabel) && (
                  <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2">
                    {commitment.sessionLabel ? (
                      <div>
                        <MetaLabel>Kopplat till</MetaLabel>
                        <dd className="mt-0.5 text-[0.8125rem] text-zinc-500">
                          {commitment.sessionLabel}
                        </dd>
                      </div>
                    ) : null}
                    {commitment.dueLabel ? (
                      <div>
                        <MetaLabel>Tidsram</MetaLabel>
                        <dd className="mt-0.5 text-[0.8125rem] text-zinc-500">
                          {commitment.dueLabel}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                )}

                {commitment.clientNote ? (
                  <div className="mt-2.5">
                    <MetaLabel>Notering</MetaLabel>
                    <p className="mt-0.5 text-[0.875rem] leading-relaxed text-zinc-500">
                      ”{commitment.clientNote}”
                    </p>
                  </div>
                ) : null}

                {noteFor === commitment.id ? (
                  <div className="mt-3">
                    <label htmlFor={`note-${commitment.id}`} className="sr-only">
                      Kort reflektion om åtagandet
                    </label>
                    <textarea
                      id={`note-${commitment.id}`}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      placeholder="Kort notering."
                      className="w-full resize-y rounded-xl border border-[#e6e0d3] bg-white px-4 py-3 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
                    />
                    <button
                      type="button"
                      onClick={() => void update(commitment.id, commitment.status, note)}
                      className={`mt-4 ${klientButtonSmClass}`}
                    >
                      Spara
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setNoteFor(commitment.id);
                      setNote(commitment.clientNote ?? "");
                    }}
                    className={`mt-5 ${klientButtonSmClass}`}
                  >
                    {commitment.clientNote ? "Ändra notering" : "Lägg till notering"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {overviewLimit && hiddenCount > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className={`mt-6 ${klientButtonSmClass}`}
          >
            {expanded ? "Visa färre" : `Visa alla åtaganden (${commitments.length})`}
          </button>
        ) : null}
      </div>
    </>
  );
}
