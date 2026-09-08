import { readCoachSession } from "@/lib/portal/session";
import {
  getPublicBookingRequestForCoach,
  respondToPublicBookingRequest,
} from "@/lib/portal/availability";
import { dispatchBookingNotifications } from "@/lib/portal/booking-notifications";
import type { BookingNotificationEvent } from "@/lib/email/booking-emails";

/**
 * Carolina accepts, declines or cancels a public booking request from the
 * website. Cancelling applies to an already accepted reservation and frees
 * the window again; the row itself is kept as history.
 *
 * Accepting an introductory call creates nothing else: no client, auth
 * user, profile, engagement, coaching agreement, goal, session or CVB Base
 * access. The customer email is attempted only after the status change has
 * committed, and a failed send never reverts the transition.
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

  // Committed from here on. Accept and decline each have exactly one
  // customer notification; cancel has none in this pass.
  const event: BookingNotificationEvent | null =
    action === "accept"
      ? "customer_request_accepted"
      : action === "decline"
        ? "customer_request_declined"
        : null;

  if (event) {
    const stored = await getPublicBookingRequestForCoach(requestId);
    if (stored) {
      await dispatchBookingNotifications({
        requestId,
        events: [event],
        context: {
          name: stored.name,
          email: stored.email,
          phone: stored.phone,
          message: stored.message,
          requestedStartAt: stored.requestedStartAt,
          requestedEndAt: stored.requestedEndAt,
          locale: stored.locale,
        },
      });
    }
  }

  return Response.json({ ok: true });
}
