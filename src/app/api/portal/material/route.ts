import { readCoachSession } from "@/lib/portal/session";
import { getClient, getCoach } from "@/lib/portal/repository";
import { updateDemoMaterialsState } from "@/lib/portal/store/demo-materials-store";
import {
  canCoachDelete,
  getClientMaterial,
  resolveLinkInput,
} from "@/lib/portal/materials-repository";
import { todayIso } from "@/lib/portal/format";
import type { CoachingMaterial, MaterialCategory, MaterialLinkType } from "@/lib/portal/types";

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

/** Carolina delar material med en specifik klient (metadata — demo utan filbytes). */
export async function POST(request: Request) {
  const session = await readCoachSession();
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
  const clientId = typeof raw.clientId === "string" ? raw.clientId : "";
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 120) : "";

  if (!clientId || !getClient(session.coachId, clientId)) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 403 });
  }
  if (!title) {
    return Response.json({ ok: false, error: "Ange en titel." }, { status: 400 });
  }

  const category: MaterialCategory =
    typeof raw.category === "string" && CATEGORIES.has(raw.category as MaterialCategory)
      ? (raw.category as MaterialCategory)
      : "arbetsmaterial";

  const linkType =
    typeof raw.linkType === "string" && LINK_TYPES.has(raw.linkType as MaterialLinkType)
      ? (raw.linkType as MaterialLinkType)
      : "none";

  const link = resolveLinkInput({ linkType });
  const comment =
    typeof raw.comment === "string" ? raw.comment.trim().slice(0, 400) : undefined;
  const fileName =
    typeof raw.fileName === "string" ? raw.fileName.trim().slice(0, 120) : undefined;

  const now = new Date().toISOString();
  const material: CoachingMaterial = {
    id: `mat-coach-${Date.now().toString(36)}`,
    ownerClientId: clientId,
    createdByRole: "coach",
    createdById: getCoach().id,
    title,
    fileName,
    mimeType: fileName?.endsWith(".pdf") ? "application/pdf" : undefined,
    category,
    createdAt: todayIso(),
    updatedAt: now,
    sharingLevel: "shared_coach",
    source: "coach_shared",
    ...link,
    comment,
    hasFilePayload: false,
  };

  await updateDemoMaterialsState((state) => ({
    ...state,
    added: [...state.added, material],
  }));

  return Response.json({ ok: true, material });
}

/** Carolina tar bort material hon delat. */
export async function DELETE(request: Request) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { clientId, materialId } = (body ?? {}) as { clientId?: unknown; materialId?: unknown };
  if (typeof clientId !== "string" || typeof materialId !== "string") {
    return Response.json({ ok: false, error: "Materialet kunde inte hittas." }, { status: 400 });
  }

  if (!getClient(session.coachId, clientId)) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 403 });
  }

  const existing = getClientMaterial(clientId, materialId, "coach");
  if (!existing || !canCoachDelete(existing)) {
    return Response.json({ ok: false, error: "Materialet kunde inte tas bort." }, { status: 403 });
  }

  await updateDemoMaterialsState((state) => ({
    ...state,
    added: state.added.filter((item) => item.id !== materialId),
    deletedIds: state.deletedIds.includes(materialId)
      ? state.deletedIds
      : [...state.deletedIds, materialId],
  }));

  return Response.json({ ok: true });
}
