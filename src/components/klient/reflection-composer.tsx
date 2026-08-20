"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Chapter,
  Label,
  SectionTitle,
  klientButtonClass,
  klientButtonSmClass,
  ZoneTag,
} from "@/components/klient/klient-ui";

type Props = {
  prompt?: string;
  /** Lighter inline prompt for the overview page. */
  variant?: "default" | "overview";
  /** Render without outer surface — parent owns the chapter zone. */
  embedded?: boolean;
};

/** Klienten skriver en egen reflektion. Ingen mall, inga betyg — hennes egna ord. */
export default function ReflectionComposer({
  prompt,
  variant = "default",
  embedded = false,
}: Props) {
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
    if (variant === "overview") {
      return (
        <div>
          <ZoneTag tone="muted">Reflektion</ZoneTag>
          <SectionTitle>Vad har hänt sedan sist?</SectionTitle>
          <p className="mt-2 max-w-prose text-[0.8125rem] leading-relaxed text-zinc-500">
            En kort reflektion mellan sessionerna. Delas endast med Carolina.
          </p>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setSaved(false);
            }}
            className={`mt-4 w-full sm:w-auto ${klientButtonClass}`}
          >
            Skriv en reflektion
          </button>
          {saved ? (
            <p role="status" className="mt-3 text-[0.8125rem] text-[#7d6432]">
              Reflektion sparad.
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <Chapter surface="primary">
        <Label>Reflektion</Label>
        <SectionTitle>Ny reflektion</SectionTitle>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-500">
          Dokumentera en reflektion mellan sessionerna. Delas endast med Carolina.
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSaved(false);
          }}
          className={`mt-4 w-full sm:w-auto ${klientButtonClass}`}
        >
          Ny reflektion
        </button>
        {saved ? (
          <p role="status" className="mt-3 text-[0.8125rem] text-[#7d6432]">
            Reflektion sparad.
          </p>
        ) : null}
      </Chapter>
    );
  }

  const formContent = (
    <>
      <ZoneTag tone={variant === "overview" ? "muted" : "gold"}>Reflektion</ZoneTag>
      <SectionTitle>
        {prompt ?? (variant === "overview" ? "Vad har hänt sedan sist?" : "Ny reflektion")}
      </SectionTitle>

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
        className="mt-4 w-full resize-y rounded-xl border border-[#e6e0d3] bg-white px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
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
          className={`flex-1 ${klientButtonClass}`}
        >
          {saving ? "Sparar…" : "Spara"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className={klientButtonSmClass}
        >
          Avbryt
        </button>
      </div>
    </>
  );

  if (variant === "overview" && embedded) {
    return <div>{formContent}</div>;
  }

  return <Chapter surface="primary">{formContent}</Chapter>;
}
