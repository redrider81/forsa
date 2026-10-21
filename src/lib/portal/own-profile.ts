import "server-only";

import type { ClientDetailsAdmin, ClientDetailsDb } from "@/lib/portal/client-details";

/**
 * CVB-CR-20261021-01 — the client edits her own name, role, email and phone
 * under Profil.
 *
 * Same guarantee as Carolina's correction (CVB-CR-20261015-01): the
 * decision is made in the database under the client's own session
 * (begin_own_client_profile_update). When the address changes, her own
 * account (auth.uid(); the link is never re-pointed) is re-addressed through
 * the Auth Admin API first. Only then does update_own_client_profile write
 * the client row and the profile, and it refuses unless the account already
 * carries the new address — so the client row, the profile and the sign-in
 * address can never diverge. If that final write fails, the account address
 * is restored.
 */

export type OwnProfileInput = { name: string; role: string; email: string; phone: string };

export type OwnProfileOutcome =
  | { ok: true; emailChanged: boolean }
  | { ok: false; httpStatus: number; code: string; error: string };

type Plan = {
  email: string;
  email_changed: boolean;
  auth_user_id: string | null;
  auth_user_confirmed: boolean;
};

const ERRORS: Array<{ code: string; httpStatus: number; error: string }> = [
  { code: "NOT_CLIENT", httpStatus: 401, error: "Sessionen har gått ut. Logga in igen." },
  { code: "INVALID_NAME", httpStatus: 422, error: "Ange ditt namn." },
  { code: "INVALID_ROLE", httpStatus: 422, error: "Ange din roll eller titel." },
  { code: "INVALID_PHONE", httpStatus: 422, error: "Telefonnumret är för långt." },
  { code: "INVALID_EMAIL", httpStatus: 422, error: "Ange en giltig e-postadress." },
  {
    code: "EMAIL_IN_USE",
    httpStatus: 409,
    error: "E-postadressen används redan i CVB Base. Kontakta Carolina om du behöver hjälp.",
  },
  {
    code: "AUTH_EMAIL_NOT_SYNCED",
    httpStatus: 409,
    error: "Ditt konto kunde inte uppdateras med den nya adressen. Inget har ändrats.",
  },
];

const UNKNOWN_ERROR = "Profilen kunde inte sparas. Försök igen.";
export const OWN_EMAIL_ADMIN_UNAVAILABLE_ERROR =
  "E-postadressen kan inte ändras just nu. Övriga uppgifter kan sparas utan adressändring.";

export function mapOwnProfileError(message: string | undefined): { code: string; httpStatus: number; error: string } {
  const match = ERRORS.find((entry) => message?.includes(entry.code));
  return match ?? { code: "UNKNOWN", httpStatus: 502, error: UNKNOWN_ERROR };
}

export async function updateOwnProfile(
  input: OwnProfileInput,
  deps: { db: ClientDetailsDb; admin: ClientDetailsAdmin | null },
): Promise<OwnProfileOutcome> {
  const { db, admin } = deps;
  const args = { p_name: input.name, p_role: input.role, p_email: input.email, p_phone: input.phone };

  const begin = await db.rpc("begin_own_client_profile_update", args);
  if (begin.error || !begin.data) return { ok: false, ...mapOwnProfileError(begin.error?.message) };
  const plan = begin.data as Plan;

  // Re-address her own account first, unless it already carries the address.
  let restoreEmail: string | null = null;
  if (plan.email_changed && plan.auth_user_id) {
    if (!admin) {
      return { ok: false, httpStatus: 503, code: "ADMIN_UNAVAILABLE", error: OWN_EMAIL_ADMIN_UNAVAILABLE_ERROR };
    }

    const current = await admin.auth.admin.getUserById(plan.auth_user_id);
    if (current.error || current.data.user?.id !== plan.auth_user_id) {
      return { ok: false, httpStatus: 502, code: "ACCOUNT_LOOKUP_FAILED", error: UNKNOWN_ERROR };
    }
    const currentEmail = current.data.user.email ?? "";

    if (currentEmail.toLowerCase() !== plan.email) {
      const updated = await admin.auth.admin.updateUserById(plan.auth_user_id, {
        email: plan.email,
        // A confirmed account stays confirmed; an unconfirmed one is not
        // confirmed by this change.
        ...(plan.auth_user_confirmed ? { email_confirm: true } : {}),
      });
      if (updated.error || updated.data.user?.id !== plan.auth_user_id) {
        if (updated.error?.code === "email_exists") {
          return { ok: false, ...mapOwnProfileError("EMAIL_IN_USE") };
        }
        return { ok: false, httpStatus: 502, code: "ACCOUNT_UPDATE_FAILED", error: UNKNOWN_ERROR };
      }
      restoreEmail = currentEmail;
    }
  }

  const write = await db.rpc("update_own_client_profile", args);
  if (write.error) {
    if (restoreEmail !== null && plan.auth_user_id && admin) {
      const restored = await admin.auth.admin.updateUserById(plan.auth_user_id, { email: restoreEmail });
      if (restored.error) {
        console.error("[CVB Coaching] Klientkontots e-postadress kunde inte återställas");
      }
    }
    return { ok: false, ...mapOwnProfileError(write.error.message) };
  }

  return { ok: true, emailChanged: plan.email_changed };
}
