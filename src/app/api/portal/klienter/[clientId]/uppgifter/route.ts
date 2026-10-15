import { readCoachSession } from "@/lib/portal/session";
import {
  parseClientDetailsInput,
  updateClientDetails,
  type ClientDetailsAdmin,
  type ClientDetailsDb,
} from "@/lib/portal/client-details";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Carolina corrects a client's name, role, email and phone (CVB-CR-20261015-01).
 * Ownership, validation, duplicates and identity conflicts are decided in the
 * database under her own session; the Auth Admin client is used only to
 * re-address the client's own linked account when the email changes.
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
  const input = parseClientDetailsInput(body);
  if (!input) {
    return Response.json({ ok: false, error: "Ogiltiga klientuppgifter." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const outcome = await updateClientDetails(clientId, input, {
    db: supabase as unknown as ClientDetailsDb,
    admin: createSupabaseAdminClient() as unknown as ClientDetailsAdmin | null,
  });

  if (!outcome.ok) {
    return Response.json({ ok: false, error: outcome.error, code: outcome.code }, { status: outcome.httpStatus });
  }
  return Response.json({ ok: true, emailChanged: outcome.emailChanged });
}
