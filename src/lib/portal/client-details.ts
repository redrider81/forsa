import "server-only";

import { deriveClientInitials } from "@/lib/portal/repository";

/**
 * CVB-CR-20261015-01 — Carolina corrects a client's details, including the
 * email address, from the client view.
 *
 * The decision is made in the database under Carolina's own session
 * (begin_coach_client_update: ownership, validation, duplicates, identity
 * conflicts). When the client already has a portal account and the address
 * changes, that same account (same auth.users id; the link is never
 * re-pointed) is re-addressed through the Auth Admin API first. Only then
 * does update_coach_client_details write the client row and the profile, and
 * it refuses unless the account already carries the new address — so the
 * client row, the profile and the account can never point at different
 * addresses. If that final write fails, the account address is restored.
 */

export type ClientDetailsInput = { name: string; role: string; email: string; phone: string };

export type ClientDetailsOutcome =
  | { ok: true; emailChanged: boolean }
  | { ok: false; httpStatus: number; code: string; error: string };

type RpcResult<T> = { data: T | null; error: { message: string } | null };

/** Carolina's own Supabase client (RLS) — only the two RPCs are used. */
export type ClientDetailsDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<RpcResult<unknown>>;
};

type AdminUser = { id: string; email?: string | null };
type AdminResult = { data: { user: AdminUser | null }; error: { message: string; code?: string } | null };

/** The two Auth Admin operations the correction needs, nothing more. */
export type ClientDetailsAdmin = {
  auth: {
    admin: {
      getUserById: (id: string) => Promise<AdminResult>;
      updateUserById: (id: string, attributes: { email: string; email_confirm?: boolean }) => Promise<AdminResult>;
    };
  };
};

type Plan = {
  email: string;
  email_changed: boolean;
  auth_user_id: string | null;
  auth_user_confirmed: boolean;
};

const ERRORS: Array<{ code: string; httpStatus: number; error: string }> = [
  { code: "NOT_COACH", httpStatus: 401, error: "Sessionen har gått ut. Logga in igen." },
  { code: "CLIENT_NOT_FOUND", httpStatus: 404, error: "Klienten kunde inte hittas." },
  { code: "INVALID_NAME", httpStatus: 422, error: "Ange klientens namn." },
  { code: "INVALID_ROLE", httpStatus: 422, error: "Ange klientens roll eller titel." },
  { code: "INVALID_PHONE", httpStatus: 422, error: "Telefonnumret är för långt." },
  { code: "INVALID_EMAIL", httpStatus: 422, error: "Ange en giltig e-postadress." },
  {
    code: "EMAIL_IN_USE",
    httpStatus: 409,
    error: "E-postadressen används redan av en annan klient eller ett annat konto i CVB Base.",
  },
  {
    code: "INVITATION_IN_PROGRESS",
    httpStatus: 409,
    error: "En inbjudan håller på att skickas till klienten. Vänta en stund och försök igen.",
  },
  {
    code: "AUTH_EMAIL_NOT_SYNCED",
    httpStatus: 409,
    error: "Klientens konto kunde inte uppdateras med den nya adressen. Inget har ändrats.",
  },
];

const UNKNOWN_ERROR = "Uppgifterna kunde inte sparas. Försök igen.";
export const ADMIN_UNAVAILABLE_ERROR =
  "E-postadressen kan inte ändras för en klient med konto i den här miljön. Övriga uppgifter kan sparas utan adressändring.";

export function mapClientDetailsError(message: string | undefined): { code: string; httpStatus: number; error: string } {
  const match = ERRORS.find((entry) => message?.includes(entry.code));
  return match ?? { code: "UNKNOWN", httpStatus: 502, error: UNKNOWN_ERROR };
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Shape check only; every rule is enforced again in the database. */
export function parseClientDetailsInput(raw: unknown): ClientDetailsInput | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.name !== "string" || typeof value.role !== "string" || typeof value.email !== "string") return null;
  if (value.phone !== undefined && typeof value.phone !== "string") return null;
  return {
    name: text(value.name, 120),
    role: text(value.role, 120),
    email: text(value.email, 254),
    phone: text(value.phone, 40),
  };
}

export async function updateClientDetails(
  clientId: string,
  input: ClientDetailsInput,
  deps: { db: ClientDetailsDb; admin: ClientDetailsAdmin | null },
): Promise<ClientDetailsOutcome> {
  const { db, admin } = deps;
  const args = {
    p_client_id: clientId,
    p_name: input.name,
    p_role: input.role,
    p_email: input.email,
    p_phone: input.phone,
    p_initials: deriveClientInitials(input.name),
  };

  const begin = await db.rpc("begin_coach_client_update", args);
  if (begin.error || !begin.data) return { ok: false, ...mapClientDetailsError(begin.error?.message) };
  const plan = begin.data as Plan;

  // Re-address the linked account first, unless it already carries the address.
  let restoreEmail: string | null = null;
  if (plan.email_changed && plan.auth_user_id) {
    if (!admin) return { ok: false, httpStatus: 503, code: "ADMIN_UNAVAILABLE", error: ADMIN_UNAVAILABLE_ERROR };

    const current = await admin.auth.admin.getUserById(plan.auth_user_id);
    if (current.error || current.data.user?.id !== plan.auth_user_id) {
      return { ok: false, httpStatus: 502, code: "ACCOUNT_LOOKUP_FAILED", error: UNKNOWN_ERROR };
    }
    const currentEmail = current.data.user.email ?? "";

    if (currentEmail.toLowerCase() !== plan.email) {
      const updated = await admin.auth.admin.updateUserById(plan.auth_user_id, {
        email: plan.email,
        // A confirmed account stays confirmed; an unconfirmed one is not
        // confirmed by this correction.
        ...(plan.auth_user_confirmed ? { email_confirm: true } : {}),
      });
      if (updated.error || updated.data.user?.id !== plan.auth_user_id) {
        if (updated.error?.code === "email_exists") {
          return { ok: false, ...mapClientDetailsError("EMAIL_IN_USE") };
        }
        return { ok: false, httpStatus: 502, code: "ACCOUNT_UPDATE_FAILED", error: UNKNOWN_ERROR };
      }
      restoreEmail = currentEmail;
    }
  }

  const write = await db.rpc("update_coach_client_details", args);
  if (write.error) {
    if (restoreEmail !== null && plan.auth_user_id && admin) {
      const restored = await admin.auth.admin.updateUserById(plan.auth_user_id, { email: restoreEmail });
      if (restored.error) {
        console.error("[CVB Coaching] Kontots e-postadress kunde inte återställas", { clientId });
      }
    }
    return { ok: false, ...mapClientDetailsError(write.error.message) };
  }

  return { ok: true, emailChanged: plan.email_changed };
}
