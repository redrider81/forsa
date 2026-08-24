import { readClientSession } from "@/lib/portal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Klienten skriver en egen reflektion. Reflektionen knyts alltid till den
 * inloggade klientens id — reflections_insert_klient (RLS) kräver
 * client_id = current_client_id(), så ett id som skickas från klienten kan
 * aldrig sättas för någon annan.
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

  const { text, prompt } = (body ?? {}) as { text?: unknown; prompt?: unknown };

  if (typeof text !== "string" || text.trim().length < 5) {
    return Response.json({ ok: false, error: "Skriv några rader först." }, { status: 400 });
  }
  if (text.length > 1500) {
    return Response.json(
      { ok: false, error: "Reflektionen är för lång. Korta ner den och försök igen." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("reflections")
    .insert({
      client_id: session.clientId,
      date: new Date().toISOString().slice(0, 10),
      prompt: typeof prompt === "string" && prompt.trim() ? prompt.trim().slice(0, 120) : "Egen reflektion",
      text: text.trim(),
    })
    .select("*")
    .single();

  if (error || !row) {
    return Response.json({ ok: false, error: "Det gick inte att spara." }, { status: 502 });
  }

  return Response.json({
    ok: true,
    reflection: {
      id: row.id,
      clientId: row.client_id,
      date: row.date,
      prompt: row.prompt,
      text: row.text,
    },
  });
}

/**
 * Klienten tar bort en reflektion hon själv har skrivit.
 * Klientens autonomi över sitt eget material — RLS (reflections_delete_klient)
 * garanterar att ingen kan ta bort någon annans.
 */
export async function DELETE(request: Request) {
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

  const { id } = (body ?? {}) as { id?: unknown };
  if (typeof id !== "string") {
    return Response.json({ ok: false, error: "Reflektionen kunde inte hittas." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("reflections")
    .delete()
    .eq("id", id)
    .eq("client_id", session.clientId)
    .select("id");

  if (error) {
    return Response.json({ ok: false, error: "Reflektionen kunde inte hittas." }, { status: 403 });
  }
  if (!rows || rows.length === 0) {
    return Response.json({ ok: false, error: "Reflektionen kunde inte hittas." }, { status: 403 });
  }

  return Response.json({ ok: true });
}
