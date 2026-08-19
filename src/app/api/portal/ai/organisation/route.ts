import { readCoachSession } from "@/lib/portal/session";
import { readDemoState } from "@/lib/portal/store/demo-store";
import { buildEngagementContext } from "@/lib/ai/context";
import { AiError, generate, hasApiKey } from "@/lib/ai/openai";
import { organisationSystemPrompt } from "@/lib/ai/prompts";
import { OUT_OF_SCOPE_REPLY, isOutOfScope, validateQuestion } from "@/lib/ai/scope";

/**
 * AI knuten till ett enskilt företagsuppdrag. Underlaget innehåller endast
 * data som är tillåten på organisationsnivå — aldrig individuellt samtalsinnehåll.
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

  const { engagementId, question } = (body ?? {}) as { engagementId?: unknown; question?: unknown };

  if (typeof engagementId !== "string" || !engagementId) {
    return Response.json({ ok: false, error: "Uppdrag saknas." }, { status: 400 });
  }

  const validated = validateQuestion(question);
  if (!validated.ok) {
    return Response.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const context = buildEngagementContext(session.coachId, engagementId, await readDemoState());
  if (!context) {
    return Response.json({ ok: false, error: "Uppdraget kunde inte hittas." }, { status: 404 });
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
    const result = await generate({
      system: organisationSystemPrompt(context.subject, context.secondarySubject ?? ""),
      user: `${context.text}\n\nCOACHENS FRÅGA\n${validated.question}`,
      effort: "medium",
    });
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
