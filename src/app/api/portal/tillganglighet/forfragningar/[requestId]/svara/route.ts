import { readCoachSession } from "@/lib/portal/session";
import { respondToPublicBookingRequest } from "@/lib/portal/availability";

/**
 * Carolina accepts, declines or cancels a public booking request from the
 * website. Cancelling applies to an already accepted reservation and frees
 * the slot again; the row itself is kept as history.
 */
export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const action =
    raw.action === "accept" || raw.action === "decline" || raw.action === "cancel" ? raw.action : null;
  if (!action) {
    return Response.json({ ok: false, error: "Ogiltig åtgärd." }, { status: 400 });
  }

  const { requestId } = await params;
  const result = await respondToPublicBookingRequest(requestId, action);
  if (!result.ok) {
    return Response.json({ ok: false, error: "Kunde inte besvara förfrågan." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
