import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import {
  coachCanApproveSessionSummary,
  hasSessionSummaryContent,
  parseSessionSummaryDraft,
} from "@/lib/portal/session-summary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Coachen godkänner ett sessionssammanfattningsutkast och delar det med klienten.
 * Godkännande sker server-side — klienten kan aldrig anropa denna route.
 */
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

  const { clientId, sessionId, draft } = (body ?? {}) as {
    clientId?: unknown;
    sessionId?: unknown;
    draft?: unknown;
  };

  if (typeof clientId !== "string" || typeof sessionId !== "string" || !clientId || !sessionId) {
    return Response.json({ ok: false, error: "Klient eller session saknas." }, { status: 400 });
  }
  if (typeof draft !== "string" || draft.trim().length < 15) {
    return Response.json(
      { ok: false, error: "Sammanfattningen saknar innehåll att godkänna." },
      { status: 400 },
    );
  }
  if (draft.length > 12000) {
    return Response.json({ ok: false, error: "Sammanfattningen är för lång." }, { status: 400 });
  }

  const data = await fetchPortalRepositoryData();
  if (!coachCanApproveSessionSummary(session.coachId, clientId, sessionId, data)) {
    return Response.json({ ok: false, error: "Sessionen kunde inte hittas." }, { status: 404 });
  }

  const parsed = parseSessionSummaryDraft(draft);
  if (!hasSessionSummaryContent(parsed)) {
    return Response.json(
      { ok: false, error: "Sammanfattningen saknar innehåll att godkänna." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: result, error } = await supabase.rpc("approve_session_summary", {
    p_session_id: sessionId,
    p_client_id: clientId,
    p_focus: parsed.focus,
    p_insights: parsed.insights,
    p_awareness: parsed.awareness,
    p_new_perspectives: parsed.newPerspectives,
    p_commitments: parsed.commitments,
    p_follow_up: parsed.followUp,
    p_possible_next_focus: parsed.possibleNextFocus,
  });

  if (error || !result) {
    return Response.json({ ok: false, error: "Det gick inte att godkänna sammanfattningen." }, { status: 502 });
  }

  return Response.json({ ok: true, sessionId: result });
}
