import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, getClient } from "@/lib/portal/repository";
import { canCoachDelete } from "@/lib/portal/materials-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

/** Carolina delar material med en specifik klient (metadata — inga filbytes). */
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

  const data = await fetchPortalRepositoryData();
  if (!clientId || !getClient(session.coachId, clientId, data)) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 403 });
  }
  if (!title) {
    return Response.json({ ok: false, error: "Ange en titel." }, { status: 400 });
  }

  const category: MaterialCategory =
    typeof raw.category === "string" && CATEGORIES.has(raw.category as MaterialCategory)
      ? (raw.category as MaterialCategory)
      : "arbetsmaterial";

  const linkType: MaterialLinkType =
    typeof raw.linkType === "string" && LINK_TYPES.has(raw.linkType as MaterialLinkType)
      ? (raw.linkType as MaterialLinkType)
      : "none";

  const comment = typeof raw.comment === "string" ? raw.comment.trim().slice(0, 400) : null;
  const fileName = typeof raw.fileName === "string" ? raw.fileName.trim().slice(0, 120) : null;

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("materials")
    .insert({
      owner_client_id: clientId,
      created_by_role: "coach",
      created_by_id: data.coach.id,
      title,
      file_name: fileName,
      mime_type: fileName?.endsWith(".pdf") ? "application/pdf" : null,
      category,
      sharing_level: "shared_coach",
      source: "coach_shared",
      link_type: linkType,
      comment,
    })
    .select("*")
    .single();

  if (error || !row) {
    return Response.json({ ok: false, error: "Materialet kunde inte sparas." }, { status: 502 });
  }

  const material: CoachingMaterial = {
    id: row.id,
    ownerClientId: row.owner_client_id,
    createdByRole: row.created_by_role,
    createdById: row.created_by_id,
    title: row.title,
    fileName: row.file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sharingLevel: row.sharing_level,
    source: row.source,
    linkType: row.link_type,
    comment: row.comment ?? undefined,
    hasFilePayload: Boolean(row.storage_path),
  };

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

  if (!getClient(session.coachId, clientId, await fetchPortalRepositoryData())) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: materialRows } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .eq("owner_client_id", clientId);
  const row = materialRows?.[0];
  const existing: CoachingMaterial | null = row
    ? {
        id: row.id,
        ownerClientId: row.owner_client_id,
        createdByRole: row.created_by_role,
        createdById: row.created_by_id,
        title: row.title,
        category: row.category,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sharingLevel: row.sharing_level,
        source: row.source,
        linkType: row.link_type,
        hasFilePayload: Boolean(row.storage_path),
      }
    : null;

  if (!existing || !canCoachDelete(existing)) {
    return Response.json({ ok: false, error: "Materialet kunde inte tas bort." }, { status: 403 });
  }

  const { error } = await supabase.from("materials").delete().eq("id", materialId);
  if (error) {
    return Response.json({ ok: false, error: "Materialet kunde inte tas bort." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
