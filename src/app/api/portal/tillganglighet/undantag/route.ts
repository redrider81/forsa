import { readCoachSession } from "@/lib/portal/session";
import { addAvailabilityException } from "@/lib/portal/availability";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Carolina overrides one date: unavailable, or a custom set of intervals. */
export async function POST(request: Request) {
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
  const date = typeof raw.date === "string" ? raw.date : "";
  const type = raw.type === "unavailable" || raw.type === "custom" ? raw.type : null;

  if (!DATE_RE.test(date) || !type) {
    return Response.json({ ok: false, error: "Ogiltigt datum eller typ." }, { status: 400 });
  }

  if (type === "unavailable") {
    const exception = await addAvailabilityException({ coachId: session.coachId, date, type: "unavailable" });
    if (!exception) return Response.json({ ok: false, error: "Kunde inte spara undantaget." }, { status: 502 });
    return Response.json({ ok: true, exceptions: [exception] });
  }

  const intervals = Array.isArray(raw.intervals) ? (raw.intervals as unknown[]) : [];
  if (intervals.length === 0) {
    return Response.json({ ok: false, error: "Ange minst ett tidsintervall." }, { status: 400 });
  }

  const parsed: Array<{ startTime: string; endTime: string }> = [];
  for (const item of intervals) {
    const entry = (item ?? {}) as Record<string, unknown>;
    const startTime = typeof entry.startTime === "string" ? entry.startTime : "";
    const endTime = typeof entry.endTime === "string" ? entry.endTime : "";
    if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime) || startTime >= endTime) {
      return Response.json({ ok: false, error: "Starttid måste vara före sluttid." }, { status: 400 });
    }
    parsed.push({ startTime, endTime });
  }

  const created = [];
  for (const interval of parsed) {
    const exception = await addAvailabilityException({
      coachId: session.coachId,
      date,
      type: "custom",
      startTime: interval.startTime,
      endTime: interval.endTime,
    });
    if (!exception) return Response.json({ ok: false, error: "Kunde inte spara undantaget." }, { status: 502 });
    created.push(exception);
  }

  return Response.json({ ok: true, exceptions: created });
}
