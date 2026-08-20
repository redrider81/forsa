import "server-only";

/**
 * Server-side OpenAI-integration via Responses API.
 * API-nyckeln läses endast här och exponeras aldrig mot klienten.
 */

const OPENAI_URL = "https://api.openai.com/v1/responses";
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS_PER_MODEL = 2;

/**
 * Primär modell för demon: GPT-5.6 (Sol). Den ska användas så länge den är
 * tillgänglig i kontot.
 */
export const PRIMARY_MODEL = "gpt-5.6";

/**
 * Teknisk reserv. Används endast om den primära modellen inte finns i kontot,
 * aldrig vid nätverksfel, hastighetsbegränsning eller serverfel — då ska
 * anropet i stället misslyckas tydligt så att felet syns.
 */
const FALLBACK_MODELS = ["gpt-5.1", "gpt-5", "gpt-4.1"] as const;

export type ReasoningEffort = "low" | "medium" | "high";

export type AiFailureCode = "missing_key" | "timeout" | "upstream" | "unknown";

export class AiError extends Error {
  readonly code: AiFailureCode;
  readonly userMessage: string;

  constructor(code: AiFailureCode, message: string, userMessage: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

const GENERIC_FAILURE = "Det gick inte att skapa sammanställningen just nu. Försök igen.";

export function hasApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
}

/** Modellordning: OPENAI_MODEL (om satt) → primär modell → teknisk reserv. */
export function modelCandidates(): string[] {
  const configured = process.env.OPENAI_MODEL?.trim();
  const ordered = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  if (configured) {
    return [configured, ...ordered.filter((model) => model !== configured)];
  }
  return ordered;
}

function supportsReasoning(model: string): boolean {
  return /^(gpt-5|o[134])/.test(model);
}

type ResponsesPayload = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string; code?: string };
};

function extractText(payload: ResponsesPayload): string {
  const parts: string[] = [];
  for (const item of payload.output ?? []) {
    if (item.type && item.type !== "message") continue;
    for (const chunk of item.content ?? []) {
      if (chunk.type === "output_text" && typeof chunk.text === "string") {
        parts.push(chunk.text);
      }
    }
  }
  return parts.join("\n").trim();
}

/** Endast "modellen finns inte i kontot" får leda vidare till reservmodellen. */
function isModelUnavailable(status: number, body: string): boolean {
  if (status !== 400 && status !== 404) return false;
  return /model/i.test(body) && /(not found|does not exist|unsupported|unknown|no access|do not have access)/i.test(body);
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export type GenerateOptions = {
  system: string;
  user: string;
  effort?: ReasoningEffort;
  maxOutputTokens?: number;
};

export type AiResult = { text: string; model: string };

/** Signalerar att modellen inte finns i kontot — enda skälet att byta modell. */
class ModelUnavailable extends Error {}

async function callModel(
  model: string,
  apiKey: string,
  { system, user, effort, maxOutputTokens }: Required<Omit<GenerateOptions, never>>,
): Promise<AiResult> {
  let lastError: AiError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const body: Record<string, unknown> = {
        model,
        input: [
          { role: "developer", content: system },
          { role: "user", content: user },
        ],
        max_output_tokens: maxOutputTokens,
      };
      if (supportsReasoning(model)) {
        body.reasoning = { effort };
      }

      const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const raw = await response.text();
        if (isModelUnavailable(response.status, raw)) {
          throw new ModelUnavailable(`Modellen ${model} är inte tillgänglig i kontot.`);
        }
        if (isRetryable(response.status) && attempt < MAX_ATTEMPTS_PER_MODEL) {
          lastError = new AiError("upstream", `OpenAI svarade ${response.status}.`, GENERIC_FAILURE);
          await sleep(600 * attempt);
          continue;
        }
        throw new AiError("upstream", `OpenAI svarade ${response.status}.`, GENERIC_FAILURE);
      }

      const payload = (await response.json()) as ResponsesPayload;
      const text = extractText(payload);
      if (!text) {
        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          lastError = new AiError("upstream", "Tomt svar från modellen.", GENERIC_FAILURE);
          await sleep(400);
          continue;
        }
        throw new AiError("upstream", "Tomt svar från modellen.", "Sammanställningen blev tom. Försök igen.");
      }

      return { text, model };
    } catch (error) {
      if (error instanceof ModelUnavailable || error instanceof AiError) throw error;

      const aborted = error instanceof Error && error.name === "AbortError";
      const wrapped = aborted
        ? new AiError("timeout", "Anropet tog för lång tid.", "Sammanställningen tog för lång tid. Försök igen.")
        : new AiError("unknown", error instanceof Error ? error.message : "Okänt fel.", GENERIC_FAILURE);

      if (attempt < MAX_ATTEMPTS_PER_MODEL) {
        lastError = wrapped;
        await sleep(600 * attempt);
        continue;
      }
      throw wrapped;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new AiError("unknown", "Okänt fel.", GENERIC_FAILURE);
}

export async function generate({
  system,
  user,
  effort = "medium",
  maxOutputTokens = 2400,
}: GenerateOptions): Promise<AiResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiError(
      "missing_key",
      "OPENAI_API_KEY saknas i miljön.",
      "Sammanställningsfunktionen är inte aktiverad i den här miljön ännu.",
    );
  }

  const candidates = modelCandidates();
  let unavailable: ModelUnavailable | null = null;

  for (const model of candidates) {
    try {
      return await callModel(model, apiKey, { system, user, effort, maxOutputTokens });
    } catch (error) {
      if (error instanceof ModelUnavailable) {
        // Enda fallet där reservmodellen får ta över.
        unavailable = error;
        continue;
      }
      // Nätverksfel, timeout, 429 och 5xx ska inte tyst degradera modellen.
      throw error;
    }
  }

  throw new AiError(
    "upstream",
    unavailable?.message ?? "Ingen tillgänglig modell.",
    GENERIC_FAILURE,
  );
}
