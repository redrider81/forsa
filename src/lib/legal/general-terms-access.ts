import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readCoachSession, readClientSession } from "@/lib/portal/session";
import { CURRENT_GENERAL_TERMS_VERSION, isGeneralTermsVersion } from "@/lib/legal/terms-versions";

/** Current general terms are public at /villkor; the versioned URL mirrors that. */
export function isPublicGeneralTermsVersion(version: string): boolean {
  return version === CURRENT_GENERAL_TERMS_VERSION;
}

/**
 * Historical pinned versions are contract evidence — not anonymous public pages.
 * Access when the signed-in client or coach has a contract pinned to that version.
 */
export async function canReadGeneralTermsVersion(version: string): Promise<boolean> {
  if (!isGeneralTermsVersion(version)) return false;
  if (isPublicGeneralTermsVersion(version)) return true;

  const clientSession = await readClientSession();
  const coachSession = await readCoachSession();
  if (!clientSession && !coachSession) return false;

  const supabase = await createSupabaseServerClient();

  if (clientSession) {
    const { data } = await supabase
      .from("contracts")
      .select("id")
      .eq("client_id", clientSession.clientId)
      .eq("general_terms_version", version)
      .limit(1);
    if (data?.length) return true;
  }

  if (coachSession) {
    const { data } = await supabase
      .from("contracts")
      .select("id")
      .eq("coach_id", coachSession.coachId)
      .eq("general_terms_version", version)
      .limit(1);
    if (data?.length) return true;
  }

  return false;
}
