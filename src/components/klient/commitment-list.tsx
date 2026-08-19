"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardTitle, Empty, Label, StatusPill } from "@/components/klient/klient-ui";
import { commitmentStatusLabel } from "@/lib/portal/format";
import type { CommitmentStatus } from "@/lib/portal/types";

export type ClientCommitment = {
  id: string;
  text: string;
  dueLabel: string;
  status: CommitmentStatus;
  clientNote?: string;
};

const options: Array<{ value: CommitmentStatus; label: string }> = [
  { value: "oppet", label: "Ej startat" },
  { value: "pagar", label: "Pågående" },
  { value: "genomfort", label: "Genomfört" },
];

/** Klientägda åtaganden. Klienten uppdaterar själv — inget prestationsspråk. */
export default function CommitmentList({ commitments }: { commitments: ClientCommitment[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card>
      <Label>Mina åtaganden</Label>
      <CardTitle>Aktuella åtaganden</CardTitle>

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        {commitments.length === 0 ? (
          <Empty>Inga registrerade åtaganden.</Empty>
        ) : (
          commitments.map((commitment) => (
            <article
              key={commitment.id}
              className="border-b border-[#ece7dc] pb-6 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.9375rem] leading-[1.65] text-zinc-800">{commitment.text}</p>
                <StatusPill status={commitment.status}>
                  {commitmentStatusLabel[commitment.status]}
                </StatusPill>
              </div>
              <p className="mt-1.5 text-[0.75rem] text-zinc-400">{commitment.dueLabel}</p>

              {commitment.clientNote ? (
                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
                  ”{commitment.clientNote}”
                </p>
              ) : null}

              <div className="mt-3.5 flex flex-wrap gap-2">
                {options.map((option) => {
                  const active = commitment.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={busyId === commitment.id}
                      onClick={() => void update(commitment.id, option.value, commitment.clientNote)}
                      aria-pressed={active}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                          : "border-[#e6e0d3] bg-[#fbfaf7] text-zinc-700 hover:border-zinc-300 hover:bg-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {noteFor === commitment.id ? (
                <div className="mt-3.5">
                  <label htmlFor={`note-${commitment.id}`} className="sr-only">
                    Kort reflektion om åtagandet
                  </label>
                  <textarea
                    id={`note-${commitment.id}`}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Kort notering."
                    className="w-full resize-y rounded-2xl border border-[#e6e0d3] bg-[#fbfaf7] px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
                  />
                  <button
                    type="button"
                    onClick={() => void update(commitment.id, commitment.status, note)}
                    className="mt-2.5 inline-flex min-h-11 items-center rounded-full bg-zinc-900 px-5 py-2.5 text-[0.8125rem] font-medium text-zinc-50 transition-colors hover:bg-zinc-700"
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
                  className="mt-3 text-[0.8125rem] text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-800"
                >
                  {commitment.clientNote ? "Ändra notering" : "Lägg till notering"}
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
