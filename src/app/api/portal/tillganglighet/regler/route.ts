import { readCoachSession } from "@/lib/portal/session";
import { addAvailabilityRule, listAvailabilityRules } from "@/lib/portal/availability";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Carolina adds one weekly availability interval. */
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
  const weekday = typeof raw.weekday === "number" ? raw.weekday : Number(raw.weekday);
  const startTime = typeof raw.startTime === "string" ? raw.startTime : "";
  const endTime = typeof raw.endTime === "string" ? raw.endTime : "";

  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    return Response.json({ ok: false, error: "Ogiltig veckodag." }, { status: 400 });
  }
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime) || startTime >= endTime) {
    return Response.json({ ok: false, error: "Starttid måste vara före sluttid." }, { status: 400 });
  }

  const existing = await listAvailabilityRules();
  const overlaps = existing.some(
    (rule) => rule.weekday === weekday && startTime < rule.endTime && endTime > rule.startTime,
  );
  if (overlaps) {
    return Response.json({ ok: false, error: "Intervallet överlappar ett befintligt intervall." }, { status: 400 });
  }

  const rule = await addAvailabilityRule({ coachId: session.coachId, weekday, startTime, endTime });
  if (!rule) {
    return Response.json({ ok: false, error: "Kunde inte spara intervallet." }, { status: 502 });
  }

  return Response.json({ ok: true, rule });
}
