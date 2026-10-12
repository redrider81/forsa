import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase Auth session refresh for CVB Base, once per request.
 *
 * Server Components cannot write cookies. Without this, an expired access
 * token was refreshed separately by every Server Component client in the
 * same render, none could persist the rotated tokens, and Supabase Auth
 * revoked the session as refresh-token reuse — the user was signed out
 * about an hour after signing in. Here the refresh happens before render,
 * the new tokens are handed to the render through the request cookies and
 * persisted through the response.
 *
 * Authorisation is unchanged: it stays in the layouts, routes and RLS.
 * Limited to the portal, so the public website is not affected.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
        },
      },
    },
  );

  // Refreshes the session when the access token has expired; a no-op
  // without a session.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/cvb-base/:path*",
    "/klient",
    "/klient/:path*",
    "/klient-login",
    "/coach-login",
    "/carolina",
    "/logga-in",
    "/api/portal/:path*",
    "/api/klient/:path*",
  ],
};
