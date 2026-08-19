import { readClientSession } from "@/lib/portal/session";
import { readDemoState, updateDemoState } from "@/lib/portal/store/demo-store";
import { todayIso } from "@/lib/portal/format";

/**
 * Klienten skriver en egen reflektion. Reflektionen knyts alltid till den
 * inloggade klientens id — aldrig till ett id som skickas från klienten.
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

  const { text, prompt } = (body ?? {}) as { text?: unknown; prompt?: unknown };

  if (typeof text !== "string" || text.trim().length < 5) {
    return Response.json({ ok: false, error: "Skriv några rader först." }, { status: 400 });
  }
  if (text.length > 1500) {
    return Response.json(
      { ok: false, error: "Reflektionen är för lång. Korta ner den och försök igen." },
      { status: 400 },
    );
  }

  const reflection = {
    id: `refl-egen-${Date.now().toString(36)}`,
    clientId: session.clientId,
    date: todayIso(),
    prompt: typeof prompt === "string" && prompt.trim() ? prompt.trim().slice(0, 120) : "Egen reflektion",
    text: text.trim(),
  };

  await updateDemoState((state) => ({
    ...state,
    reflections: [...state.reflections, reflection],
  }));

  return Response.json({ ok: true, reflection });
}

/**
 * Klienten tar bort en reflektion hon själv har skrivit.
 * Klientens autonomi över sitt eget material — seed-reflektioner rörs inte,
 * och ingen kan ta bort någon annans.
 */
export async function DELETE(request: Request) {
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

  const { id } = (body ?? {}) as { id?: unknown };
  if (typeof id !== "string") {
    return Response.json({ ok: false, error: "Reflektionen kunde inte hittas." }, { status: 400 });
  }

  const state = await readDemoState();
  const owned = state.reflections.some(
    (item) => item.id === id && item.clientId === session.clientId,
  );
  if (!owned) {
    return Response.json({ ok: false, error: "Reflektionen kunde inte hittas." }, { status: 403 });
  }

  await updateDemoState((current) => ({
    ...current,
    reflections: current.reflections.filter((item) => item.id !== id),
  }));

  return Response.json({ ok: true });
}
