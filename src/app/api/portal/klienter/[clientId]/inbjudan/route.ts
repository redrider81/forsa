import { readCoachSession } from "@/lib/portal/session";
import {
  CONFIG_ERROR,
  createInvitationProvider,
  resolveInvitationConfig,
  sendClientInvitation,
  type InvitationAdmin,
  type InvitationDb,
} from "@/lib/portal/client-invitations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Carolina sends — or re-sends — a client's invitation to CVB Base.
 * Coach-authorised; ownership, eligibility and identity conflicts are
 * decided in the database under her own session. No body is read: the
 * recipient is always the client's stored address.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { clientId } = await params;
  if (!UUID.test(clientId)) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 404 });
  }

  // Configuration is checked before anything is provisioned, so a missing
  // setting can never leave an account or a pending invitation behind.
  const configResult = resolveInvitationConfig();
  const admin = createSupabaseAdminClient();
  const provider = configResult.ok && admin ? await createInvitationProvider() : null;
  if (!configResult.ok || !admin || !provider) {
    console.error("[CVB Coaching] Inbjudan ej konfigurerad", {
      reason: configResult.ok ? (admin ? "missing_provider" : "missing_secret_key") : configResult.reason,
    });
    return Response.json({ ok: false, error: CONFIG_ERROR }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const outcome = await sendClientInvitation(clientId, {
    db: supabase as unknown as InvitationDb,
    admin: admin as unknown as InvitationAdmin,
    provider,
    config: configResult.config,
  });

  if (!outcome.ok) {
    return Response.json({ ok: false, error: outcome.error, code: outcome.code }, { status: outcome.httpStatus });
  }
  return Response.json({ ok: true, status: outcome.status });
}
