import { readClientSession } from "@/lib/portal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Klientens förberedelse inför nästa samtal. Klientägd information. */
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

  const { focus, desiredOutcome, changed, followUp } = (body ?? {}) as Record<string, unknown>;

  const field = (value: unknown, max = 700): string =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  const prep = {
    focus: field(focus),
    desiredOutcome: field(desiredOutcome),
    changed: field(changed),
    followUp: field(followUp),
  };

  if (!prep.focus && !prep.desiredOutcome && !prep.changed && !prep.followUp) {
    return Response.json({ ok: false, error: "Fyll i minst ett fält." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("session_preparations")
    .upsert(
      {
        client_id: session.clientId,
        focus: prep.focus,
        desired_outcome: prep.desiredOutcome,
        changed: prep.changed,
        follow_up: prep.followUp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" },
    );

  if (error) {
    return Response.json({ ok: false, error: "Det gick inte att spara." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
