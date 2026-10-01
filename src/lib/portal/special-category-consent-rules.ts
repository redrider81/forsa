/**
 * Samtycke till behandling av känsliga personuppgifter (GDPR art. 9.2 a).
 *
 * Shared by the server and the client UI. The version must be one the
 * database accepts (grant_special_category_consent in
 * 20261001090100_cvb_base_special_category_consent.sql); changing the text
 * below means adding a new version there too.
 */
export const SPECIAL_CATEGORY_CONSENT_VERSION = "2026-10-01";

export type SpecialCategoryConsentRecord = {
  id: string;
  version: string;
  grantedAt: string;
  withdrawnAt: string | null;
};

/** Newest first. The active consent is the one not withdrawn. */
export function activeConsent(history: SpecialCategoryConsentRecord[]): SpecialCategoryConsentRecord | null {
  return history.find((record) => record.withdrawnAt === null) ?? null;
}

export type SpecialCategoryConsentState = "none" | "active" | "withdrawn";

export function consentState(history: Array<{ withdrawnAt: string | null }>): SpecialCategoryConsentState {
  if (history.length === 0) return "none";
  return history.some((record) => record.withdrawnAt === null) ? "active" : "withdrawn";
}

/**
 * NULL unless WITHDRAWN; then the latest withdrawal time T. Mirrors
 * public.special_category_restriction_cutoff().
 */
export function restrictionCutoff(history: Array<{ withdrawnAt: string | null }>): string | null {
  if (consentState(history) !== "withdrawn") return null;
  return history.reduce<string | null>((latest, record) => {
    if (!record.withdrawnAt) return latest;
    return !latest || Date.parse(record.withdrawnAt) > Date.parse(latest) ? record.withdrawnAt : latest;
  }, null);
}

/** `ts <= cutoff`, with a missing timestamp counting as before (conservative). */
export function isAtOrBefore(ts: string | null | undefined, cutoff: string): boolean {
  if (!ts) return true;
  return Date.parse(ts) <= Date.parse(cutoff);
}

export type SpecialCategoryErasureRequest = {
  id: string;
  /** The withdrawal time the request covers: content up to here is erased. */
  cutoff: string;
  requestedAt: string;
  completedAt: string | null;
};

/**
 * Whether the client can ask for erasure now: WITHDRAWN, no open request,
 * and no completed request already covering the current cutoff.
 */
export function canRequestErasure(
  history: Array<{ withdrawnAt: string | null }>,
  requests: SpecialCategoryErasureRequest[],
): boolean {
  const cutoff = restrictionCutoff(history);
  if (!cutoff) return false;
  if (requests.some((request) => request.completedAt === null)) return false;
  return !requests.some((request) => Date.parse(request.cutoff) >= Date.parse(cutoff));
}

/**
 * Article 9 processing windows: [granted_at, withdrawn_at) per consent row,
 * open-ended while still active. Content written inside a window was given
 * under consent; anything else — before the first consent, between a
 * withdrawal and a new consent — never becomes covered retroactively.
 */
export type ConsentWindow = { grantedAt: string; withdrawnAt: string | null };

/** True only for a timestamp inside a window. A missing timestamp is outside (exclude when uncertain). */
export function isInsideConsentWindow(ts: string | null | undefined, windows: ConsentWindow[]): boolean {
  if (!ts) return false;
  const t = Date.parse(ts);
  return windows.some(
    (w) => Date.parse(w.grantedAt) <= t && (w.withdrawnAt === null || t < Date.parse(w.withdrawnAt)),
  );
}
