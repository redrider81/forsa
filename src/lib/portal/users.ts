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
 * Autentiserar mot Supabase Auth och slår sedan upp profilen. En klient kan
 * aldrig logga in som coach — rollen kommer från profiles, inte från vad
 * anroparen skickar, och matchas mot den efterfrågade rollen här.
 */
export async function authenticate(
  email: string,
  password: string,
  role: PortalRole,
): Promise<PortalUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (signInError || !signIn.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, coach_id, client_id, email, name")
    .eq("id", signIn.user.id)
    .single();

  const subjectId = profile?.role === "coach" ? profile.coach_id : profile?.client_id;
  if (!profile || profile.role !== role || !subjectId) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    subjectId,
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
