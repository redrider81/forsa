"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DefinitionList,
  Panel,
  PanelHeading,
  SectionLabel,
  portalButtonClass,
  portalFieldClass,
  portalOutlineButtonClass,
} from "@/components/portal/ui";

export type ClientDetailsFields = { name: string; role: string; email: string; phone: string };

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * CVB-CR-20261015-01 — Carolina views and corrects a client's details in the
 * client view. Saving goes through /api/portal/klienter/[clientId]/uppgifter;
 * an email correction also re-addresses the client's own portal account.
 */
export default function ClientDetailsEditor({
  clientId,
  details,
  hasAccount,
}: {
  clientId: string;
  details: ClientDetailsFields;
  hasAccount: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(details);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const emailChanged = form.email.trim().toLowerCase() !== details.email.trim().toLowerCase();

  function startEdit() {
    setForm(details);
    setSaveState("idle");
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setForm(details);
    setSaveState("idle");
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaveState("saving");
    setError(null);
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/uppgifter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Uppgifterna kunde inte sparas. Försök igen.");
        setSaveState("error");
        return;
      }
      setSaveState("saved");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Uppgifterna kunde inte sparas. Försök igen.");
      setSaveState("error");
    }
  }

  if (!editing) {
    return (
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <PanelHeading label="Klientuppgifter" title="Kontaktuppgifter" />
          <button type="button" onClick={startEdit} className={`shrink-0 ${portalOutlineButtonClass}`}>
            Redigera uppgifter
          </button>
        </div>
        {saveState === "saved" && <p className="mt-3 text-[0.8125rem] text-emerald-700">Sparat</p>}
        <div className="mt-5">
          <DefinitionList
            items={[
              { term: "Namn", value: details.name },
              { term: "Roll", value: details.role },
              { term: "E-post", value: details.email },
              { term: "Telefon", value: details.phone || "–" },
            ]}
          />
        </div>
      </Panel>
    );
  }

  const busy = saveState === "saving";

  return (
    <Panel>
      <PanelHeading label="Klientuppgifter" title="Redigera kontaktuppgifter" />
      <div className="mt-5 flex flex-col gap-4">
        <label>
          <SectionLabel>Namn</SectionLabel>
          <input
            type="text"
            value={form.name}
            maxLength={120}
            autoComplete="off"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Roll</SectionLabel>
          <input
            type="text"
            value={form.role}
            maxLength={120}
            autoComplete="off"
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>E-post</SectionLabel>
          <input
            type="email"
            value={form.email}
            maxLength={254}
            autoComplete="off"
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        {emailChanged && hasAccount ? (
          <p className="text-[0.8125rem] leading-relaxed text-zinc-500">
            Klienten har ett konto i CVB Base. Kontots inloggningsadress ändras till den nya adressen när du sparar.
            Lösenord och historik påverkas inte.
          </p>
        ) : null}
        <label>
          <SectionLabel>Telefon</SectionLabel>
          <input
            type="tel"
            value={form.phone}
            maxLength={40}
            autoComplete="off"
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={cancelEdit} className={portalOutlineButtonClass} disabled={busy}>
          Avbryt
        </button>
        <button type="button" onClick={save} className={portalButtonClass} disabled={busy}>
          {busy ? "Sparar…" : "Spara"}
        </button>
      </div>
      {error && <p className="mt-3 text-[0.8125rem] text-red-600">{error}</p>}
    </Panel>
  );
}
