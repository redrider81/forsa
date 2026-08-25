import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Carolina completes a coaching session with learning and next steps. */
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
  const awareness = typeof raw.awareness === "string" ? raw.awareness.trim() : "";
  const insights = Array.isArray(raw.insights)
    ? (raw.insights as unknown[]).filter((item) => typeof item === "string").map((item) => (item as string).trim())
    : [];
  const commitments = Array.isArray(raw.commitments)
    ? (raw.commitments as unknown[]).filter((item) => typeof item === "string").map((item) => (item as string).trim())
    : [];
  const follow_up = Array.isArray(raw.follow_up)
    ? (raw.follow_up as unknown[]).filter((item) => typeof item === "string").map((item) => (item as string).trim())
    : [];
  const possible_next_focus = typeof raw.possible_next_focus === "string" ? raw.possible_next_focus.trim() : "";

  const data = await fetchPortalRepositoryData();
  const coachingSession = data.sessions.find((item) => item.id === sessionId);
  if (!coachingSession) {
    return Response.json({ ok: false, error: "Sessionen kunde inte hittas." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: result, error } = await supabase.rpc("complete_coaching_session", {
    p_session_id: sessionId,
    p_awareness: awareness,
    p_insights: insights,
    p_commitments: commitments,
    p_follow_up: follow_up,
    p_possible_next_focus: possible_next_focus,
  });

  if (error) {
    return Response.json({ ok: false, error: "Kunde inte slutföra sessionen." }, { status: 502 });
  }

  return Response.json({ ok: true, sessionId: result });
}
