import { readCoachSession } from "@/lib/portal/session";
import { reactivateClient } from "@/lib/portal/client-lifecycle";

/** Carolina reactivates the same client — no duplicate identity is created. */
export async function POST(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { clientId } = await params;
  const result = await reactivateClient(clientId);
  if (!result.ok) {
    return Response.json({ ok: false, error: "Kunde inte återaktivera klienten." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
