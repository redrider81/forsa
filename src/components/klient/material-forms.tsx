"use client";

import { useRef, useState } from "react";
import {
  materialCategoryOptions,
  materialLinkTypeOptions,
} from "@/lib/portal/material-labels";
import { validateMaterialFile, inferTitleFromFileName } from "@/lib/portal/material-validation";
import { uploadMaterialFile } from "@/lib/portal/client-material-files";
import type { CoachingMaterial, MaterialLinkType, MaterialSharingLevel } from "@/lib/portal/types";
import type { MaterialLinkContext } from "@/components/klient/material-workspace";
import { klientButtonClass, klientButtonSmClass } from "@/components/klient/klient-ui";

type Mode = "upload" | "note" | "edit-file" | "edit-note";

type Props = {
  mode: Mode;
  clientId: string;
  linkContext: MaterialLinkContext;
  initial?: CoachingMaterial;
  onDone: () => void;
  onCancel: () => void;
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#e6e0d3] bg-white px-4 py-3 text-[0.9375rem] text-zinc-900 focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

export default function MaterialForms({
  mode,
  clientId,
  linkContext,
  initial,
  onDone,
  onCancel,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [noteText, setNoteText] = useState(initial?.noteText ?? "");
  const [category, setCategory] = useState(initial?.category ?? "ovrigt");
  const [sharingLevel, setSharingLevel] = useState<MaterialSharingLevel>(
    initial?.sharingLevel ?? "private",
  );
  const [linkType, setLinkType] = useState<MaterialLinkType>(initial?.linkType ?? "none");
  const [linkedSessionId, setLinkedSessionId] = useState(initial?.linkedSessionId ?? "");
  const [linkedCommitmentId, setLinkedCommitmentId] = useState(
    initial?.linkedCommitmentId ?? "",
  );
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNote = mode === "note" || mode === "edit-note";
  const isEdit = mode === "edit-file" || mode === "edit-note";

  async function submit() {
    setBusy(true);
    setError(null);

    try {
      if (isEdit && initial) {
        const response = await fetch("/api/klient/material", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materialId: initial.id,
            title: title.trim(),
            category: isNote ? "anteckning" : category,
            noteText: isNote ? noteText : undefined,
            sharingLevel,
            linkType,
            linkedSessionId: linkType === "session" ? linkedSessionId : undefined,
            linkedCommitmentId: linkType === "commitment" ? linkedCommitmentId : undefined,
            comment: comment.trim() || undefined,
          }),
        });
        const data = (await response.json()) as { ok: boolean; error?: string };
        if (!response.ok || !data.ok) {
          setError(data.error ?? "Det gick inte att spara.");
          setBusy(false);
          return;
        }
        onDone();
        return;
      }

      if (isNote) {
        const response = await fetch("/api/klient/material", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "note",
            title: title.trim(),
            noteText,
            sharingLevel,
            linkType,
            linkedSessionId: linkType === "session" ? linkedSessionId : undefined,
            linkedCommitmentId: linkType === "commitment" ? linkedCommitmentId : undefined,
            comment: comment.trim() || undefined,
          }),
        });
        const data = (await response.json()) as { ok: boolean; error?: string };
        if (!response.ok || !data.ok) {
          setError(data.error ?? "Det gick inte att spara.");
          setBusy(false);
          return;
        }
        onDone();
        return;
      }

      if (!file) {
        setError("Välj en fil att ladda upp.");
        setBusy(false);
        return;
      }

      const validation = validateMaterialFile(file.name, file.type, file.size);
      if (!validation.ok) {
        setError(validation.error);
        setBusy(false);
        return;
      }

      const response = await fetch("/api/klient/material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "file",
          title: title.trim() || inferTitleFromFileName(file.name),
          fileName: file.name,
          mimeType: validation.mimeType,
          sizeBytes: file.size,
          category,
          sharingLevel,
          linkType,
          linkedSessionId: linkType === "session" ? linkedSessionId : undefined,
          linkedCommitmentId: linkType === "commitment" ? linkedCommitmentId : undefined,
          comment: comment.trim() || undefined,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        material?: CoachingMaterial;
        storeFileLocally?: boolean;
      };
      if (!response.ok || !data.ok || !data.material) {
        setError(data.error ?? "Det gick inte att spara.");
        setBusy(false);
        return;
      }

      if (data.storeFileLocally) {
        await uploadMaterialFile(data.material.id, clientId, file);
      }

      onDone();
    } catch {
      setError("Det gick inte att nå tjänsten just nu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {mode === "upload" ? (
        <div>
          <label htmlFor="material-file" className="block text-[0.875rem] font-medium text-zinc-800">
            Fil
          </label>
          <input
            ref={fileInputRef}
            id="material-file"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              if (next && !title.trim()) setTitle(inferTitleFromFileName(next.name));
            }}
            className="mt-1.5 block w-full text-[0.875rem] text-zinc-600 file:mr-3 file:rounded-full file:border file:border-[var(--klient-button-border)] file:bg-[var(--klient-button-bg)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--klient-button-text)] hover:file:bg-[var(--klient-button-bg-hover)]"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="material-title" className="block text-[0.875rem] font-medium text-zinc-800">
          Titel
        </label>
        <input
          id="material-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      {isNote ? (
        <div>
          <label htmlFor="material-note" className="block text-[0.875rem] font-medium text-zinc-800">
            Anteckning
          </label>
          <textarea
            id="material-note"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={5}
            className={fieldClass}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="material-category" className="block text-[0.875rem] font-medium text-zinc-800">
            Typ
          </label>
          <select
            id="material-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={fieldClass}
          >
            {materialCategoryOptions
              .filter((o) => o.value !== "anteckning")
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="material-sharing" className="block text-[0.875rem] font-medium text-zinc-800">
          Delning
        </label>
        <select
          id="material-sharing"
          value={sharingLevel}
          onChange={(e) => setSharingLevel(e.target.value as MaterialSharingLevel)}
          className={fieldClass}
        >
          <option value="private">Privat för mig</option>
          <option value="shared_coach">Delat med Carolina</option>
        </select>
      </div>

      <div>
        <label htmlFor="material-link" className="block text-[0.875rem] font-medium text-zinc-800">
          Koppla till
        </label>
        <select
          id="material-link"
          value={linkType}
          onChange={(e) => setLinkType(e.target.value as MaterialLinkType)}
          className={fieldClass}
        >
          {materialLinkTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {linkType === "session" ? (
        <div>
          <label htmlFor="material-session" className="sr-only">
            Session
          </label>
          <select
            id="material-session"
            value={linkedSessionId}
            onChange={(e) => setLinkedSessionId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Välj session</option>
            {linkContext.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {linkType === "commitment" ? (
        <div>
          <label htmlFor="material-commitment" className="sr-only">
            Åtagande
          </label>
          <select
            id="material-commitment"
            value={linkedCommitmentId}
            onChange={(e) => setLinkedCommitmentId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Välj åtagande</option>
            {linkContext.commitments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="material-comment" className="block text-[0.875rem] font-medium text-zinc-800">
          Kommentar (valfritt)
        </label>
        <textarea
          id="material-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Det här vill jag prata om nästa gång."
          className={fieldClass}
        />
      </div>

      {error ? (
        <p role="alert" className="text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className={`flex-1 ${klientButtonClass}`}
        >
          {busy ? "Sparar…" : isEdit ? "Spara ändringar" : "Spara"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={klientButtonSmClass}
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
