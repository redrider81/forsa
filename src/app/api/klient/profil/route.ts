import { readClientSession } from "@/lib/portal/session";
import { updateOwnProfile } from "@/lib/portal/own-profile";
import type { ClientDetailsAdmin, ClientDetailsDb } from "@/lib/portal/client-details";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Klienten uppdaterar namn, roll och kontaktuppgifter i sin profil.
 * Organisation och coachningsöverenskommelse ändras inte här.
 *
 * CVB-CR-20261021-01: ett byte av e-postadress följer med till klientens
 * eget inloggningskonto och profil (updateOwnProfile), så att hon loggar in
 * med samma adress som Carolina och utskicken ser. Beslutet fattas i
 * databasen under klientens egen session; Auth Admin används bara för att
 * flytta hennes eget konto till den nya adressen.
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

  const { name, role, email, phone } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof role !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string"
  ) {
    return Response.json({ ok: false, error: "Ogiltig profil." }, { status: 400 });
  }

  const trimmedName = name.trim().slice(0, 80);
  const trimmedRole = role.trim().slice(0, 120);
  const trimmedEmail = email.trim().slice(0, 120).toLowerCase();
  const trimmedPhone = phone.trim().slice(0, 40);

  if (trimmedName.length < 2) {
    return Response.json({ ok: false, error: "Ange ditt namn." }, { status: 400 });
  }

  if (trimmedRole.length < 2) {
    return Response.json({ ok: false, error: "Ange din roll eller titel." }, { status: 400 });
  }

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return Response.json({ ok: false, error: "Ange en giltig e-postadress." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const outcome = await updateOwnProfile(
    { name: trimmedName, role: trimmedRole, email: trimmedEmail, phone: trimmedPhone },
    {
      db: supabase as unknown as ClientDetailsDb,
      admin: createSupabaseAdminClient() as unknown as ClientDetailsAdmin | null,
    },
  );

  if (!outcome.ok) {
    return Response.json({ ok: false, error: outcome.error, code: outcome.code }, { status: outcome.httpStatus });
  }

  return Response.json({ ok: true, emailChanged: outcome.emailChanged });
}
