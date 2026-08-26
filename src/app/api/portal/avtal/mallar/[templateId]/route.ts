import { readCoachSession } from "@/lib/portal/session";
import { deleteContractTemplate, updateContractTemplate, type ContractContent } from "@/lib/portal/contracts";

/** Carolina edits a template she owns. RLS restricts writes to her own rows. */
export async function PATCH(request: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { templateId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : undefined;
  const title = typeof raw.title === "string" ? raw.title.trim() : undefined;
  const content = raw.content as ContractContent | undefined;

  const template = await updateContractTemplate(templateId, { name, title, content });
  if (!template) {
    return Response.json({ ok: false, error: "Kunde inte spara mallen." }, { status: 502 });
  }

  return Response.json({ ok: true, template });
}

/** Carolina deletes an unused template she owns. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { templateId } = await params;
  const ok = await deleteContractTemplate(templateId);
  if (!ok) {
    return Response.json({ ok: false, error: "Kunde inte ta bort mallen." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
