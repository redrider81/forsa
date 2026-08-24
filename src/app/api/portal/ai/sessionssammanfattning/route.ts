import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, getSession } from "@/lib/portal/repository";
import { EMPTY_DEMO_STATE } from "@/lib/portal/store/demo-state";
import { buildClientContext } from "@/lib/ai/context";
import { AiError, generate, hasApiKey } from "@/lib/ai/openai";
import { sessionSummarySystemPrompt } from "@/lib/ai/prompts";

/**
 * Strukturerar coachens egna anteckningar till ett utkast till sessions-
 * sammanfattning. Utkastet publiceras aldrig automatiskt — coachen redigerar,
 * granskar och godkänner.
 */
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

  const { clientId, sessionId, notes } = (body ?? {}) as {
    clientId?: unknown;
    sessionId?: unknown;
    notes?: unknown;
  };

  if (typeof clientId !== "string" || typeof sessionId !== "string") {
    return Response.json({ ok: false, error: "Klient eller session saknas." }, { status: 400 });
  }
  if (typeof notes !== "string" || notes.trim().length < 15) {
    return Response.json(
      { ok: false, error: "Skriv några anteckningar från samtalet först." },
      { status: 400 },
    );
  }
  if (notes.length > 8000) {
    return Response.json({ ok: false, error: "Anteckningarna är för långa." }, { status: 400 });
  }

  const data = await fetchPortalRepositoryData();
  const coachingSession = getSession(session.coachId, clientId, sessionId, EMPTY_DEMO_STATE, data);
  const context = buildClientContext(
    session.coachId,
    clientId,
    EMPTY_DEMO_STATE,
    { includeCoachNotes: true },
    data,
  );
  if (!coachingSession || !context) {
    return Response.json({ ok: false, error: "Sessionen kunde inte hittas." }, { status: 404 });
  }

  if (!hasApiKey()) {
    return Response.json(
      {
        ok: false,
        error:
          "Sammanställningsfunktionen är inte aktiverad i den här miljön ännu.",
      },
      { status: 503 },
    );
  }

  const userPrompt = [
    context.text,
    "",
    "AKTUELL SESSION",
    `Session ${coachingSession.number}, ${coachingSession.date}`,
    `Klientens fokus: ${coachingSession.clientFocus}`,
    `Klientens önskade resultat: ${coachingSession.desiredOutcome}`,
    "",
    "COACHENS ANTECKNINGAR FRÅN SAMTALET",
    notes.trim(),
    "",
    "UPPGIFT",
    "Strukturera anteckningarna till ett utkast till sessionssammanfattning enligt rubrikerna i instruktionen.",
  ].join("\n");

  try {
    const result = await generate({
      system: sessionSummarySystemPrompt(context.subject),
      user: userPrompt,
      effort: "medium",
    });
    return Response.json({
      ok: true,
      text: result.text,
      model: result.model,
      sources: [
        "coachens anteckningar från samtalet",
        `sessionens fokus och klientens önskade resultat`,
        `${context.sources[0]} som sammanhang`,
      ],
      subject: context.subject,
      refused: false,
    });
  } catch (error) {
    const message =
      error instanceof AiError
        ? error.userMessage
        : "Det gick inte att skapa sammanställningen just nu. Försök igen.";
    const status = error instanceof AiError && error.code === "missing_key" ? 503 : 502;
    return Response.json({ ok: false, error: message }, { status });
  }
}
