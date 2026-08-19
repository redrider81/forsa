"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardTitle, Label, Muted } from "@/components/klient/klient-ui";

/** Klienten skriver en egen reflektion. Ingen mall, inga betyg — hennes egna ord. */
export default function ReflectionComposer({ prompt }: { prompt?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (text.trim().length < 5) {
      setError("Skriv några rader först.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/klient/reflektion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, prompt }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att spara just nu. Försök igen.");
        setSaving(false);
        return;
      }
      setText("");
      setSaved(true);
      setOpen(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Card>
        <Label>Reflektion</Label>
        <CardTitle>Ny reflektion</CardTitle>
        <div className="mt-2.5">
          <Muted>Dokumentera en reflektion mellan sessionerna. Delas endast med Carolina.</Muted>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSaved(false);
          }}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Ny reflektion
        </button>
        {saved ? (
          <p role="status" className="mt-3.5 text-[0.8125rem] text-[#7d6432]">
            Reflektion sparad.
          </p>
        ) : null}
      </Card>
    );
  }

  return (
    <Card>
      <Label>Ny reflektion</Label>
      <CardTitle>{prompt ?? "Ny reflektion"}</CardTitle>

      <label htmlFor="reflection-text" className="sr-only">
        Din reflektion
      </label>
      <textarea
        id="reflection-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={7}
        autoFocus
        placeholder="Dina egna ord."
        className="mt-5 w-full resize-y rounded-2xl border border-[#e6e0d3] bg-[#fbfaf7] px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
      />

      {error ? (
        <p role="alert" className="mt-3 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 disabled:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {saving ? "Sparar…" : "Spara"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
        >
          Avbryt
        </button>
      </div>
    </Card>
  );
}
