import { readClientSession } from "@/lib/portal/session";
import {
  fetchPortalRepositoryData,
  listCommitments,
  listSessions,
  type PortalRepositoryData,
} from "@/lib/portal/repository";
import { canClientDelete, canClientEdit, isSharingLevel } from "@/lib/portal/materials-repository";
import { inferTitleFromFileName, validateMaterialFile } from "@/lib/portal/material-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CoachingMaterial,
  MaterialCategory,
  MaterialLinkType,
  MaterialSharingLevel,
} from "@/lib/portal/types";

const CATEGORIES = new Set<MaterialCategory>([
  "arbetsmaterial",
  "underlag",
  "utvardering",
  "anteckning",
  "ovrigt",
]);

const LINK_TYPES = new Set<MaterialLinkType>([
  "goal",
  "next_session",
  "session",
  "commitment",
  "none",
]);

function parseLinkType(raw: Record<string, unknown>): MaterialLinkType {
  return typeof raw.linkType === "string" && LINK_TYPES.has(raw.linkType as MaterialLinkType)
    ? (raw.linkType as MaterialLinkType)
    : "none";
}

function validateOwnershipLinks(
  coachId: string,
  clientId: string,
  linkType: MaterialLinkType,
  data: PortalRepositoryData,
  linkedSessionId?: string,
  linkedCommitmentId?: string,
): boolean {
  if (linkType === "session" && linkedSessionId) {
    return Boolean(
      listSessions(coachId, clientId, undefined, data).find((s) => s.id === linkedSessionId),
    );
  }
  if (linkType === "commitment" && linkedCommitmentId) {
    return Boolean(
      listCommitments(coachId, clientId, undefined, data).find((c) => c.id === linkedCommitmentId),
    );
  }
  return true;
}

function mapMaterialRow(row: {
  id: string;
  owner_client_id: string;
  created_by_role: "klient" | "coach";
  created_by_id: string;
  title: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  category: MaterialCategory;
  note_text: string | null;
  created_at: string;
  updated_at: string;
  sharing_level: MaterialSharingLevel;
  source: "client_upload" | "client_note" | "coach_shared";
  link_type: MaterialLinkType;
  linked_session_id: string | null;
  linked_commitment_id: string | null;
  comment: string | null;
  storage_path: string | null;
}): CoachingMaterial {
  return {
    id: row.id,
    ownerClientId: row.owner_client_id,
    createdByRole: row.created_by_role,
    createdById: row.created_by_id,
    title: row.title,
    fileName: row.file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    category: row.category,
    noteText: row.note_text ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sharingLevel: row.sharing_level,
    source: row.source,
    linkType: row.link_type,
    linkedSessionId: row.linked_session_id ?? undefined,
    linkedCommitmentId: row.linked_commitment_id ?? undefined,
    comment: row.comment ?? undefined,
    hasFilePayload: Boolean(row.storage_path),
  };
}

/** Klienten skapar fil-metadata eller anteckning. Filbytes laddas upp separat till Supabase Storage. */
export async function POST(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const kind = raw.kind === "note" ? "note" : "file";
  const data = await fetchPortalRepositoryData();
  const coachId = data.coach.id;
  const linkType = parseLinkType(raw);
  const linkedSessionId = typeof raw.linkedSessionId === "string" ? raw.linkedSessionId : undefined;
  const linkedCommitmentId =
    typeof raw.linkedCommitmentId === "string" ? raw.linkedCommitmentId : undefined;

  if (
    !validateOwnershipLinks(coachId, session.clientId, linkType, data, linkedSessionId, linkedCommitmentId)
  ) {
    return Response.json({ ok: false, error: "Kopplingen kunde inte hittas." }, { status: 400 });
  }

  const sharingLevel: MaterialSharingLevel =
    typeof raw.sharingLevel === "string" && isSharingLevel(raw.sharingLevel)
      ? raw.sharingLevel
      : "private";

  const category: MaterialCategory =
    typeof raw.category === "string" && CATEGORIES.has(raw.category as MaterialCategory)
      ? (raw.category as MaterialCategory)
      : kind === "note"
        ? "anteckning"
        : "ovrigt";

  const comment = typeof raw.comment === "string" ? raw.comment.trim().slice(0, 400) || null : null;
  const supabase = await createSupabaseServerClient();

  if (kind === "note") {
    const title =
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim().slice(0, 120)
        : "Ny anteckning";
    const noteText = typeof raw.noteText === "string" ? raw.noteText.trim() : "";
    if (noteText.length < 3) {
      return Response.json({ ok: false, error: "Skriv minst några ord i anteckningen." }, { status: 400 });
    }
    if (noteText.length > 4000) {
      return Response.json({ ok: false, error: "Anteckningen är för lång." }, { status: 400 });
    }

    const { data: row, error } = await supabase
      .from("materials")
      .insert({
        owner_client_id: session.clientId,
        created_by_role: "klient",
        created_by_id: session.clientId,
        title,
        category: "anteckning",
        note_text: noteText,
        sharing_level: sharingLevel,
        source: "client_note",
        link_type: linkType,
        linked_session_id: linkType === "session" ? linkedSessionId ?? null : null,
        linked_commitment_id: linkType === "commitment" ? linkedCommitmentId ?? null : null,
        comment,
      })
      .select("*")
      .single();

    if (error || !row) {
      return Response.json({ ok: false, error: "Det gick inte att spara." }, { status: 502 });
    }

    return Response.json({ ok: true, material: mapMaterialRow(row), storeFileLocally: false });
  }

  const fileName = typeof raw.fileName === "string" ? raw.fileName : "";
  const mimeType = typeof raw.mimeType === "string" ? raw.mimeType : "";
  const sizeBytes = typeof raw.sizeBytes === "number" ? raw.sizeBytes : 0;
  const validation = validateMaterialFile(fileName, mimeType, sizeBytes);
  if (!validation.ok) {
    return Response.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim().slice(0, 120)
      : inferTitleFromFileName(fileName);

  const { data: row, error } = await supabase
    .from("materials")
    .insert({
      owner_client_id: session.clientId,
      created_by_role: "klient",
      created_by_id: session.clientId,
      title,
      file_name: fileName,
      mime_type: validation.mimeType,
      size_bytes: sizeBytes,
      category,
      sharing_level: sharingLevel,
      source: "client_upload",
      link_type: linkType,
      linked_session_id: linkType === "session" ? linkedSessionId ?? null : null,
      linked_commitment_id: linkType === "commitment" ? linkedCommitmentId ?? null : null,
      comment,
    })
    .select("*")
    .single();

  if (error || !row) {
    return Response.json({ ok: false, error: "Det gick inte att spara." }, { status: 502 });
  }

  // storage_path sätts av klienten efter en lyckad uppladdning till Storage
  // (se uploadMaterialFile i client-material-files.ts) — hasFilePayload blir
  // sant först då. storeFileLocally styr att klienten laddar upp nu.
  return Response.json({ ok: true, material: mapMaterialRow(row), storeFileLocally: true });
}

/** Klienten uppdaterar eget material. */
export async function PATCH(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const materialId = typeof raw.materialId === "string" ? raw.materialId : "";
  if (!materialId) {
    return Response.json({ ok: false, error: "Materialet kunde inte hittas." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingRow } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .eq("owner_client_id", session.clientId)
    .maybeSingle();

  if (!existingRow || !canClientEdit(mapMaterialRow(existingRow))) {
    return Response.json({ ok: false, error: "Materialet kunde inte hittas." }, { status: 403 });
  }

  const data = await fetchPortalRepositoryData();
  const coachId = data.coach.id;
  const linkType = raw.linkType ? parseLinkType(raw) : undefined;
  const linkedSessionId = typeof raw.linkedSessionId === "string" ? raw.linkedSessionId : undefined;
  const linkedCommitmentId =
    typeof raw.linkedCommitmentId === "string" ? raw.linkedCommitmentId : undefined;
  if (
    linkType &&
    !validateOwnershipLinks(coachId, session.clientId, linkType, data, linkedSessionId, linkedCommitmentId)
  ) {
    return Response.json({ ok: false, error: "Kopplingen kunde inte hittas." }, { status: 400 });
  }

  const patch: Database["public"]["Tables"]["materials"]["Update"] = {
    updated_at: new Date().toISOString(),
  };

  if (typeof raw.title === "string" && raw.title.trim()) {
    patch.title = raw.title.trim().slice(0, 120);
  }
  if (typeof raw.category === "string" && CATEGORIES.has(raw.category as MaterialCategory)) {
    patch.category = raw.category as MaterialCategory;
  }
  if (typeof raw.comment === "string") {
    patch.comment = raw.comment.trim().slice(0, 400) || null;
  }
  if (typeof raw.sharingLevel === "string" && isSharingLevel(raw.sharingLevel)) {
    patch.sharing_level = raw.sharingLevel;
  }
  if (typeof raw.noteText === "string" && existingRow.source === "client_note") {
    const noteText = raw.noteText.trim();
    if (noteText.length < 3) {
      return Response.json({ ok: false, error: "Skriv minst några ord i anteckningen." }, { status: 400 });
    }
    patch.note_text = noteText.slice(0, 4000);
  }
  if (linkType) {
    patch.link_type = linkType;
    patch.linked_session_id = linkType === "session" ? linkedSessionId ?? null : null;
    patch.linked_commitment_id = linkType === "commitment" ? linkedCommitmentId ?? null : null;
  }

  const { error } = await supabase.from("materials").update(patch).eq("id", materialId);
  if (error) {
    return Response.json({ ok: false, error: "Det gick inte att spara." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

/** Klienten tar bort eget material. */
export async function DELETE(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { materialId } = (body ?? {}) as { materialId?: unknown };
  if (typeof materialId !== "string") {
    return Response.json({ ok: false, error: "Materialet kunde inte hittas." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingRow } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .eq("owner_client_id", session.clientId)
    .maybeSingle();

  const existing = existingRow ? mapMaterialRow(existingRow) : null;
  if (!existing || !canClientDelete(existing)) {
    return Response.json({ ok: false, error: "Materialet kunde inte tas bort." }, { status: 403 });
  }

  const { error } = await supabase.from("materials").delete().eq("id", materialId);
  if (error) {
    return Response.json({ ok: false, error: "Materialet kunde inte tas bort." }, { status: 502 });
  }

  return Response.json({ ok: true, removeLocalFile: Boolean(existing.hasFilePayload) });
}
