import "server-only";

import type { PortalRole } from "@/lib/portal/token";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase Auth (e-post + lösenord), inbjudningsbaserad. Ingen publik
 * registrering — CVB skapar coachingrelationen och bjuder in klienten via
 * Supabase Auth Admin API, som sätter raw_user_meta_data.portal_role och
 * .portal_subject_id. En trigger i databasen (handle_new_auth_user) skapar
 * då en profiles-rad som kopplar auth-användaren till rätt coach eller klient.
 */

/** Demokontots e-post, endast för den renderade inloggningsledtråden nedan. */
const DEMO_HINT_EMAIL: Record<PortalRole, string> = {
  coach: "carolina@cvbcoaching.se",
  klient: "emma@northlinestudio.se",
};

export type PortalUser = {
  id: string;
  email: string;
  name: string;
  role: PortalRole;
  /** coachId för coacher, clientId för klienter. */
  subjectId: string;
};

/**
 * Utfallet av ett inloggningsförsök. "invalid" täcker både fel uppgifter och
 * ett konto utan behörighet till den efterfrågade portalen — de får samma
 * svar, så att svaret inte avslöjar vilka konton som finns. "unavailable" är
 * ett tekniskt fel (Auth eller databasen) och får aldrig se ut som fel
 * lösenord.
 */
export type AuthenticationResult =
  | { ok: true; user: PortalUser }
  | { ok: false; reason: "invalid" | "unavailable" };

/**
 * Autentiserar mot Supabase Auth och slår sedan upp profilen. En klient kan
 * aldrig logga in som coach — rollen kommer från profiles, inte från vad
 * anroparen skickar, och matchas mot den efterfrågade rollen här.
 */
export async function authenticate(
  email: string,
  password: string,
  role: PortalRole,
): Promise<AuthenticationResult> {
  const supabase = await createSupabaseServerClient();
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (signInError) {
    // Supabase Auth answers rejected credentials with 400; anything else
    // (rate limit, 5xx, network) is a fault on our side.
    return { ok: false, reason: signInError.status === 400 ? "invalid" : "unavailable" };
  }
  if (!signIn.user) return { ok: false, reason: "invalid" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, coach_id, client_id, email, name")
    .eq("id", signIn.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    console.error("[CVB Coaching] Profilen kunde inte läsas vid inloggning");
    return { ok: false, reason: "unavailable" };
  }

  const subjectId = profile?.role === "coach" ? profile.coach_id : profile?.client_id;
  if (!profile || profile.role !== role || !subjectId) {
    await supabase.auth.signOut();
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      subjectId,
    },
  };
}

/**
 * Demoledtråd som renderas server-side i inloggningsvyn så att demon går att
 * använda utan instruktion. Stäng av med PORTAL_SHOW_DEMO_HINT=false.
 * Värdet ingår aldrig i klientbundlen — det skickas som renderad text.
 * Visar endast e-postadressen ett riktigt Supabase Auth-konto ska bjudas in
 * med. Lösenordet visas eller förifylls aldrig — det sätts vid inbjudan och
 * är känt av kontots ägare.
 */
export function demoHint(role: PortalRole): { email: string } | null {
  if (process.env.PORTAL_SHOW_DEMO_HINT === "false") return null;
  return { email: DEMO_HINT_EMAIL[role] };
}
