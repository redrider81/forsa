import { readCoachSession } from "@/lib/portal/session";
import { endClient } from "@/lib/portal/client-lifecycle";

/** Carolina ends a coaching relationship. History is preserved; only status changes. */
export async function POST(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { clientId } = await params;
  const result = await endClient(clientId);
  if (!result.ok) {
    return Response.json({ ok: false, error: "Kunde inte avsluta klienten." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
