import { after } from "next/server";
import { createInvitationProvider, resolveInvitationConfig } from "@/lib/portal/client-invitations";
import { normalizeRecoveryEmail, sendClientPasswordReset, type RecoveryAdmin } from "@/lib/portal/password-recovery";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Per-instance throttles, as in the login route; the database adds a durable per-account limit. */
const byIp = new Map<string, { count: number; firstAt: number }>();
const byEmail = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;

function exceeded(store: Map<string, { count: number; firstAt: number }>, key: string, max: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

const NEUTRAL = {
  ok: true,
  message:
    "Om adressen hör till ett konto i CVB Base skickar vi en länk för att välja nytt lösenord. Kontrollera din inkorg inom några minuter.",
};

/**
 * "Glömt lösenord?" for clients. Every well-formed request gets the same
 * answer, immediately; the lookup and the email happen after the response,
 * so neither the content nor the timing reveals whether the address is
 * registered. Nothing in the request can name a role or a client.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const email = normalizeRecoveryEmail((body as Record<string, unknown> | null)?.email);
  if (!email) {
    return Response.json({ ok: false, error: "Ange en giltig e-postadress." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";
  if (exceeded(byIp, ip, 5)) {
    return Response.json({ ok: false, error: "För många försök. Vänta en stund och försök igen." }, { status: 429 });
  }
  if (exceeded(byEmail, email, 3)) {
    return Response.json(NEUTRAL);
  }

  after(async () => {
    const configResult = resolveInvitationConfig();
    const admin = createSupabaseAdminClient();
    const provider = configResult.ok && admin ? await createInvitationProvider() : null;
    if (!configResult.ok || !admin || !provider) {
      console.error("[CVB Coaching] Återställning ej konfigurerad");
      return;
    }
    await sendClientPasswordReset(email, {
      admin: admin as unknown as RecoveryAdmin,
      provider,
      config: configResult.config,
    });
  });

  return Response.json(NEUTRAL);
}
