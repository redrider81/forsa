import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Carolina uppdaterar dagens överenskommelse (klientens fokus, önskat resultat) för en session. */
export async function PATCH(request: Request) {
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
  const clientFocus = typeof raw.clientFocus === "string" ? raw.clientFocus.trim().slice(0, 700) : "";
  const desiredOutcome = typeof raw.desiredOutcome === "string" ? raw.desiredOutcome.trim().slice(0, 700) : "";
  const exploration = typeof raw.exploration === "string" ? raw.exploration.trim().slice(0, 700) : "";

  const data = await fetchPortalRepositoryData();
  const coachingSession = data.sessions.find((item) => item.id === sessionId);
  if (!coachingSession) {
    return Response.json({ ok: false, error: "Sessionen kunde inte hittas." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("sessions")
    .update({ client_focus: clientFocus, desired_outcome: desiredOutcome })
    .eq("id", sessionId);

  if (error) {
    return Response.json({ ok: false, error: "Kunde inte sparas." }, { status: 502 });
  }

  const { error: explorationError } = await supabase.rpc("upsert_coach_meeting_exploration", {
    p_session_id: sessionId,
    p_follow_up: exploration,
  });

  if (explorationError) {
    return Response.json({ ok: false, error: "Kunde inte sparas." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
