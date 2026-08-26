"use client";

import { useState } from "react";
import {
  DefinitionList,
  SectionLabel,
  portalButtonClass,
  portalFieldClass,
  portalOutlineButtonClass,
} from "@/components/portal/ui";

type CoachProfileFields = {
  name: string;
  title: string;
  email: string;
  credential: string;
  focus: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ProfileEditor({
  coach,
  engagementsLabel,
  clientsLabel,
}: {
  coach: CoachProfileFields;
  engagementsLabel: string;
  clientsLabel: string;
}) {
  const [displayCoach, setDisplayCoach] = useState(coach);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(coach);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  function startEdit() {
    setForm(displayCoach);
    setSaveState("idle");
    setEditing(true);
  }

  function cancelEdit() {
    setForm(displayCoach);
    setSaveState("idle");
    setEditing(false);
  }

  async function save() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          credential: form.credential,
          focus: form.focus,
        }),
      });
      if (!response.ok) throw new Error("save-failed");

      setDisplayCoach({ ...displayCoach, name: form.name, title: form.title, credential: form.credential, focus: form.focus });
      setSaveState("saved");
      setEditing(false);
    } catch {
      setSaveState("error");
    }
  }

  if (!editing) {
    return (
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[1.25rem] font-medium leading-tight tracking-tight text-zinc-900">
              {displayCoach.name}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] leading-snug text-zinc-600">{displayCoach.title}</p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-zinc-500">{displayCoach.email}</p>
          </div>
          <button
            type="button"
            onClick={startEdit}
            className={`shrink-0 ${portalOutlineButtonClass}`}
          >
            Redigera profil
          </button>
        </div>

        {saveState === "saved" && (
          <p className="mt-3 text-[0.8125rem] text-emerald-700">Sparat</p>
        )}

        <div className="mt-6 border-t border-zinc-200/80 pt-5">
          <DefinitionList
            items={[
              { term: "Certifiering", value: displayCoach.credential },
              { term: "Arbetsområde", value: displayCoach.focus },
              { term: "Aktiva uppdrag", value: engagementsLabel },
              { term: "Klienter och deltagare", value: clientsLabel },
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4">
        <label>
          <SectionLabel>Namn</SectionLabel>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Titel/roll</SectionLabel>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <div>
          <SectionLabel>E-post</SectionLabel>
          <p className="mt-2 text-[0.9375rem] leading-snug text-zinc-500">{displayCoach.email}</p>
        </div>
        <label>
          <SectionLabel>Certifiering</SectionLabel>
          <input
            type="text"
            value={form.credential}
            onChange={(event) => setForm({ ...form, credential: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Arbetsområde</SectionLabel>
          <input
            type="text"
            value={form.focus}
            onChange={(event) => setForm({ ...form, focus: event.target.value })}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
      </div>

      <div className="mt-6 border-t border-zinc-200/80 pt-5">
        <DefinitionList
          items={[
            { term: "Aktiva uppdrag", value: engagementsLabel },
            { term: "Klienter och deltagare", value: clientsLabel },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saveState === "saving"}
          className={portalButtonClass}
        >
          {saveState === "saving" ? "Sparar…" : "Spara"}
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={saveState === "saving"}
          className={portalOutlineButtonClass}
        >
          Avbryt
        </button>
        {saveState === "error" && (
          <span className="text-[0.8125rem] text-red-600">Fel vid sparning</span>
        )}
      </div>
    </div>
  );
}
