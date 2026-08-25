import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, getClient } from "@/lib/portal/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Carolina redigerar coachningsöverenskommelsen för en klient. */
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
  const clientId = typeof raw.clientId === "string" ? raw.clientId : "";

  if (!clientId || !getClient(session.coachId, clientId, await fetchPortalRepositoryData())) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 403 });
  }

  const agreedAt =
    typeof raw.agreedAt === "string" && raw.agreedAt ? raw.agreedAt : new Date().toISOString().slice(0, 10);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("coaching_agreements")
    .update({
      agreed_at: agreedAt,
      purpose: text(raw.purpose, 600),
      scope: text(raw.scope, 600),
      cadence: text(raw.cadence, 300),
      confidentiality: text(raw.confidentiality, 600),
      sponsor_sharing: text(raw.sponsorSharing, 600),
      ethics: text(raw.ethics, 600),
      client_responsibility: text(raw.clientResponsibility, 600),
    })
    .eq("client_id", clientId);

  if (error) {
    return Response.json({ ok: false, error: "Överenskommelsen kunde inte sparas." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
