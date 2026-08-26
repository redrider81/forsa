import { readCoachSession } from "@/lib/portal/session";
import { deleteAvailabilityException } from "@/lib/portal/availability";

/** Carolina removes one date exception she owns. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ exceptionId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { exceptionId } = await params;
  const ok = await deleteAvailabilityException(exceptionId);
  if (!ok) {
    return Response.json({ ok: false, error: "Kunde inte ta bort undantaget." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
