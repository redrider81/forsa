import { createSupabaseServerClient } from "@/lib/supabase/server";

const MESSAGES: Record<string, string> = {
  SLOT_UNAVAILABLE: "Tiden hann precis bli bokad. Välj gärna en annan tid.",
  BOOKING_DISABLED: "Bokning är tillfälligt pausad. Kontakta oss gärna så återkommer vi.",
  INVALID_SLOT: "Den valda tiden är inte längre giltig. Välj gärna en annan tid.",
  INVALID_REQUEST: "Fyll i namn och e-post innan du skickar förfrågan.",
};

/**
 * Public, unauthenticated: reserves one prospective slot atomically. No
 * client, auth user, engagement, or session is created — only a pending
 * public_booking_requests row for Carolina to review.
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

  if (!slug || !name || !email || !startAt || !endAt) {
    return Response.json({ ok: false, error: MESSAGES.INVALID_REQUEST }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_public_booking_request", {
    p_slug: slug,
    p_name: name,
    p_email: email,
    p_phone: phone || null,
    p_message: message || null,
    p_start_at: startAt,
    p_end_at: endAt,
  });

  if (error) {
    const code = error.message.match(/[A-Z_]{4,}/)?.[0];
    const friendly = (code && MESSAGES[code]) || "Förfrågan kunde inte skickas just nu. Försök igen om en stund.";
    return Response.json({ ok: false, error: friendly }, { status: 409 });
  }

  return Response.json({ ok: true, requestId: data });
}
