import { readCoachSession } from "@/lib/portal/session";
import { deleteAvailabilityRule } from "@/lib/portal/availability";

/** Carolina removes one weekly availability interval she owns. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ ruleId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { ruleId } = await params;
  const ok = await deleteAvailabilityRule(ruleId);
  if (!ok) {
    return Response.json({ ok: false, error: "Kunde inte ta bort intervallet." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
