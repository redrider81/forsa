"use client";

import { useMemo, useState } from "react";
import {
  materialCategoryLabel,
  materialLinkTypeLabel,
  materialSourceLabel,
} from "@/lib/portal/material-labels";
import {
  deleteMaterialFile,
  openStoredMaterialFile,
  previewStoredMaterialFile,
} from "@/lib/portal/client-material-files";
import { formatDate } from "@/lib/portal/format";
import type { CoachingMaterial } from "@/lib/portal/types";
import { MetaLabel, SharingBadge, klientButtonSmClass } from "@/components/klient/klient-ui";
import MaterialForms from "@/components/klient/material-forms";
import type { MaterialLinkContext } from "@/components/klient/material-workspace";

type Props = {
  material: CoachingMaterial;
  clientId: string;
  linkContext: MaterialLinkContext;
  onChanged: () => void;
  readOnly?: boolean;
};

function linkLabel(
  material: CoachingMaterial,
  linkContext: MaterialLinkContext,
): string | null {
  if (material.linkType === "none") return null;
  if (material.linkType === "goal") return materialLinkTypeLabel.goal;
  if (material.linkType === "next_session") return materialLinkTypeLabel.next_session;
  if (material.linkType === "session" && material.linkedSessionId) {
    return (
      linkContext.sessions.find((s) => s.id === material.linkedSessionId)?.label ??
      "Session"
    );
  }
  if (material.linkType === "commitment" && material.linkedCommitmentId) {
    const label = linkContext.commitments.find((c) => c.id === material.linkedCommitmentId)?.label;
    return label ? `Åtagande: ${label}` : "Åtagande";
  }
  return null;
}

export default function MaterialRow({
  material,
  clientId,
  linkContext,
  onChanged,
  readOnly = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const linked = useMemo(() => linkLabel(material, linkContext), [material, linkContext]);
  const hasStoredFile = Boolean(material.hasFilePayload);

  async function remove() {
    if (!window.confirm(`Ta bort "${material.title}"? Detta går inte att ångra.`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/klient/material", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        removeLocalFile?: boolean;
      };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att ta bort.");
        setBusy(false);
        return;
      }
      if (data.removeLocalFile && material.fileName) {
        await deleteMaterialFile(material.id, clientId, material.fileName);
      }
      onChanged();
    } catch {
      setError("Det gick inte att nå tjänsten just nu.");
    } finally {
      setBusy(false);
    }
  }

  async function openFile() {
    if (material.source === "client_note") {
      setPreviewUrl(null);
      return;
    }
    if (hasStoredFile && material.fileName) {
      const inline = await previewStoredMaterialFile(
        material.id,
        clientId,
        material.fileName,
        material.mimeType,
      );
      if (inline) {
        window.open(inline, "_blank", "noopener,noreferrer");
        return;
      }
      const opened = await openStoredMaterialFile(material.id, clientId, material.fileName ?? material.title);
      if (opened) return;
    }
    window.alert(
      "Filinnehållet finns inte i detta demoläge. Seed-exempel och coach-delat material har endast metadata.",
    );
  }

  if (editing && !readOnly) {
    return (
      <li className="py-4 first:pt-0 last:pb-0">
        <MaterialForms
          mode={material.source === "client_note" ? "edit-note" : "edit-file"}
          clientId={clientId}
          linkContext={linkContext}
          initial={material}
          onDone={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="py-4 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-zinc-50/40 md:px-2 md:-mx-2 md:rounded-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openFile}
            className="text-left text-[0.9375rem] font-medium leading-snug text-zinc-900 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
          >
            {material.title}
            {material.fileName ? (
              <span className="mt-0.5 block text-[0.75rem] font-normal text-zinc-400">
                {material.fileName}
              </span>
            ) : null}
          </button>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-zinc-500">
            <span className="uppercase tracking-[0.06em]">
              {materialCategoryLabel[material.category]}
            </span>
            <span aria-hidden>·</span>
            <span>{materialSourceLabel[material.source]}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(material.createdAt)}</span>
          </p>
        </div>
        <SharingBadge material={material} />
      </div>

      {linked ? (
        <p className="mt-2.5 text-[0.8125rem] text-zinc-500">
          <MetaLabel>Kopplat till</MetaLabel>{" "}
          <span className="text-zinc-700">{linked}</span>
        </p>
      ) : null}

      {material.comment ? (
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-600">{material.comment}</p>
      ) : null}

      {material.noteText ? (
        <p className="mt-2 rounded-lg border border-[var(--klient-border-muted)]/80 bg-white/60 px-3 py-2.5 text-[0.875rem] leading-relaxed text-zinc-700">
          {material.noteText}
        </p>
      ) : null}

      {previewUrl ? (
        <img src={previewUrl} alt="" className="mt-3 max-h-48 rounded-lg border border-zinc-200" />
      ) : null}

      {!readOnly ? (
        <div className="mt-3 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(true)}
            className={klientButtonSmClass}
          >
            Redigera
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className={klientButtonSmClass}
          >
            Ta bort
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}
