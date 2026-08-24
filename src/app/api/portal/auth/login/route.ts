import { authenticate } from "@/lib/portal/users";
import type { PortalRole } from "@/lib/portal/token";

/** Enkel skydd mot upprepade försök. Räcker för demon. */
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { email, password, role } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return Response.json({ ok: false, error: "Fyll i både e-post och lösenord." }, { status: 400 });
  }

  // Rollen avgör vilken profiltyp som accepteras. En klient kan aldrig logga
  // in som coach även om hon skickar role: "coach" — authenticate() matchar
  // mot profiles.role, inte mot vad anroparen påstår.
  const requestedRole: PortalRole = role === "klient" ? "klient" : "coach";

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";
  if (tooManyAttempts(`${ip}:${requestedRole}:${email.trim().toLowerCase()}`)) {
    return Response.json(
      { ok: false, error: "För många försök. Vänta en stund och försök igen." },
      { status: 429 },
    );
  }

  const user = await authenticate(email, password, requestedRole);
  if (!user) {
    return Response.json({ ok: false, error: "Fel e-postadress eller lösenord." }, { status: 401 });
  }

  // Supabase Auth-sessionen sätts redan av authenticate() via
  // createSupabaseServerClient() — ingen egen cookie behöver skrivas här.
  return Response.json({ ok: true, role: user.role });
}
