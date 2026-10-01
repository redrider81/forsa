import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  activeConsent,
  SPECIAL_CATEGORY_CONSENT_VERSION,
  type SpecialCategoryConsentRecord,
  type SpecialCategoryErasureRequest,
} from "@/lib/portal/special-category-consent-rules";

/**
 * Consent history for one client, newest first. Runs under RLS: a client
 * only ever sees their own rows, the coach only her own clients'.
 */
export async function listSpecialCategoryConsents(clientId: string): Promise<SpecialCategoryConsentRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("special_category_consents")
    .select("id, consent_version, granted_at, withdrawn_at")
    .eq("client_id", clientId)
    .order("granted_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    version: row.consent_version,
    grantedAt: row.granted_at,
    withdrawnAt: row.withdrawn_at,
  }));
}

/**
 * The deterministic AI gate. Any read error counts as "no consent", so a
 * failure can only ever exclude content, never include it.
 */
export async function hasActiveSpecialCategoryConsent(clientId: string): Promise<boolean> {
  try {
    return activeConsent(await listSpecialCategoryConsents(clientId)) !== null;
  } catch {
    return false;
  }
}

export async function grantSpecialCategoryConsent(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("grant_special_category_consent", {
    p_version: SPECIAL_CATEGORY_CONSENT_VERSION,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function withdrawSpecialCategoryConsent(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("withdraw_special_category_consent");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Erasure requests for one client, newest first (RLS: own / own clients). */
export async function listSpecialCategoryErasureRequests(clientId: string): Promise<SpecialCategoryErasureRequest[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("special_category_erasure_requests")
    .select("id, cutoff, requested_at, completed_at")
    .eq("client_id", clientId)
    .order("requested_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    cutoff: row.cutoff,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
  }));
}

/** Client only, after withdrawal. Idempotent while a request is open. */
export async function requestSpecialCategoryErasure(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("request_special_category_erasure");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Owning coach only, and only with an open request. */
export async function eraseSpecialCategoryContent(clientId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("erase_special_category_content", { p_client_id: clientId });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Coach-facing count of client-authored items written outside every consent
 * window — private to the client. Computed in the database
 * (count_client_private_content), which returns a number only.
 */
export async function countClientPrivateContent(clientId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("count_client_private_content", { p_client_id: clientId });
  return error || typeof data !== "number" ? 0 : data;
}
