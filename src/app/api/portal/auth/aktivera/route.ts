import { isActivationType, isValidTokenHash, passwordProblem } from "@/lib/portal/activation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Same simple per-instance throttle as the login route. */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const LINK_INVALID =
  "Länken har gått ut eller redan använts. Begär en ny länk via ”Glömt lösenord?” på inloggningssidan, eller logga in om du redan har valt ett lösenord.";
const NOT_A_CLIENT = "Kontot är inte kopplat till någon klient i CVB Base. Kontakta Carolina.";
const GENERIC = "Lösenordet kunde inte sparas. Begär en ny länk via ”Glömt lösenord?” och försök igen.";

/**
 * First-time activation of an invited client account, and the password
 * reset from "Glömt lösenord?" (type "recovery") — the same Supabase
 * verification and the same rules.
 *
 * The one-time token (from the link fragment, posted in the body) is
 * verified by Supabase Auth, which enforces expiry and single use and sets
 * the session cookies through @supabase/ssr. Identity comes from the
 * verified session and its profile — nothing in the request names a client
 * or a role. The password is validated before the token is spent.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { tokenHash, type, password } = (body ?? {}) as Record<string, unknown>;
  if (!isValidTokenHash(tokenHash) || !isActivationType(type)) {
    return Response.json({ ok: false, error: LINK_INVALID }, { status: 400 });
  }
  const problem = passwordProblem(password);
  if (problem) {
    return Response.json({ ok: false, error: problem }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";
  if (tooManyAttempts(`aktivera:${ip}`)) {
    return Response.json({ ok: false, error: "För många försök. Vänta en stund och försök igen." }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (verifyError || !verified.user || !verified.session) {
    return Response.json({ ok: false, error: LINK_INVALID }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", verified.user.id)
    .single();
  // PGRST116 is .single()'s "no row": an account without a client link,
  // handled below. Any other error is a database fault.
  if (profileError && profileError.code !== "PGRST116") {
    // A database fault, not a missing client link: say so, without details.
    await supabase.auth.signOut();
    console.error("[CVB Coaching] Profilen kunde inte läsas vid aktivering");
    return Response.json({ ok: false, error: GENERIC }, { status: 503 });
  }
  if (!profile || profile.role !== "klient" || !profile.client_id) {
    await supabase.auth.signOut();
    return Response.json({ ok: false, error: NOT_A_CLIENT }, { status: 403 });
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password: password as string });
  if (passwordError) {
    // The link is spent. Sign out so no half-activated session lingers;
    // Carolina can send a new link (the account is not marked activated).
    await supabase.auth.signOut();
    const weak = passwordError.code === "weak_password";
    return Response.json(
      { ok: false, error: weak ? "Lösenordet godtogs inte. Begär en ny länk via ”Glömt lösenord?” och välj ett starkare lösenord." : GENERIC },
      { status: 400 },
    );
  }

  // A new password ends every other session of the account (e.g. a device
  // that someone else may still be signed in on). Not fatal if it fails.
  const { error: othersError } = await supabase.auth.signOut({ scope: "others" });
  if (othersError) console.error("[CVB Coaching] Övriga sessioner kunde inte avslutas");

  const { error: markError } = await supabase.rpc("mark_own_client_invitation_activated");
  if (markError) {
    // Access works; only the coach-facing status lags. Logged without identifiers.
    console.error("[CVB Coaching] Aktivering kunde inte registreras");
  }

  return Response.json({ ok: true });
}
