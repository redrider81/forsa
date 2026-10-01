import { readCoachSession } from "@/lib/portal/session";
import {
  getContract,
  parseCounterpartyType,
  setContractCounterpartyType,
  updateContractDraft,
  type ContractContent,
} from "@/lib/portal/contracts";

/**
 * Carolina edits a draft contract. RLS blocks writes once status leaves
 * UTKAST. The consumer/business classification goes through its own RPC,
 * which also allows classifying a contract that was sent before
 * classification existed, as long as the client has not signed it.
 */
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

  if ("counterpartyType" in raw) {
    const counterpartyType = parseCounterpartyType(raw.counterpartyType);
    if (!counterpartyType) {
      return Response.json({ ok: false, error: "Välj konsumentavtal eller företagsavtal." }, { status: 400 });
    }
    const classified = await setContractCounterpartyType(contractId, counterpartyType);
    if (!classified.ok) {
      return Response.json(
        { ok: false, error: "Avtalstypen kan inte ändras efter att klienten har signerat." },
        { status: 409 },
      );
    }
    const onlyClassification = Object.keys(raw).every((key) => key === "counterpartyType");
    if (onlyClassification) {
      const contract = await getContract(contractId);
      return Response.json({ ok: true, contract });
    }
  }

  const contract = await updateContractDraft(contractId, { title, content, engagementId, priceAmount, currency, paymentTerms });
  if (!contract) {
    return Response.json({ ok: false, error: "Kunde inte spara avtalet. Det kan redan vara skickat." }, { status: 502 });
  }

  return Response.json({ ok: true, contract });
}
