import "server-only";

import type { PortalRole } from "@/lib/portal/token";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sessionen är Supabase Auths egen — cookien sätts och läses av
 * @supabase/ssr (se lib/supabase/server.ts), inte av denna modul. Detta
 * lager slår bara upp vilken profil (coach eller klient) den inloggade
 * Auth-användaren är kopplad till.
 */

type PortalProfile = {
  id: string;
  role: PortalRole;
  coach_id: string | null;
  client_id: string | null;
  name: string;
};

async function readProfile(): Promise<PortalProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, coach_id, client_id, name")
    .eq("id", userData.user.id)
    .single();

  return profile ?? null;
}

export type CoachSession = { userId: string; name: string; coachId: string };
export type ClientSession = { userId: string; name: string; clientId: string };
export type PortalSession = { userId: string; name: string; role: PortalRole };

/** Rollagnostisk sessionsläsning — används av inloggningsvyerna för att avgöra vart en redan inloggad användare ska skickas. */
export async function readSession(): Promise<PortalSession | null> {
  const profile = await readProfile();
  if (!profile) return null;
  return { userId: profile.id, name: profile.name, role: profile.role };
}

/**
 * Coachsession. En klientsession ger aldrig coachåtkomst — rollen kommer från
 * profiles-raden kopplad till den signerade Supabase Auth-sessionen och kan
 * inte sättas från klienten.
 */
export async function readCoachSession(): Promise<CoachSession | null> {
  const profile = await readProfile();
  if (!profile || profile.role !== "coach" || !profile.coach_id) return null;
  return { userId: profile.id, name: profile.name, coachId: profile.coach_id };
}

/** Klientsession. Ger endast åtkomst till den egna coachingrelationen. */
export async function readClientSession(): Promise<ClientSession | null> {
  const profile = await readProfile();
  if (!profile || profile.role !== "klient" || !profile.client_id) return null;
  return { userId: profile.id, name: profile.name, clientId: profile.client_id };
}
