import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase Auth Admin client. Server-only and used for exactly two things:
 * provisioning a client's account with its one-time activation link, and
 * the "Glömt lösenord?" reset link (resolved through the service-role-only
 * client_recovery_target function). Never used for table reads or writes —
 * those stay under the signed-in user's RLS through lib/supabase/server.ts.
 *
 * SUPABASE_SECRET_KEY must never get a NEXT_PUBLIC_ prefix. Without it the
 * invitation feature is simply unavailable in that environment.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) return null;

  return createClient<Database>(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export type SupabaseAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;
