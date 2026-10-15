import { readCoachSession } from "@/lib/portal/session";
import { parseManualSessionInput, registerManualSession, type ManualSessionDb } from "@/lib/portal/manual-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Carolina records a session that has already taken place (CVB-CR-20261015-01).
 * No booking is required or created, and nothing is emailed.
 */
export async function POST(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { clientId } = await params;
  if (!UUID.test(clientId)) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }
  const input = parseManualSessionInput(body);
  if (!input) {
    return Response.json({ ok: false, error: "Ange datum, starttid och sluttid." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const outcome = await registerManualSession(clientId, input, { db: supabase as unknown as ManualSessionDb });
  if (!outcome.ok) {
    return Response.json({ ok: false, error: outcome.error, code: outcome.code }, { status: outcome.httpStatus });
  }
  return Response.json({ ok: true, sessionId: outcome.sessionId });
}
