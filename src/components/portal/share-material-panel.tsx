"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  materialCategoryOptions,
  materialLinkTypeOptions,
} from "@/lib/portal/material-labels";
import { formatDate } from "@/lib/portal/format";
import type { CoachingMaterial, MaterialLinkType } from "@/lib/portal/types";
import {
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  portalButtonClass,
  portalFieldClass,
  portalOutlineButtonClass,
  SectionLabel,
  Tag,
} from "@/components/portal/ui";

type Props = {
  clientId: string;
  materials: CoachingMaterial[];
};

export default function ShareMaterialPanel({ clientId, materials }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<CoachingMaterial["category"]>("arbetsmaterial");
  const [linkType, setLinkType] = useState<MaterialLinkType>("none");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coachShared = materials.filter((item) => item.source === "coach_shared");
  const clientShared = materials.filter(
    (item) => item.source !== "coach_shared" && item.sharingLevel === "shared_coach",
  );

  async function share() {
    if (!title.trim()) {
      setError("Ange en titel.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title: title.trim(),
          fileName: fileName.trim() || undefined,
          category,
          linkType,
          comment: comment.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att dela materialet.");
        setBusy(false);
        return;
      }
      setTitle("");
      setFileName("");
      setComment("");
      setLinkType("none");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(materialId: string, materialTitle: string) {
    if (!window.confirm(`Ta bort "${materialTitle}" från klientens material?`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/material", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, materialId }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att ta bort.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu.");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = `mt-1.5 ${portalFieldClass}`;

  return (
    <Panel>
      <PanelHeading
        label="Coachingmaterial"
        title="Material och delning"
        action={
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={portalOutlineButtonClass}
          >
            {open ? "Stäng" : "Dela material"}
          </button>
        }
      />

      <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
        Klientens privata material syns inte här. Endast material klienten delat och material du
        själv delat visas.
      </p>

      {clientShared.length > 0 ? (
        <div className="mt-5">
          <SectionLabel>Delat av klienten</SectionLabel>
          <ul className="mt-3 space-y-3">
            {clientShared.map((item) => (
              <li key={item.id} className="rounded-xl bg-[var(--klient-text-block-bg)] p-4">
                <div className="flex items-start justify-between gap-5">
                  <p className="text-[0.9375rem] font-medium text-zinc-900">{item.title}</p>
                  <Tag tone="open">Delat med dig</Tag>
                </div>
                <p className="mt-1 text-[0.75rem] text-zinc-400">{formatDate(item.createdAt)}</p>
                {item.comment ? (
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-600">
                    {item.comment}
                  </p>
                ) : null}
                {item.noteText ? (
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-600">
                    {item.noteText}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5">
        <SectionLabel>Delat av dig</SectionLabel>
        {coachShared.length === 0 ? (
          <div className="mt-3">
            <EmptyState>Inget material delat ännu.</EmptyState>
          </div>
        ) : (
          <div className="mt-3">
            {coachShared.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <Divider /> : null}
                <div className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-medium text-zinc-900">{item.title}</p>
                    {item.fileName ? (
                      <p className="mt-0.5 text-[0.75rem] text-zinc-400">{item.fileName}</p>
                    ) : null}
                    <p className="mt-1 text-[0.75rem] text-zinc-400">
                      {formatDate(item.createdAt)}
                    </p>
                    {item.comment ? (
                      <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-600">
                        {item.comment}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(item.id, item.title)}
                    className="shrink-0 text-[0.8125rem] text-zinc-500 underline underline-offset-4 hover:text-zinc-800"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open ? (
        <div className="mt-6 space-y-4 border-t border-[var(--klient-border-muted)]/80 pt-6">
          <p className="text-[0.8125rem] leading-relaxed text-zinc-500">
            I demoläget sparas metadata. Filinnehåll lagras inte på servern — ange filnamn om du
            vill visa det för klienten.
          </p>
          <div>
            <label htmlFor="share-title" className="block text-[0.875rem] font-medium text-zinc-800">
              Titel
            </label>
            <input
              id="share-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="share-filename" className="block text-[0.875rem] font-medium text-zinc-800">
              Filnamn (valfritt)
            </label>
            <input
              id="share-filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Reflektionsövning.pdf"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="share-category" className="block text-[0.875rem] font-medium text-zinc-800">
              Kategori
            </label>
            <select
              id="share-category"
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
          <div>
            <label htmlFor="share-link" className="block text-[0.875rem] font-medium text-zinc-800">
              Koppla till
            </label>
            <select
              id="share-link"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as MaterialLinkType)}
              className={fieldClass}
            >
              {materialLinkTypeOptions
                .filter((o) => o.value !== "session" && o.value !== "commitment")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="share-comment" className="block text-[0.875rem] font-medium text-zinc-800">
              Kommentar (valfritt)
            </label>
            <textarea
              id="share-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className={fieldClass}
            />
          </div>
          {error ? (
            <p role="alert" className="text-[0.8125rem] text-zinc-700">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void share()}
            className={portalButtonClass}
          >
            {busy ? "Delar…" : "Dela till klienten"}
          </button>
        </div>
      ) : null}

      {error && !open ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}
