import { readCoachSession } from "@/lib/portal/session";
import { updateBookingSettings } from "@/lib/portal/availability";

const DURATIONS = [30, 45, 60, 90];
const BUFFERS = [0, 15, 30, 45, 60];
const NOTICE_HOURS = [2, 6, 12, 24, 48];
const HORIZON_DAYS = [14, 30, 60, 90];

/** Carolina updates her booking rules (duration, buffer, notice, horizon, public toggle). */
export async function PATCH(request: Request) {
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
  const patch: Parameters<typeof updateBookingSettings>[1] = {};

  if (raw.meetingDurationMinutes !== undefined) {
    const value = Number(raw.meetingDurationMinutes);
    if (!DURATIONS.includes(value)) return Response.json({ ok: false, error: "Ogiltig möteslängd." }, { status: 400 });
    patch.meetingDurationMinutes = value;
  }
  if (raw.bufferMinutes !== undefined) {
    const value = Number(raw.bufferMinutes);
    if (!BUFFERS.includes(value)) return Response.json({ ok: false, error: "Ogiltig buffert." }, { status: 400 });
    patch.bufferMinutes = value;
  }
  if (raw.minimumNoticeHours !== undefined) {
    const value = Number(raw.minimumNoticeHours);
    if (!NOTICE_HOURS.includes(value)) return Response.json({ ok: false, error: "Ogiltig framförhållning." }, { status: 400 });
    patch.minimumNoticeHours = value;
  }
  if (raw.bookingHorizonDays !== undefined) {
    const value = Number(raw.bookingHorizonDays);
    if (!HORIZON_DAYS.includes(value)) return Response.json({ ok: false, error: "Ogiltig bokningshorisont." }, { status: 400 });
    patch.bookingHorizonDays = value;
  }
  if (raw.publicBookingEnabled !== undefined) {
    patch.publicBookingEnabled = Boolean(raw.publicBookingEnabled);
  }

  const settings = await updateBookingSettings(session.coachId, patch);
  if (!settings) {
    return Response.json({ ok: false, error: "Kunde inte spara inställningarna." }, { status: 502 });
  }

  return Response.json({ ok: true, settings });
}
