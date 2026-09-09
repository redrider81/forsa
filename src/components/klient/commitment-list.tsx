"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusControl from "@/components/klient/status-control";
import {
  BentoEmpty,
  BentoLabel,
  BentoTitle,
  bentoQuietLinkClass,
} from "@/components/klient/bento";
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
      <div>
        <BentoLabel>Aktuellt fokus</BentoLabel>
        <BentoTitle id="commitments-heading" className="mt-2.5">
          Dina åtaganden
        </BentoTitle>
        <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-stone-600">{activeLabel}</p>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-stone-700">
          {error}
        </p>
      ) : null}

      <div className="mt-7">
        {displayed.length === 0 ? (
          <BentoEmpty>Inga aktuella åtaganden just nu.</BentoEmpty>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-3">
            {displayed.map((commitment) => (
              <li key={commitment.id} className="klient-tile flex flex-col p-5 md:p-6">
                {/* Kontext först och tyst, sedan åtagandet självt. */}
                {commitment.sessionLabel || commitment.dueLabel ? (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-stone-500">
                    {commitment.sessionLabel ? (
                      <span className="font-medium text-stone-600">{commitment.sessionLabel}</span>
                    ) : null}
                    {commitment.sessionLabel && commitment.dueLabel ? (
                      <span aria-hidden="true" className="text-stone-300">
                        ·
                      </span>
                    ) : null}
                    {commitment.dueLabel ? (
                      <span>{commitment.dueLabel}</span>
                    ) : null}
                  </p>
                ) : null}

                <p className="mt-3 text-[0.9375rem] font-medium leading-[1.55] tracking-[-0.005em] text-stone-900">
                  {commitment.text}
                </p>

                {commitment.clientNote ? (
                  <p className="klient-rule--quiet mt-4 pl-3.5 text-[0.875rem] leading-[1.7] text-stone-600">
                    {commitment.clientNote}
                  </p>
                ) : null}

                {noteFor === commitment.id ? (
                  <div className="klient-swap mt-5">
                    <label htmlFor={`note-${commitment.id}`} className="sr-only">
                      Kort reflektion om åtagandet
                    </label>
                    <textarea
                      id={`note-${commitment.id}`}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      placeholder="Kort notering."
                      className="w-full resize-y rounded-[var(--klient-radius-control)] border border-[var(--klient-border-muted)] bg-white px-3.5 py-3 text-[0.9375rem] leading-[1.7] text-stone-900 placeholder:text-stone-400 focus:border-[var(--klient-accent-gold-line)] focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)]"
                    />
                    <button
                      type="button"
                      onClick={() => void update(commitment.id, commitment.status, note)}
                      className={`mt-3 ${bentoQuietLinkClass}`}
                    >
                      Spara
                    </button>
                  </div>
                ) : null}

                {/* Status och åtgärd delar en tyst fot — inte en verktygsrad. */}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--klient-border-hairline)] pt-4 md:pt-5">
                  <StatusControl
                    commitmentId={commitment.id}
                    status={commitment.status}
                    disabled={busyId === commitment.id}
                    align="left"
                    compact
                    onChange={(nextStatus) =>
                      void update(commitment.id, nextStatus, commitment.clientNote)
                    }
                  />

                  {noteFor === commitment.id ? null : (
                    <button
                      type="button"
                      onClick={() => {
                        setNoteFor(commitment.id);
                        setNote(commitment.clientNote ?? "");
                      }}
                      className="shrink-0 rounded-full px-1 text-[0.8125rem] font-medium text-stone-500 underline decoration-[var(--klient-border-muted)] decoration-1 underline-offset-4 transition-colors duration-200 hover:text-[var(--klient-accent-gold-muted)] hover:decoration-[var(--klient-accent-gold-line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none"
                    >
                      {commitment.clientNote ? "Ändra notering" : "Lägg till notering"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {overviewLimit && hiddenCount > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className={`mt-6 ${bentoQuietLinkClass}`}
          >
            {expanded ? "Visa färre" : `Visa alla åtaganden (${commitments.length})`}
          </button>
        ) : null}
      </div>
    </>
  );
}
