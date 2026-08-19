"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardTitle, Label } from "@/components/klient/klient-ui";

const questions = [
  {
    key: "focus" as const,
    section: "Fokus inför nästa session",
    label: "Vad vill du prioritera i nästa samtal?",
  },
  {
    key: "desiredOutcome" as const,
    section: "Önskat resultat",
    label: "Vad behöver vara tydligare efter sessionen?",
  },
  {
    key: "changed" as const,
    section: "Förändring sedan sist",
    label: "Vad har förändrats sedan föregående session?",
  },
  {
    key: "followUp" as const,
    section: "Uppföljning",
    label: "Vad vill du att Carolina särskilt följer upp?",
  },
];

export type PrepValues = Record<(typeof questions)[number]["key"], string>;

/**
 * Klientens förberedelse inför nästa samtal. Klientägd information som blir
 * synlig i Carolinas förberedelse så snart den sparats.
 */
export default function PrepForm({ initial }: { initial: PrepValues }) {
  const router = useRouter();
  const [values, setValues] = useState<PrepValues>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (Object.values(values).every((value) => value.trim().length === 0)) {
      setError("Fyll i minst ett fält.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/klient/forberedelse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att spara just nu. Försök igen.");
        setSaving(false);
        return;
      }
      setSaved(true);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
      setSaving(false);
    }
  }

  return (
    <Card>
      <Label>Förberedelse</Label>
      <CardTitle>Inför nästa session</CardTitle>

      <div className="mt-6 space-y-6">
        {questions.map((question) => (
          <div key={question.key}>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#92753a]">
              {question.section}
            </p>
            <label
              htmlFor={`prep-${question.key}`}
              className="mt-2 block text-[0.9375rem] font-medium leading-snug text-zinc-800"
            >
              {question.label}
            </label>
            <textarea
              id={`prep-${question.key}`}
              value={values[question.key]}
              onChange={(event) => {
                setValues((current) => ({ ...current, [question.key]: event.target.value }));
                setSaved(false);
              }}
              rows={3}
              className="mt-2.5 w-full resize-y rounded-2xl border border-[#e6e0d3] bg-[#fbfaf7] px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
            />
          </div>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 disabled:bg-zinc-300 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {saving ? "Sparar…" : "Spara förberedelse"}
      </button>

      {saved ? (
        <p role="status" className="mt-3.5 text-[0.8125rem] leading-relaxed text-[#7d6432]">
          Förberedelse sparad och delad med Carolina.
        </p>
      ) : null}
    </Card>
  );
}
