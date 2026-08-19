import { readClientSession } from "@/lib/portal/session";
import { updateDemoState } from "@/lib/portal/store/demo-store";

/** Klientens förberedelse inför nästa samtal. Klientägd information. */
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

  const { focus, desiredOutcome, changed, followUp } = (body ?? {}) as Record<string, unknown>;

  const field = (value: unknown, max = 700): string =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  const prep = {
    clientId: session.clientId,
    focus: field(focus),
    desiredOutcome: field(desiredOutcome),
    changed: field(changed),
    followUp: field(followUp),
    updatedAt: new Date().toISOString(),
  };

  if (!prep.focus && !prep.desiredOutcome && !prep.changed && !prep.followUp) {
    return Response.json({ ok: false, error: "Fyll i minst ett fält." }, { status: 400 });
  }

  await updateDemoState((state) => ({
    ...state,
    prep: { ...state.prep, [session.clientId]: prep },
  }));

  return Response.json({ ok: true });
}
