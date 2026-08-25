import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Carolinas privata coachanteckningar för en session. Aldrig synliga för klienten. */
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
  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId : "";
  const notes = typeof raw.notes === "string" ? raw.notes.trim().slice(0, 4000) : "";

  const data = await fetchPortalRepositoryData();
  const coachingSession = data.sessions.find((item) => item.id === sessionId);
  if (!coachingSession) {
    return Response.json({ ok: false, error: "Sessionen kunde inte hittas." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("session_coach_notes").upsert(
    {
      session_id: sessionId,
      coach_id: session.coachId,
      notes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" },
  );

  if (error) {
    return Response.json({ ok: false, error: "Kunde inte sparas." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
