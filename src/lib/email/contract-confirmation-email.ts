import type { ContractContent, ContractCounterpartyType } from "@/lib/portal/types";
import type { LegalDocument, LegalInline } from "@/lib/legal/document";

/**
 * Avtalsbekräftelse — the durable-medium confirmation a consumer receives
 * when the contract is concluded.
 *
 * Self-contained plain text: the signed contract text, price and payment
 * terms, contract-specific fields, the complete general terms in force at
 * the time and the withdrawal information. It does not rely on a link, so
 * the recipient keeps the agreement as it was signed whatever later happens
 * to CVB Base or the website. The first rendering is stored in the outbox
 * row and re-used on every retry.
 *
 * CVB Base is Swedish-only, so this is too.
 */

export type ContractConfirmationContext = {
  contractId: string;
  versionId: string;
  title: string;
  clientName: string;
  counterpartyType: ContractCounterpartyType;
  clientSignerName: string;
  clientSignedAt: string;
  coachSignerName: string;
  /** The countersignature — the moment the contract was concluded. */
  concludedAt: string;
  priceAmount: number | null;
  currency: string;
  paymentTerms: string | null;
  content: ContractContent;
  withdrawalDeadline: string | null;
  earlyPerformanceRequestedAt: string | null;
  party: { tradeName: string; name: string; address: string; email: string };
  terms: LegalDocument;
  termsVersion: string;
};

export type ContractConfirmationEmail = { subject: string; body: string };

const TIMEZONE = "Europe/Stockholm";

function dateTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return `${new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(parsed)} (svensk tid)`;
}

function lastDay(deadlineIso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(new Date(deadlineIso).getTime() - 1));
}

function amount(value: number | null, currency: string): string {
  return value === null ? "Inget pris angivet i avtalet" : `${value.toLocaleString("sv-SE")} ${currency}`;
}

function inline(parts: LegalInline[]): string {
  return parts.map((part) => (typeof part === "string" ? part : part.label)).join("");
}

/**
 * Sections of the general terms that only concern consumers. A business
 * contract's confirmation leaves them out, so it carries no consumer
 * withdrawal information.
 */
const CONSUMER_ONLY_TERMS_SECTIONS = ["angerratt", "standardformular"];

/** The general terms as plain text, in the exact version rendered now. */
export function legalDocumentAsText(doc: LegalDocument, omitSectionIds: readonly string[] = []): string {
  const out: string[] = [];
  for (const section of doc.sections) {
    if (omitSectionIds.includes(section.id)) continue;
    out.push(section.heading.toUpperCase());
    for (const block of section.blocks) {
      if (block.kind === "p") out.push(inline(block.content));
      else if (block.kind === "list") out.push(...block.items.map((item) => `- ${inline(item)}`));
      else out.push(...block.items.map((item) => `${item.term}: ${inline(item.value)}`));
    }
    out.push("");
  }
  return out.join("\n").trim();
}

const RULE = "----------------------------------------";

export function buildContractConfirmationEmail(ctx: ContractConfirmationContext): ContractConfirmationEmail {
  const consumer = ctx.counterpartyType === "consumer";
  const lines: string[] = [];
  const push = (...items: Array<string | null | false>) =>
    lines.push(...items.filter((item): item is string => typeof item === "string"));

  push(
    `Hej ${ctx.clientName},`,
    "",
    `Här är din bekräftelse på avtalet ${ctx.title}. Avtalet ingicks ${dateTime(ctx.concludedAt)} när både du och ${ctx.party.name} hade signerat i CVB Base.`,
    "Spara gärna det här meddelandet. Det innehåller avtalet i den version som signerades och de allmänna villkor som gällde då.",
    "",
    RULE,
    "PARTER",
    `${ctx.party.tradeName}, drivs av ${ctx.party.name}, ${ctx.party.address}, ${ctx.party.email}`,
    `Klient: ${ctx.clientName}`,
    "",
    "AVTAL",
    `Titel: ${ctx.title}`,
    `Avtals-ID: ${ctx.contractId}`,
    `Avtalsversion: ${ctx.versionId}`,
    `Avtalstyp: ${consumer ? "Konsumentavtal" : "Företagsavtal"}`,
    `Signerat av klient: ${ctx.clientSignerName}, ${dateTime(ctx.clientSignedAt)}`,
    `Signerat av ${ctx.party.tradeName}: ${ctx.coachSignerName}, ${dateTime(ctx.concludedAt)}`,
    `Avtalet ingicks: ${dateTime(ctx.concludedAt)}`,
    "",
    "PRIS OCH BETALNING",
    `Pris: ${amount(ctx.priceAmount, ctx.currency)}`,
    `Valuta: ${ctx.currency}`,
    `Betalningsvillkor: ${ctx.paymentTerms ?? "Inga betalningsvillkor angivna i avtalet"}`,
    "",
    RULE,
    "AVTALSTEXT",
    "",
  );

  if (ctx.content.sections.length === 0) {
    push("(Avtalet innehåller ingen fritext utöver uppgifterna ovan.)", "");
  }
  for (const section of ctx.content.sections) {
    push(section.heading, section.body, "");
  }

  if (ctx.content.fields.length > 0) {
    push("UPPDRAGSSPECIFIKA VILLKOR");
    for (const field of ctx.content.fields) {
      push(`${field.label}: ${field.value || "—"}`);
    }
    push("");
  }

  if (consumer) {
    push(
      RULE,
      "ÅNGERRÄTT",
      "Du har rätt att ångra avtalet inom 14 dagar från att det ingicks.",
      ctx.withdrawalDeadline ? `Ångerfristens sista dag: ${lastDay(ctx.withdrawalDeadline)}.` : null,
      "Du ångrar dig enklast i CVB Base: öppna avtalet under Avtal och välj Ångra avtalet här. Du kan också mejla ett tydligt meddelande om att du ångrar avtalet till " +
        `${ctx.party.email}, gärna med standardformuläret i de allmänna villkoren nedan.`,
      ctx.earlyPerformanceRequestedAt
        ? `Du begärde ${dateTime(ctx.earlyPerformanceRequestedAt)} att coachingen skulle påbörjas under ångerfristen. Om du ångrar dig betalar du för den del av tjänsten som utförts fram till dess. Ångerrätten upphör om tjänsten har utförts helt.`
        : "Du har inte begärt att coachingen ska påbörjas under ångerfristen.",
      "",
    );
  }

  push(
    RULE,
    `ALLMÄNNA VILLKOR FÖR COACHING (version ${ctx.termsVersion})`,
    "",
    legalDocumentAsText(ctx.terms, consumer ? [] : CONSUMER_ONLY_TERMS_SECTIONS),
    "",
    RULE,
    ctx.party.tradeName,
  );

  return {
    subject: `Avtalsbekräftelse: ${ctx.title}`,
    body: lines.join("\n"),
  };
}
