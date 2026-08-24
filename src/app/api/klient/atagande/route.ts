import { readClientSession } from "@/lib/portal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATUSES = new Set(["oppet", "pagar", "genomfort"]);

/**
 * Klienten uppdaterar status på ett eget åtagande.
 * update_own_commitment_status (SECURITY DEFINER) begränsar detta till
 * status/client_note/completed_at på åtaganden som tillhör den inloggade
 * klienten — samma ägarkontroll som tidigare, nu upprätthållen av databasen.
 */
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

  const { commitmentId, status, clientNote } = (body ?? {}) as Record<string, unknown>;

  if (typeof commitmentId !== "string" || typeof status !== "string" || !STATUSES.has(status)) {
    return Response.json({ ok: false, error: "Ogiltig uppdatering." }, { status: 400 });
  }

  const note = typeof clientNote === "string" ? clientNote.trim().slice(0, 400) : "";
  const completedAt = status === "genomfort" ? new Date().toISOString().slice(0, 10) : null;

  const supabase = await createSupabaseServerClient();
  // Den genererade RPC-signaturen markerar p_client_note/p_completed_at som
  // icke-nullbara trots att SQL-funktionen accepterar NULL för båda —
  // typegeneratorn känner inte av nullbarhet på funktionsparametrar.
  const { error } = await supabase.rpc("update_own_commitment_status", {
    p_commitment_id: commitmentId,
    p_status: status as "oppet" | "pagar" | "genomfort",
    p_client_note: (note || null) as unknown as string,
    p_completed_at: completedAt as unknown as string,
  });

  if (error) {
    return Response.json({ ok: false, error: "Åtagandet kunde inte hittas." }, { status: 403 });
  }

  return Response.json({ ok: true });
}
