import { readClientSession } from "@/lib/portal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Internal meetings stay flexible — any clock time, weekends included. These
// only reject malformed input, not unusual scheduling.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const ALLOWED_DURATIONS = [30, 45, 60, 90];

/** Klienten föreslår en mötestid. Klienten väljs aldrig av anroparen — den är den inloggade klienten. */
export async function POST(request: Request) {
  const session = await readClientSession();
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
  const date = text(raw.date, 10);
  const time = text(raw.time, 10);
  const durationMinutes = typeof raw.durationMinutes === "number" ? raw.durationMinutes : 60;
  const location = text(raw.location, 160);
  const message = text(raw.message, 400);

  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    return Response.json({ ok: false, error: "Ange giltigt datum och tid." }, { status: 400 });
  }
  if (!ALLOWED_DURATIONS.includes(durationMinutes)) {
    return Response.json({ ok: false, error: "Ogiltig möteslängd." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("session_booking_requests").insert({
    client_id: session.clientId,
    requested_by_role: "klient",
    date,
    time,
    duration_minutes: durationMinutes,
    location,
    message: message || null,
  });

  if (error) {
    return Response.json({ ok: false, error: "Förfrågan kunde inte skapas." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

/** Klienten accepterar eller avböjer en inkommande förfrågan från Carolina. */
export async function PATCH(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { bookingId, action } = (body ?? {}) as { bookingId?: unknown; action?: unknown };
  if (typeof bookingId !== "string" || (action !== "accept" && action !== "decline")) {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc(
    action === "accept" ? "accept_session_booking" : "decline_session_booking",
    { p_booking_id: bookingId },
  );

  if (error) {
    return Response.json({ ok: false, error: "Förfrågan kunde inte besvaras." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

/** Klienten avbokar sin egen väntande förfrågan. */
export async function DELETE(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { bookingId } = (body ?? {}) as { bookingId?: unknown };
  if (typeof bookingId !== "string") {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_session_booking", { p_booking_id: bookingId });

  if (error) {
    return Response.json({ ok: false, error: "Förfrågan kunde inte avbokas." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
