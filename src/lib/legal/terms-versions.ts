/**
 * Versions of the general terms (allmänna villkor).
 *
 * A contract is pinned to the version current when it is sent
 * (contracts.general_terms_version), and its confirmation renders that exact
 * version. When the terms text changes: freeze the old text under its
 * version in GENERAL_TERMS (src/lib/legal/content/terms.ts), add the new
 * version here and to the accepted list in the database RPCs
 * (send_contract_for_signature, sign_contract_as_client).
 */
export const GENERAL_TERMS_VERSIONS = ["2026-10-01", "2026-10-03"] as const;

export type GeneralTermsVersion = (typeof GENERAL_TERMS_VERSIONS)[number];

export const CURRENT_GENERAL_TERMS_VERSION: GeneralTermsVersion = "2026-10-03";

export function isGeneralTermsVersion(value: unknown): value is GeneralTermsVersion {
  return typeof value === "string" && (GENERAL_TERMS_VERSIONS as readonly string[]).includes(value);
}

/** Where a specific version of the terms can be read. */
export function generalTermsVersionHref(version: string): string {
  return `/villkor/${version}`;
}
