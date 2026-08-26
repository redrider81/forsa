import { readCoachSession } from "@/lib/portal/session";
import { addAvailabilityRule, listAvailabilityRules } from "@/lib/portal/availability";
import { isFixedPublicBlock } from "@/lib/portal/types";

/** Carolina turns on one of the four fixed public booking blocks for a weekday (Mon–Fri only). */
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

  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 5) {
    return Response.json({ ok: false, error: "Bokning är endast tillgänglig måndag–fredag." }, { status: 400 });
  }
  if (!isFixedPublicBlock(startTime, endTime)) {
    return Response.json({ ok: false, error: "Ogiltigt bokningsblock." }, { status: 400 });
  }

  const existing = await listAvailabilityRules();
  const alreadyOn = existing.some((rule) => rule.weekday === weekday && rule.startTime === startTime && rule.endTime === endTime);
  if (alreadyOn) {
    return Response.json({ ok: false, error: "Blocket är redan aktiverat." }, { status: 400 });
  }

  const rule = await addAvailabilityRule({ coachId: session.coachId, weekday, startTime, endTime });
  if (!rule) {
    return Response.json({ ok: false, error: "Kunde inte spara intervallet." }, { status: 502 });
  }

  return Response.json({ ok: true, rule });
}
