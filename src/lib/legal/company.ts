/**
 * The business identity used on the legal pages.
 *
 * CVB Coaching is currently run by Carolina von Braun as a private
 * individual. There is no registered business, business form or
 * organisation number yet, so none is shown — and the pages never describe
 * CVB Coaching as a registered company. Carolina's personal identity number
 * is never published.
 *
 * When the business is registered, fill in `registration` below. The legal
 * pages then show the business form, registered name and organisation
 * number, and name the registered business as controller and contracting
 * party, without any text on the pages being rewritten.
 */

export type BusinessRegistration = {
  /** Registered name, e.g. as recorded by Bolagsverket. */
  registeredName: string;
  /** Business form in Swedish, e.g. "Enskild näringsidkare" or "Aktiebolag". */
  businessFormSv: string;
  /** The same business form in English. */
  businessFormEn: string;
  organisationNumber: string;
};

export const LEGAL_ENTITY = {
  /** Trade name used throughout the site. Not a registered company name. */
  tradeName: "CVB Coaching",
  /** The person who runs CVB Coaching — today also the controller and contracting party. */
  operator: "Carolina von Braun",
  postalAddress: {
    street: "Skårsgatan 53",
    postalCode: "412 69",
    city: "Göteborg",
  },
  /** Contact for privacy, withdrawal and other legal matters. */
  legalEmail: "carolina@cvbcoaching.se",
  /** General public mailbox (footer, structured data). Not used on the legal pages. */
  publicEmail: "info@cvbcoaching.se",
  website: "https://www.cvbcoaching.se",
  /** No verified public phone number exists. Never invent one. */
  phone: null as string | null,
  /** Not registered yet. */
  registration: null as BusinessRegistration | null,
} as const;

/** Who is controller and contracting party: the registered business once it exists, otherwise Carolina. */
export function legalPartyName(): string {
  return LEGAL_ENTITY.registration?.registeredName ?? LEGAL_ENTITY.operator;
}

export function formattedPostalAddress(): string {
  const { street, postalCode, city } = LEGAL_ENTITY.postalAddress;
  return `${street}, ${postalCode} ${city}`;
}

/** When the legal texts were last materially changed. */
export const LEGAL_UPDATED_AT = "2026-10-01";
