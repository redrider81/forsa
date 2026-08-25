import { readCoachSession } from "@/lib/portal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PortalDocument } from "@/lib/portal/types";

function toDocument(row: Record<string, unknown>): PortalDocument {
  return {
    id: row.id as string,
    ownerType: row.owner_type as PortalDocument["ownerType"],
    ownerId: row.owner_id as string,
    title: row.title as string,
    kind: row.kind as string,
    date: row.date as string,
    description: row.description as string,
    visibility: row.visibility as PortalDocument["visibility"],
    storagePath: (row.storage_path as string | null) ?? undefined,
    fileName: (row.file_name as string | null) ?? undefined,
    mimeType: (row.mime_type as string | null) ?? undefined,
    sizeBytes: (row.size_bytes as number | null) ?? undefined,
    uploadedByCoachId: (row.uploaded_by_coach_id as string | null) ?? undefined,
    status: row.status as PortalDocument["status"],
    signedAt: (row.signed_at as string | null) ?? undefined,
    expiresAt: (row.expires_at as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Carolina lägger till ett dokument i sitt interna arkiv. Alltid coach-privat. */
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
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 120) : "";
  const kind = typeof raw.kind === "string" ? raw.kind.trim().slice(0, 60) : "Övrigt";
  const date = typeof raw.date === "string" && raw.date ? raw.date : new Date().toISOString().slice(0, 10);
  const description = typeof raw.description === "string" ? raw.description.trim().slice(0, 400) : "";

  if (!title) {
    return Response.json({ ok: false, error: "Ange en titel." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("documents")
    .insert({
      owner_type: "coach",
      owner_id: session.coachId,
      title,
      kind,
      date,
      description,
      visibility: "coach",
      uploaded_by_coach_id: session.coachId,
    })
    .select("*")
    .single();

  if (error || !row) {
    return Response.json({ ok: false, error: "Dokumentet kunde inte sparas." }, { status: 502 });
  }

  return Response.json({ ok: true, document: toDocument(row) });
}

/** Carolina tar bort ett dokument från sitt interna arkiv. */
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

  const { documentId } = (body ?? {}) as { documentId?: unknown };
  if (typeof documentId !== "string") {
    return Response.json({ ok: false, error: "Dokumentet kunde inte hittas." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("owner_type", "coach")
    .eq("owner_id", session.coachId);

  if (error) {
    return Response.json({ ok: false, error: "Dokumentet kunde inte tas bort." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
