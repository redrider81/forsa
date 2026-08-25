"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { PortalDocument } from "@/lib/portal/types";
import { formatDate } from "@/lib/portal/format";
import {
  deleteInternalDocumentFile,
  openStoredInternalDocumentFile,
  uploadInternalDocumentFile,
} from "@/lib/portal/internal-document-files";
import {
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  SectionLabel,
  Tag,
  portalButtonSmClass,
  portalFieldClass,
  portalGhostButtonClass,
  portalOutlineButtonClass,
  portalQuietLinkClass,
  portalTextareaClass,
} from "@/components/portal/ui";

const KINDS = ["Avtal", "Mall", "Certifikat", "Metod & underlag", "Administration", "Övrigt"];

export default function InternalDocumentArchive({
  coachId,
  documents,
}: {
  coachId: string;
  documents: PortalDocument[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState(KINDS[0]!);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/internal-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, kind, date, description }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string; document?: PortalDocument };
      if (!response.ok || !data.ok || !data.document) {
        setError(data.error ?? "Dokumentet kunde inte sparas.");
        setBusy(false);
        return;
      }

      const file = fileInput.current?.files?.[0];
      if (file) {
        try {
          await uploadInternalDocumentFile(data.document.id, coachId, file);
        } catch {
          setError("Dokumentet sparades men filen kunde inte laddas upp.");
        }
      }

      setTitle("");
      setKind(KINDS[0]!);
      setDescription("");
      if (fileInput.current) fileInput.current.value = "";
      setBusy(false);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
      setBusy(false);
    }
  }

  async function remove(document: PortalDocument) {
    if (!window.confirm(`Ta bort "${document.title}"?`)) return;
    if (document.fileName) {
      await deleteInternalDocumentFile(document.id, coachId, document.fileName);
    }
    await fetch("/api/portal/internal-document", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id }),
    });
    router.refresh();
  }

  async function openFile(document: PortalDocument) {
    if (!document.fileName) return;
    await openStoredInternalDocumentFile(document.id, coachId, document.fileName);
  }

  return (
    <Panel>
      <PanelHeading
        label="Internt arkiv"
        title="Dokument"
        action={
          <button type="button" onClick={() => setOpen((value) => !value)} className={portalQuietLinkClass}>
            {open ? "Avbryt" : "+ Lägg till dokument"}
          </button>
        }
      />

      <div className="mt-4">
        {documents.length === 0 ? (
          <EmptyState>Inga dokument tillagda.</EmptyState>
        ) : (
          documents.map((document, index) => (
            <div key={document.id}>
              {index > 0 ? <Divider /> : null}
              <div className="-mx-3 px-3 py-3.5">
                <div className="flex items-start justify-between gap-5">
                  <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">{document.title}</p>
                  {document.status === "arkiverad" ? <Tag>Arkiverad</Tag> : null}
                </div>
                {document.description ? (
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">{document.description}</p>
                ) : null}
                <p className="mt-1.5 text-[0.75rem] text-zinc-400">
                  {document.kind} · {formatDate(document.date)}
                </p>
                <div className="mt-2.5 flex gap-2.5">
                  {document.fileName ? (
                    <button type="button" onClick={() => openFile(document)} className={portalButtonSmClass}>
                      Öppna fil
                    </button>
                  ) : null}
                  <button type="button" onClick={() => remove(document)} className={portalGhostButtonClass}>
                    Ta bort
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {open ? (
        <form onSubmit={add} noValidate className="mt-5 space-y-4 border-t border-[var(--klient-border-muted)] pt-5">
          <label>
            <SectionLabel>Titel</SectionLabel>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <SectionLabel>Kategori</SectionLabel>
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
              >
                {KINDS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <SectionLabel>Datum</SectionLabel>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
              />
            </label>
          </div>
          <label>
            <SectionLabel>Beskrivning (valfritt)</SectionLabel>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label>
            <SectionLabel>Fil (valfritt)</SectionLabel>
            <input ref={fileInput} type="file" className="mt-2 block text-[0.875rem] text-zinc-700" />
          </label>

          {error ? (
            <p role="alert" className="rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2.5">
            <button type="submit" disabled={busy} className={portalOutlineButtonClass}>
              {busy ? "Sparar…" : "Spara dokument"}
            </button>
          </div>
        </form>
      ) : null}
    </Panel>
  );
}
