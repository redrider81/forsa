"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardTitle, Label, klientButtonClass } from "@/components/klient/klient-ui";
import type { CoachingMaterial } from "@/lib/portal/types";

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

type PrepFormProps = {
  initial: PrepValues;
  materials?: CoachingMaterial[];
};

/**
 * Klientens förberedelse inför nästa samtal. Klientägd information som blir
 * synlig i Carolinas förberedelse så snart den sparats.
 */
export default function PrepForm({ initial, materials = [] }: PrepFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PrepValues>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState<string | null>(null);

  const ownMaterials = materials.filter(
    (item) => item.source === "client_upload" || item.source === "client_note",
  );

  async function toggleNextSession(material: CoachingMaterial) {
    setLinkBusy(material.id);
    setError(null);
    const nextLink = material.linkType === "next_session" ? "none" : "next_session";
    try {
      const response = await fetch("/api/klient/material", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: material.id,
          linkType: nextLink,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att uppdatera kopplingen.");
        setLinkBusy(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu.");
    } finally {
      setLinkBusy(null);
    }
  }

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
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--klient-button-text)]">
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
              className="mt-2.5 w-full resize-y rounded-2xl border border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
            />
          </div>
        ))}
      </div>

      {ownMaterials.length > 0 ? (
        <div className="mt-8 border-t border-[#ece7dc] pt-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--klient-button-text)]">
            Material jag vill ta med
          </p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-500">
            Välj material du vill koppla till nästa session.
          </p>
          <ul className="mt-4 space-y-3">
            {ownMaterials.map((item) => (
              <li key={item.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={item.linkType === "next_session"}
                    disabled={linkBusy === item.id}
                    onChange={() => void toggleNextSession(item)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-medium text-zinc-900">
                      {item.title}
                    </span>
                    {item.linkType === "next_session" ? (
                      <span className="mt-0.5 block text-[0.75rem] text-[#7d6432]">
                        Kopplat till nästa session
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className={`mt-6 w-full sm:w-auto ${klientButtonClass}`}
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
