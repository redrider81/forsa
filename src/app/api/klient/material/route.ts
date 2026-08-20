import { readClientSession } from "@/lib/portal/session";
import { getCoach, listCommitments, listSessions } from "@/lib/portal/repository";
import { updateDemoMaterialsState } from "@/lib/portal/store/demo-materials-store";
import {
  canClientDelete,
  canClientEdit,
  getClientMaterial,
  isSharingLevel,
  resolveLinkInput,
} from "@/lib/portal/materials-repository";
import { inferTitleFromFileName, validateMaterialFile } from "@/lib/portal/material-validation";
import { todayIso } from "@/lib/portal/format";
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

function parseLink(body: Record<string, unknown>) {
  const linkType =
    typeof body.linkType === "string" && LINK_TYPES.has(body.linkType as MaterialLinkType)
      ? (body.linkType as MaterialLinkType)
      : "none";
  return resolveLinkInput({
    linkType,
    linkedSessionId:
      typeof body.linkedSessionId === "string" ? body.linkedSessionId : undefined,
    linkedCommitmentId:
      typeof body.linkedCommitmentId === "string" ? body.linkedCommitmentId : undefined,
  });
}

function validateOwnershipLinks(
  coachId: string,
  clientId: string,
  link: ReturnType<typeof parseLink>,
): boolean {
  if (link.linkType === "session" && link.linkedSessionId) {
    return Boolean(listSessions(coachId, clientId).find((s) => s.id === link.linkedSessionId));
  }
  if (link.linkType === "commitment" && link.linkedCommitmentId) {
    return Boolean(
      listCommitments(coachId, clientId).find((c) => c.id === link.linkedCommitmentId),
    );
  }
  return true;
}

/** Klienten skapar fil-metadata eller anteckning. Filbytes lagras lokalt i webbläsaren. */
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
  const coachId = getCoach().id;
  const now = new Date().toISOString();
  const today = todayIso();
  const link = parseLink(raw);

  if (!validateOwnershipLinks(coachId, session.clientId, link)) {
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

  const comment =
    typeof raw.comment === "string" ? raw.comment.trim().slice(0, 400) : undefined;

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

    const material: CoachingMaterial = {
      id: `mat-${Date.now().toString(36)}`,
      ownerClientId: session.clientId,
      createdByRole: "klient",
      createdById: session.clientId,
      title,
      category: "anteckning",
      noteText,
      createdAt: today,
      updatedAt: now,
      sharingLevel,
      source: "client_note",
      ...link,
      comment,
    };

    await updateDemoMaterialsState((state) => ({
      ...state,
      added: [...state.added, material],
    }));

    return Response.json({ ok: true, material, storeFileLocally: false });
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

  const material: CoachingMaterial = {
    id: `mat-${Date.now().toString(36)}`,
    ownerClientId: session.clientId,
    createdByRole: "klient",
    createdById: session.clientId,
    title,
    fileName,
    mimeType: validation.mimeType,
    sizeBytes,
    category,
    createdAt: today,
    updatedAt: now,
    sharingLevel,
    source: "client_upload",
    ...link,
    comment,
    hasFilePayload: true,
  };

  await updateDemoMaterialsState((state) => ({
    ...state,
    added: [...state.added, material],
  }));

  return Response.json({ ok: true, material, storeFileLocally: true });
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

  const existing = getClientMaterial(session.clientId, materialId, "klient");
  if (!existing || !canClientEdit(existing)) {
    return Response.json({ ok: false, error: "Materialet kunde inte hittas." }, { status: 403 });
  }

  const coachId = getCoach().id;
  const link = raw.linkType ? parseLink(raw) : undefined;
  if (link && !validateOwnershipLinks(coachId, session.clientId, link)) {
    return Response.json({ ok: false, error: "Kopplingen kunde inte hittas." }, { status: 400 });
  }

  const patch: Partial<CoachingMaterial> = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof raw.title === "string" && raw.title.trim()) {
    patch.title = raw.title.trim().slice(0, 120);
  }
  if (typeof raw.category === "string" && CATEGORIES.has(raw.category as MaterialCategory)) {
    patch.category = raw.category as MaterialCategory;
  }
  if (typeof raw.comment === "string") {
    patch.comment = raw.comment.trim().slice(0, 400) || undefined;
  }
  if (typeof raw.sharingLevel === "string" && isSharingLevel(raw.sharingLevel)) {
    patch.sharingLevel = raw.sharingLevel;
  }
  if (typeof raw.noteText === "string" && existing.source === "client_note") {
    const noteText = raw.noteText.trim();
    if (noteText.length < 3) {
      return Response.json({ ok: false, error: "Skriv minst några ord i anteckningen." }, { status: 400 });
    }
    patch.noteText = noteText.slice(0, 4000);
  }
  if (link) {
    Object.assign(patch, link);
  }

  const isAdded = existing.id.startsWith("mat-") && !existing.id.startsWith("mat-seed-");

  await updateDemoMaterialsState((state) => {
    if (isAdded && state.added.some((item) => item.id === materialId)) {
      return {
        ...state,
        added: state.added.map((item) =>
          item.id === materialId ? { ...item, ...patch, id: item.id } : item,
        ),
      };
    }
    return {
      ...state,
      updated: { ...state.updated, [materialId]: { ...state.updated[materialId], ...patch } },
    };
  });

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

  const existing = getClientMaterial(session.clientId, materialId, "klient");
  if (!existing || !canClientDelete(existing)) {
    return Response.json({ ok: false, error: "Materialet kunde inte tas bort." }, { status: 403 });
  }

  await updateDemoMaterialsState((state) => ({
    ...state,
    added: state.added.filter((item) => item.id !== materialId),
    deletedIds: state.deletedIds.includes(materialId)
      ? state.deletedIds
      : [...state.deletedIds, materialId],
  }));

  return Response.json({ ok: true, removeLocalFile: Boolean(existing.hasFilePayload) });
}
