import { readCoachSession } from "@/lib/portal/session";
import { updateContractDraft, type ContractContent } from "@/lib/portal/contracts";

/** Carolina edits a draft contract. RLS blocks writes once status leaves UTKAST. */
export async function PATCH(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { contractId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : undefined;
  const content = raw.content as ContractContent | undefined;
  const engagementId =
    "engagementId" in raw ? (typeof raw.engagementId === "string" && raw.engagementId ? raw.engagementId : null) : undefined;
  const priceAmount =
    "priceAmount" in raw
      ? typeof raw.priceAmount === "number"
        ? raw.priceAmount
        : typeof raw.priceAmount === "string" && raw.priceAmount.trim() !== ""
          ? Number(raw.priceAmount)
          : null
      : undefined;
  const currency = typeof raw.currency === "string" && raw.currency.trim() !== "" ? raw.currency.trim() : undefined;
  const paymentTerms =
    "paymentTerms" in raw ? (typeof raw.paymentTerms === "string" && raw.paymentTerms.trim() !== "" ? raw.paymentTerms.trim() : null) : undefined;

  if (priceAmount !== undefined && priceAmount !== null && Number.isNaN(priceAmount)) {
    return Response.json({ ok: false, error: "Ogiltigt pris." }, { status: 400 });
  }

  const contract = await updateContractDraft(contractId, { title, content, engagementId, priceAmount, currency, paymentTerms });
  if (!contract) {
    return Response.json({ ok: false, error: "Kunde inte spara avtalet. Det kan redan vara skickat." }, { status: 502 });
  }

  return Response.json({ ok: true, contract });
}
