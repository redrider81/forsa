import { readCoachSession } from "@/lib/portal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Carolina edits her own coach profile (name, title, credential, focus). */
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
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const credential = typeof raw.credential === "string" ? raw.credential.trim() : "";
  const focus = typeof raw.focus === "string" ? raw.focus.trim() : "";

  if (!name || !title || !credential || !focus) {
    return Response.json({ ok: false, error: "Alla fält måste vara ifyllda." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("coaches")
    .update({ name, title, credential, focus })
    .eq("id", session.coachId);

  if (error) {
    return Response.json({ ok: false, error: "Kunde inte spara profilen." }, { status: 502 });
  }

  return Response.json({ ok: true, name, title, credential, focus });
}
