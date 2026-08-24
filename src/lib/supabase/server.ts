import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Server-side Supabase client. Runs as the signed-in user (via the Supabase
 * Auth session cookie) — access is enforced by RLS, not by this client.
 * Called fresh per request; Supabase Auth session cookies are managed by
 * @supabase/ssr through the same cookies() API the rest of the portal uses.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render — cookies can't be
            // written there. Safe to ignore: the session is refreshed on
            // the next route handler call.
          }
        },
      },
    },
  );
}
