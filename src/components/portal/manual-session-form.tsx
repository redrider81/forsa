"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SectionLabel, portalButtonClass, portalFieldClass, portalOutlineButtonClass } from "@/components/portal/ui";

function stockholmToday(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Stockholm" }).format(new Date());
}

/**
 * CVB-CR-20261015-01 — "Lägg till session" in the client view. Records a
 * session that has already taken place; no booking, no email.
 */
export default function ManualSessionForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function start() {
    setDate(stockholmToday());
    setStartTime("");
    setEndTime("");
    setError(null);
    setSaved(false);
    setOpen(true);
  }

  async function save() {
    if (!date || !startTime || !endTime) {
      setError("Ange datum, starttid och sluttid.");
      return;
    }
    if (endTime <= startTime) {
      setError("Sluttiden måste vara efter starttiden.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/sessioner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime, endTime }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Sessionen kunde inte registreras. Försök igen.");
        return;
      }
      setOpen(false);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Sessionen kunde inte registreras. Försök igen.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div>
        <button type="button" onClick={start} className={portalOutlineButtonClass}>
          Lägg till session
        </button>
        {saved && <p className="mt-3 text-[0.8125rem] text-emerald-700">Sessionen har registrerats som genomförd.</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--klient-text-block-bg)] p-4">
      <SectionLabel>Lägg till genomförd session</SectionLabel>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-500">
        Registrerar en session som redan har ägt rum. Ingen bokning skapas och inget mejl skickas.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label>
          <SectionLabel>Datum</SectionLabel>
          <input
            type="date"
            value={date}
            max={stockholmToday()}
            onChange={(event) => setDate(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Starttid</SectionLabel>
          <input
            type="time"
            value={startTime}
            step={300}
            onChange={(event) => setStartTime(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Sluttid</SectionLabel>
          <input
            type="time"
            value={endTime}
            step={300}
            onChange={(event) => setEndTime(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOpen(false)} className={portalOutlineButtonClass} disabled={busy}>
          Avbryt
        </button>
        <button type="button" onClick={save} className={portalButtonClass} disabled={busy}>
          {busy ? "Sparar…" : "Spara session"}
        </button>
      </div>
      {error && <p className="mt-3 text-[0.8125rem] text-red-600">{error}</p>}
    </div>
  );
}
