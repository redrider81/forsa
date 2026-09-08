import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchBookingNotifications } from "@/lib/portal/booking-notifications";

const MESSAGES: Record<string, string> = {
  SLOT_UNAVAILABLE: "Tiden hann precis bli bokad. Välj gärna en annan tid.",
  BOOKING_DISABLED: "Bokning är tillfälligt pausad. Kontakta oss gärna så återkommer vi.",
  INVALID_SLOT: "Den valda tiden är inte längre giltig. Välj gärna en annan tid.",
  INVALID_REQUEST: "Fyll i namn, e-post och telefon innan du skickar förfrågan.",
};

/**
 * Public, unauthenticated: reserves one prospective availability window
 * atomically. No client, auth user, profile, engagement, coaching
 * agreement, goal, session or CVB Base access is created — only a pending
 * public_booking_requests row for Carolina to review, plus its two outbox
 * rows, written in the same transaction by the RPC.
 *
 * Email is a post-commit side effect. A failed send never turns a committed
 * booking into a reported failure.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  const startAt = typeof raw.startAt === "string" ? raw.startAt : "";
  const endAt = typeof raw.endAt === "string" ? raw.endAt : "";
  const locale = raw.locale === "en" ? "en" : "sv";

  if (!slug || !name || !email || !phone || !startAt || !endAt) {
    return Response.json({ ok: false, error: MESSAGES.INVALID_REQUEST }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_public_booking_request", {
    p_slug: slug,
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_message: message,
    p_start_at: startAt,
    p_end_at: endAt,
    p_locale: locale,
  });

  if (error) {
    const code = error.message.match(/[A-Z_]{4,}/)?.[0];
    const friendly = (code && MESSAGES[code]) || "Förfrågan kunde inte skickas just nu. Försök igen om en stund.";
    return Response.json({ ok: false, error: friendly }, { status: 409 });
  }

  const created = Array.isArray(data) ? data[0] : null;
  if (!created) {
    return Response.json({ ok: false, error: MESSAGES.SLOT_UNAVAILABLE }, { status: 409 });
  }

  // Committed from here on. Everything below is best-effort.
  await dispatchBookingNotifications({
    requestId: created.request_id,
    dispatchToken: created.dispatch_token,
    events: ["customer_request_received", "coach_new_request"],
    context: {
      name,
      email,
      phone: phone || null,
      message: message || null,
      requestedStartAt: startAt,
      requestedEndAt: endAt,
      locale,
    },
  });

  // Deliberately does not report notification state: the visitor's booking
  // is valid regardless, and the ledger is not public information.
  return Response.json({ ok: true, requestId: created.request_id });
}
