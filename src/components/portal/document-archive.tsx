"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { PortalDocument } from "@/lib/portal/types";
import { formatDate } from "@/lib/portal/format";
import { deleteDocumentFile, openStoredDocumentFile, uploadDocumentFile } from "@/lib/portal/coach-document-files";
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

const VISIBILITIES: Array<{ value: PortalDocument["visibility"]; label: string }> = [
  { value: "coach", label: "Endast coach" },
  { value: "coach_klient", label: "Coach och klient" },
  { value: "organisation", label: "Uppdragsgivare" },
];

export default function DocumentArchive({
  clientId,
  coachId,
  documents,
}: {
  clientId: string;
  coachId: string;
  documents: PortalDocument[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<PortalDocument["visibility"]>("coach");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, title, kind, date, description, visibility }),
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
          await uploadDocumentFile(data.document.id, coachId, clientId, file);
        } catch {
          setError("Dokumentet sparades men filen kunde inte laddas upp.");
        }
      }

      setTitle("");
      setKind("");
      setDescription("");
      setVisibility("coach");
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
      await deleteDocumentFile(document.id, coachId, clientId, document.fileName);
    }
    await fetch("/api/portal/document", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, documentId: document.id }),
    });
    router.refresh();
  }

  async function openFile(document: PortalDocument) {
    if (!document.fileName) return;
    await openStoredDocumentFile(document.id, coachId, clientId, document.fileName);
  }

  return (
    <Panel>
      <PanelHeading
        label="Dokumentarkiv"
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
                  <div className="flex shrink-0 items-center gap-2">
                    {document.visibility === "coach" ? <Tag tone="private">Coach privat</Tag> : null}
                    {document.status === "arkiverad" ? <Tag>Arkiverad</Tag> : null}
                  </div>
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
              <SectionLabel>Typ</SectionLabel>
              <input
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
                placeholder="t.ex. Avtal, Rapport"
              />
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
            <SectionLabel>Beskrivning</SectionLabel>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label>
            <SectionLabel>Synlighet</SectionLabel>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as PortalDocument["visibility"])}
              className={`mt-2 ${portalFieldClass}`}
            >
              {VISIBILITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
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
