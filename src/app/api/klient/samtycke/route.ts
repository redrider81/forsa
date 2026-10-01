import { readClientSession } from "@/lib/portal/session";
import {
  grantSpecialCategoryConsent,
  listSpecialCategoryConsents,
  listSpecialCategoryErasureRequests,
  requestSpecialCategoryErasure,
  withdrawSpecialCategoryConsent,
} from "@/lib/portal/special-category-consent";

/**
 * Klienten lämnar eller återkallar sitt samtycke till behandling av känsliga
 * personuppgifter, eller begär — efter återkallelse — radering av det
 * begränsade innehållet (Carolina genomför raderingen). Endast klientsession, endast det egna samtycket — rollen
 * och klient-id:t kommer från sessionen, aldrig från anropet. Tidsstämplar
 * sätts i databasen. Båda åtgärderna är idempotenta.
 */
export async function POST(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  if (action !== "grant" && action !== "withdraw" && action !== "request_erasure") {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const result =
    action === "grant"
      ? await grantSpecialCategoryConsent()
      : action === "withdraw"
        ? await withdrawSpecialCategoryConsent()
        : await requestSpecialCategoryErasure();
  if (!result.ok) {
    return Response.json({ ok: false, error: "Ditt val kunde inte sparas just nu. Försök igen." }, { status: 502 });
  }

  const [history, erasureRequests] = await Promise.all([
    listSpecialCategoryConsents(session.clientId),
    listSpecialCategoryErasureRequests(session.clientId),
  ]);
  return Response.json({ ok: true, history, erasureRequests });
}
