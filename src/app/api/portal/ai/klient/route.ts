import { readSession } from "@/lib/portal/session";
import { buildClientContext } from "@/lib/ai/context";
import { AiError, generate, hasApiKey } from "@/lib/ai/openai";
import { clientQuestionSystemPrompt, prepareSessionSystemPrompt } from "@/lib/ai/prompts";
import { OUT_OF_SCOPE_REPLY, isOutOfScope, validateQuestion } from "@/lib/ai/scope";

/**
 * AI knuten till en enskild klient.
 *
 * Servern verifierar sessionen, verifierar åtkomst till klienten och bygger
 * kontexten deterministiskt från klient-ID:t. Modellen kan aldrig själv välja
 * att läsa data från en annan klient.
 */
export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { clientId, mode, question } = (body ?? {}) as {
    clientId?: unknown;
    mode?: unknown;
    question?: unknown;
  };

  if (typeof clientId !== "string" || !clientId) {
    return Response.json({ ok: false, error: "Klient saknas." }, { status: 400 });
  }

  const requestMode = mode === "forbered" ? "forbered" : "fraga";

  const context = buildClientContext(session.coachId, clientId);
  if (!context) {
    return Response.json({ ok: false, error: "Klienten kunde inte hittas." }, { status: 404 });
  }

  let userPrompt: string;
  let systemPrompt: string;
  let effort: "medium" | "high" = "medium";

  if (requestMode === "forbered") {
    systemPrompt = prepareSessionSystemPrompt(context.subject);
    userPrompt = `${context.text}\n\nUPPGIFT\nSammanställ ett underlag inför nästa session med ${context.subject}.`;
    effort = "high";
  } else {
    const validated = validateQuestion(question);
    if (!validated.ok) {
      return Response.json({ ok: false, error: validated.error }, { status: 400 });
    }
    if (isOutOfScope(validated.question)) {
      return Response.json({
        ok: true,
        text: OUT_OF_SCOPE_REPLY,
        refused: true,
        sources: [],
        subject: context.subject,
      });
    }
    systemPrompt = clientQuestionSystemPrompt(context.subject);
    userPrompt = `${context.text}\n\nCOACHENS FRÅGA\n${validated.question}`;
    // Fria klientfrågor kräver syntes över hela klienthistoriken.
    effort = "high";
  }

  if (!hasApiKey()) {
    return Response.json(
      {
        ok: false,
        error:
          "AI-funktionerna är inte aktiverade i den här miljön ännu.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await generate({ system: systemPrompt, user: userPrompt, effort });
    return Response.json({
      ok: true,
      text: result.text,
      model: result.model,
      sources: context.sources,
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
