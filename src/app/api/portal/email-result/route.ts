import { readCoachSession } from "@/lib/portal/session";
import {
  ResultEmailError,
  sendResultEmail,
  validateResultEmailPayload,
} from "@/lib/email/result-email";

export async function POST(request: Request) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { subject, body: messageBody, recipient } = (payload ?? {}) as {
    subject?: unknown;
    body?: unknown;
    recipient?: unknown;
  };

  if (recipient !== undefined) {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const validated = validateResultEmailPayload({ subject, body: messageBody });
  if (!validated.ok) {
    return Response.json({ ok: false, error: validated.error }, { status: 400 });
  }

  try {
    const result = await sendResultEmail(validated.payload);
    return Response.json({ ok: true, simulated: result.simulated });
  } catch (error) {
    const message =
      error instanceof ResultEmailError
        ? error.message
        : "Det gick inte att skicka e-postmeddelandet just nu.";
    const status = error instanceof ResultEmailError && error.code === "missing_config" ? 503 : 502;
    return Response.json({ ok: false, error: message }, { status });
  }
}
