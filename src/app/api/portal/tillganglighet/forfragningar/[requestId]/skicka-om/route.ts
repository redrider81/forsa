import { readCoachSession } from "@/lib/portal/session";
import { getPublicBookingRequestForCoach } from "@/lib/portal/availability";
import {
  dispatchBookingNotifications,
  listBookingNotifications,
} from "@/lib/portal/booking-notifications";
import {
  BOOKING_NOTIFICATION_EVENTS,
  type BookingNotificationEvent,
} from "@/lib/email/booking-emails";

/**
 * Retry one failed booking notification. Coach-authorised only.
 *
 * It acts purely on an existing ledger row: it never creates a booking and
 * never repeats an accepted/declined transition. The original deterministic
 * idempotency key and the same canonical payload are reused, and a
 * notification already recorded as `sent` is refused rather than re-sent.
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
  const eventType = BOOKING_NOTIFICATION_EVENTS.find((event) => event === raw.eventType) as
    | BookingNotificationEvent
    | undefined;
  if (!eventType) {
    return Response.json({ ok: false, error: "Ogiltig notistyp." }, { status: 400 });
  }

  const { requestId } = await params;

  // Both reads run under the coach's own RLS policies, so a coach can only
  // ever retry a notification belonging to their own booking request.
  const stored = await getPublicBookingRequestForCoach(requestId);
  if (!stored) {
    return Response.json({ ok: false, error: "Förfrågan hittades inte." }, { status: 404 });
  }

  const existing = listNotification(await listBookingNotifications(requestId), eventType);
  if (!existing) {
    return Response.json({ ok: false, error: "Notisen hittades inte." }, { status: 404 });
  }
  if (existing.status === "sent") {
    return Response.json({ ok: false, error: "Notisen är redan skickad." }, { status: 409 });
  }

  const [outcome] = await dispatchBookingNotifications({
    requestId,
    events: [eventType],
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

  return Response.json({ ok: outcome?.status === "sent", status: outcome?.status ?? "failed" });
}

function listNotification(
  records: Awaited<ReturnType<typeof listBookingNotifications>>,
  eventType: BookingNotificationEvent,
) {
  return records.find((record) => record.event === eventType) ?? null;
}
