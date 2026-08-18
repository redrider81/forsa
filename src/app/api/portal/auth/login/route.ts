import { cookies } from "next/headers";
import { authenticate } from "@/lib/portal/users";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/portal/session";

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

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return Response.json(
      { ok: false, error: "Fyll i både e-post och lösenord." },
      { status: 400 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";
  if (tooManyAttempts(`${ip}:${email.trim().toLowerCase()}`)) {
    return Response.json(
      { ok: false, error: "För många försök. Vänta en stund och försök igen." },
      { status: 429 },
    );
  }

  const user = authenticate(email, password);
  if (!user) {
    return Response.json(
      { ok: false, error: "Fel e-postadress eller lösenord." },
      { status: 401 },
    );
  }

  const token = createSessionToken({
    userId: user.id,
    coachId: user.coachId,
    name: user.name,
    role: user.role,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());

  return Response.json({ ok: true });
}
