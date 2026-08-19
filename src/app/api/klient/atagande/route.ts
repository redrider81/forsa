import { readClientSession } from "@/lib/portal/session";
import { updateDemoState } from "@/lib/portal/store/demo-store";
import { listCommitments } from "@/lib/portal/repository";
import { getCoach } from "@/lib/portal/repository";

const STATUSES = new Set(["oppet", "pagar", "genomfort"]);

/**
 * Klienten uppdaterar status på ett eget åtagande.
 * Åtagandet måste tillhöra den inloggade klienten — annars 403.
 */
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

  const { commitmentId, status, clientNote } = (body ?? {}) as Record<string, unknown>;

  if (typeof commitmentId !== "string" || typeof status !== "string" || !STATUSES.has(status)) {
    return Response.json({ ok: false, error: "Ogiltig uppdatering." }, { status: 400 });
  }

  // Ägarkontroll server-side: åtagandet måste finnas hos den inloggade klienten.
  const owned = listCommitments(getCoach().id, session.clientId).some(
    (item) => item.id === commitmentId,
  );
  if (!owned) {
    return Response.json({ ok: false, error: "Åtagandet kunde inte hittas." }, { status: 403 });
  }

  const note = typeof clientNote === "string" ? clientNote.trim().slice(0, 400) : "";

  await updateDemoState((state) => ({
    ...state,
    commitments: {
      ...state.commitments,
      [commitmentId]: {
        status: status as "oppet" | "pagar" | "genomfort",
        clientNote: note || undefined,
        updatedAt: new Date().toISOString(),
      },
    },
  }));

  return Response.json({ ok: true });
}
