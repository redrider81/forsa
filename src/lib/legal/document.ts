import { formattedPostalAddress, LEGAL_ENTITY } from "@/lib/legal/company";
import type { Locale } from "@/lib/i18n/config";

/** Minimal structured content for the legal pages — no CMS, no markdown. */

export type LegalInline = string | { href: string; label: string };

export type LegalBlock =
  | { kind: "p"; content: LegalInline[] }
  | { kind: "list"; items: LegalInline[][] }
  | { kind: "facts"; items: Array<{ term: string; value: LegalInline[] }> };

export type LegalSection = { id: string; heading: string; blocks: LegalBlock[] };

export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  label: string;
  title: string;
  lead: string;
  updatedLabel: string;
  tocLabel: string;
  sections: LegalSection[];
};

export const link = (label: string, href: string): LegalInline => ({ label, href });
export const p = (...content: LegalInline[]): LegalBlock => ({ kind: "p", content });
export const list = (...items: Array<LegalInline | LegalInline[]>): LegalBlock => ({
  kind: "list",
  items: items.map((item) => (Array.isArray(item) ? item : [item])),
});
export const facts = (...items: Array<[string, LegalInline | LegalInline[]]>): LegalBlock => ({
  kind: "facts",
  items: items.map(([term, value]) => ({ term, value: Array.isArray(value) ? value : [value] })),
});

/**
 * The business identity as a facts block. Business form and organisation
 * number appear only once a registration is recorded in company.ts —
 * never as placeholders.
 */
export function companyFacts(locale: Locale): LegalBlock {
  const sv = locale === "sv";
  const registration = LEGAL_ENTITY.registration;
  const rows: Array<[string, LegalInline | LegalInline[]]> = [
    [sv ? "Verksamhet" : "Business", LEGAL_ENTITY.tradeName],
    [sv ? "Drivs av" : "Run by", LEGAL_ENTITY.operator],
  ];
  if (registration) {
    rows.push([sv ? "Registrerat namn" : "Registered name", registration.registeredName]);
    rows.push([sv ? "Företagsform" : "Business form", sv ? registration.businessFormSv : registration.businessFormEn]);
    rows.push([sv ? "Organisationsnummer" : "Company registration number", registration.organisationNumber]);
  }
  rows.push([sv ? "Adress" : "Address", formattedPostalAddress()]);
  rows.push([sv ? "E-post" : "Email", link(LEGAL_ENTITY.legalEmail, `mailto:${LEGAL_ENTITY.legalEmail}`)]);
  if (LEGAL_ENTITY.phone) {
    rows.push([sv ? "Telefon" : "Phone", LEGAL_ENTITY.phone]);
  }
  rows.push([sv ? "Webbplats" : "Website", link("cvbcoaching.se", LEGAL_ENTITY.website)]);
  return facts(...rows);
}

export function formatUpdated(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(new Date(`${iso}T12:00:00Z`));
}
