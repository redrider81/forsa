import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, getClient } from "@/lib/portal/repository";
import { deleteClientPermanently } from "@/lib/portal/client-lifecycle";

const BLOCK_MESSAGES: Record<string, string> = {
  SIGNED_CONTRACT_BLOCK: "Klienten kan inte raderas permanent eftersom det finns signerade avtal.",
  DOCUMENT_BLOCK: "Klienten har dokument som först måste tas bort.",
};

/** Carolina permanently deletes an already-ended client. Two-step confirmed in the UI; name re-verified here. */
export async function POST(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { clientId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const confirmName = typeof raw.confirmName === "string" ? raw.confirmName.trim() : "";

  const data = await fetchPortalRepositoryData();
  const client = getClient(session.coachId, clientId, data);
  if (!client) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 404 });
  }
  if (confirmName !== client.name) {
    return Response.json({ ok: false, error: "Namnet stämmer inte överens." }, { status: 400 });
  }

  const result = await deleteClientPermanently(clientId);
  if (!result.ok) {
    const message = result.blockReason ? BLOCK_MESSAGES[result.blockReason] : "Klienten kunde inte raderas.";
    return Response.json({ ok: false, error: message }, { status: 409 });
  }

  return Response.json({ ok: true });
}
