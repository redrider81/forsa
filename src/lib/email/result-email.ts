import "server-only";

export const RESULT_EMAIL_RECIPIENT = "carolinavonbraun@gmail.com";

export type ResultEmailPayload = {
  subject: string;
  body: string;
};

export type EmailSendPayload = ResultEmailPayload & {
  from: string;
  to: string;
};

export type EmailProvider = {
  send: (payload: EmailSendPayload) => Promise<{ id: string }>;
};

export class ResultEmailError extends Error {
  constructor(
    readonly code: "invalid_payload" | "forbidden_wording" | "missing_config" | "provider_error",
    message: string,
  ) {
    super(message);
    this.name = "ResultEmailError";
  }
}

const FORBIDDEN_AI_PATTERNS = [
  /\bAI\b/i,
  /AI-genererat/i,
  /AI-underlag/i,
  /artificiell intelligens/i,
];

export function isEmailSendEnabled(): boolean {
  return process.env.EMAIL_SEND_ENABLED === "true";
}

export function containsForbiddenAiWording(text: string): boolean {
  return FORBIDDEN_AI_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateResultEmailPayload(input: {
  subject?: unknown;
  body?: unknown;
}):
  | { ok: true; payload: ResultEmailPayload }
  | { ok: false; error: string } {
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";

  if (!subject) {
    return { ok: false, error: "Ämnesrad saknas." };
  }
  if (!body) {
    return { ok: false, error: "Meddelandetext saknas." };
  }
  if (subject.length > 200) {
    return { ok: false, error: "Ämnesraden är för lång." };
  }
  if (body.length > 100_000) {
    return { ok: false, error: "Meddelandetexten är för lång." };
  }
  if (containsForbiddenAiWording(subject) || containsForbiddenAiWording(body)) {
    return { ok: false, error: "Ämne och text får inte innehålla ordet AI." };
  }

  return { ok: true, payload: { subject, body } };
}

function resolveFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new ResultEmailError(
      "missing_config",
      "E-postfunktionen saknar avsändaradress i den här miljön.",
    );
  }
  return from;
}

/** Kräver Resend-nyckel och avsändare när faktisk leverans är aktiverad. */
export function assertEmailProductionConfig(): void {
  if (!isEmailSendEnabled()) return;

  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new ResultEmailError(
      "missing_config",
      "E-postfunktionen saknar API-nyckel i den här miljön.",
    );
  }

  resolveFromAddress();
}

export async function sendResultEmail(
  payload: ResultEmailPayload,
  options?: { provider?: EmailProvider },
): Promise<{ simulated: boolean; id?: string }> {
  if (!isEmailSendEnabled()) {
    console.info("[CVB Coaching] E-post simulerad (EMAIL_SEND_ENABLED !== true)", {
      recipient: RESULT_EMAIL_RECIPIENT,
      subjectLength: payload.subject.length,
      bodyLength: payload.body.length,
    });
    return { simulated: true };
  }

  assertEmailProductionConfig();

  const sendPayload: EmailSendPayload = {
    from: resolveFromAddress(),
    to: RESULT_EMAIL_RECIPIENT,
    subject: payload.subject,
    body: payload.body,
  };

  const provider = options?.provider ?? (await import("@/lib/email/resend-provider")).createResendProvider();
  const result = await provider.send(sendPayload);

  console.info("[CVB Coaching] E-post skickad via Resend", {
    recipient: RESULT_EMAIL_RECIPIENT,
    subjectLength: payload.subject.length,
    bodyLength: payload.body.length,
    messageId: result.id,
  });

  return { simulated: false, id: result.id };
}
