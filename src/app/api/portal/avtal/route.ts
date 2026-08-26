import { readCoachSession } from "@/lib/portal/session";
import { createContract, type ContractContent } from "@/lib/portal/contracts";

/** Carolina creates a new draft contract, blank or copied from a template. */
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
  const clientId = typeof raw.clientId === "string" ? raw.clientId : "";
  const engagementId = typeof raw.engagementId === "string" && raw.engagementId ? raw.engagementId : null;
  const templateId = typeof raw.templateId === "string" && raw.templateId ? raw.templateId : null;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = (raw.content as ContractContent | undefined) ?? { sections: [], fields: [] };
  const priceAmount =
    typeof raw.priceAmount === "number"
      ? raw.priceAmount
      : typeof raw.priceAmount === "string" && raw.priceAmount.trim() !== ""
        ? Number(raw.priceAmount)
        : null;
  const currency = typeof raw.currency === "string" && raw.currency.trim() !== "" ? raw.currency.trim() : "SEK";
  const paymentTerms = typeof raw.paymentTerms === "string" && raw.paymentTerms.trim() !== "" ? raw.paymentTerms.trim() : null;

  if (!clientId || !title) {
    return Response.json({ ok: false, error: "Klient och titel krävs." }, { status: 400 });
  }
  if (priceAmount !== null && Number.isNaN(priceAmount)) {
    return Response.json({ ok: false, error: "Ogiltigt pris." }, { status: 400 });
  }

  const contract = await createContract({
    coachId: session.coachId,
    clientId,
    engagementId,
    templateId,
    title,
    content,
    priceAmount,
    currency,
    paymentTerms,
  });

  if (!contract) {
    return Response.json({ ok: false, error: "Kunde inte skapa avtalet." }, { status: 502 });
  }

  return Response.json({ ok: true, contract });
}
