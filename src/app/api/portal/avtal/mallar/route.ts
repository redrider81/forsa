import { readCoachSession } from "@/lib/portal/session";
import { createContractTemplate, type ContractContent } from "@/lib/portal/contracts";

/** Carolina creates a reusable contract template. */
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

  const raw = (body ?? {}) as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = (raw.content as ContractContent | undefined) ?? { sections: [], fields: [] };

  if (!name || !title) {
    return Response.json({ ok: false, error: "Namn och titel krävs." }, { status: 400 });
  }

  const template = await createContractTemplate({ coachId: session.coachId, name, title, content });
  if (!template) {
    return Response.json({ ok: false, error: "Kunde inte skapa mallen." }, { status: 502 });
  }

  return Response.json({ ok: true, template });
}
