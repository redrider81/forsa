import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BookingEmailProvider } from "@/lib/email/booking-provider";
import { buildClientInvitationEmail } from "@/lib/email/client-invitation-email";
import { isEmailSendEnabled } from "@/lib/email/result-email";
import { resolveOperatorRecipient, sanitizeError } from "@/lib/portal/booking-notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Client invitation to CVB Base: create the client first, invite separately.
 *
 * The decision whether an invitation may go out, and against which identity,
 * is made by begin_client_invitation under the coach's own session (RLS,
 * ownership, row lock, conflict rules). Only after that does the Auth Admin
 * API provision the account and produce a one-time link. The link is mailed
 * and never stored; the ledger only records what verifiably happened.
 *
 * Verified against Supabase Auth (GoTrue v2.195.0):
 *   * createUser with app_metadata links the account through the
 *     handle_new_auth_user trigger, atomically; an invalid link fails the
 *     whole creation.
 *   * generateLink "invite" works for a new or unconfirmed account and
 *     supersedes the previous link; for a confirmed account it fails with
 *     email_exists, so a confirmed account that never set a password gets a
 *     "recovery" link instead.
 */

export const CANONICAL_ORIGIN = "https://cvbcoaching.se";

export type ActivationLinkType = "invite" | "recovery";

export type InvitationConfig = {
  origin: string;
  validHours: number;
  from: string;
  replyTo: string;
};

export type InvitationConfigResult = { ok: true; config: InvitationConfig } | { ok: false; reason: string };

/**
 * The link origin is never taken from the request. Production always uses
 * the canonical domain; any other environment must name its own origin
 * explicitly, so a local or preview build cannot mail production links.
 */
export function resolveInvitationOrigin(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.VERCEL_ENV === "production") return CANONICAL_ORIGIN;
  const configured = env.PORTAL_INVITATION_ORIGIN?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol === "https:" || (url.protocol === "http:" && local)) return url.origin;
  } catch {
    // fall through
  }
  return null;
}

/**
 * Must equal the Supabase Auth email OTP expiry (mailer_otp_exp). Required,
 * so the email can never promise a validity the link does not have.
 */
export function resolveValidHours(env: NodeJS.ProcessEnv = process.env): number | null {
  const raw = env.PORTAL_INVITATION_VALID_HOURS?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const hours = Number(raw);
  return hours >= 1 && hours <= 24 ? hours : null;
}

function captureDir(env: NodeJS.ProcessEnv): string | null {
  if (env.NODE_ENV === "production") return null;
  return env.PORTAL_EMAIL_CAPTURE_DIR?.trim() || null;
}

export function resolveInvitationConfig(env: NodeJS.ProcessEnv = process.env): InvitationConfigResult {
  const origin = resolveInvitationOrigin(env);
  if (!origin) return { ok: false, reason: "missing_origin" };
  const validHours = resolveValidHours(env);
  if (!validHours) return { ok: false, reason: "missing_valid_hours" };

  if (captureDir(env)) {
    return { ok: true, config: { origin, validHours, from: "CVB Coaching <capture@localhost>", replyTo: "capture@localhost" } };
  }
  if (env.EMAIL_SEND_ENABLED !== "true") return { ok: false, reason: "email_disabled" };
  const from = env.EMAIL_FROM?.trim();
  if (!from) return { ok: false, reason: "missing_from_address" };
  return { ok: true, config: { origin, validHours, from, replyTo: resolveOperatorRecipient() } };
}

/**
 * Real delivery through the existing Resend provider. Outside production a
 * capture directory may be configured instead, which writes the message to
 * disk and sends nothing — used for isolated integration testing only.
 * There is no simulated success: without a provider nothing is provisioned.
 */
export async function createInvitationProvider(
  env: NodeJS.ProcessEnv = process.env,
): Promise<BookingEmailProvider | null> {
  const dir = captureDir(env);
  if (dir) {
    return {
      async send({ to, subject, body, idempotencyKey }) {
        await mkdir(dir, { recursive: true });
        const id = `capture-${Date.now()}`;
        await writeFile(join(dir, `${id}.json`), JSON.stringify({ to, subject, body, idempotencyKey }, null, 2), {
          mode: 0o600,
        });
        return { id };
      },
    };
  }
  if (!isEmailSendEnabled()) return null;
  const { createResendBookingProvider } = await import("@/lib/email/booking-provider");
  return createResendBookingProvider();
}

/**
 * The token travels in the fragment: it never reaches a server log or a
 * Referer header. The fragment is shaped as a valid CSS id selector
 * ("#aktivera-invite-<hex>") because the root layout resolves any fragment
 * with document.querySelector for anchor scrolling.
 */
export function buildActivationUrl(origin: string, hashedToken: string, type: ActivationLinkType): string {
  return `${origin}/klient-aktivera#aktivera-${type}-${hashedToken}`;
}

// ------------------------------------------------------------------ errors

const BEGIN_ERRORS: Array<{ code: string; httpStatus: number; error: string }> = [
  { code: "NOT_COACH", httpStatus: 401, error: "Sessionen har gått ut. Logga in igen." },
  { code: "CLIENT_NOT_FOUND", httpStatus: 404, error: "Klienten kunde inte hittas." },
  {
    code: "CLIENT_NOT_ACTIVE",
    httpStatus: 409,
    error: "Klienten är avslutad. Återaktivera klienten innan du skickar en inbjudan.",
  },
  {
    code: "INVALID_EMAIL",
    httpStatus: 422,
    error: "Klientens e-postadress ser inte ut att vara giltig. Kontrollera adressen innan du skickar inbjudan.",
  },
  { code: "ALREADY_ACTIVATED", httpStatus: 409, error: "Klienten har redan aktiverat sitt konto i CVB Base." },
  {
    code: "LINKED_EMAIL_MISMATCH",
    httpStatus: 409,
    error:
      "Klientens konto är kopplat till en annan e-postadress än den som står på klienten. Kontot ändras inte automatiskt – kontakta administratören.",
  },
  {
    code: "EMAIL_IN_USE",
    httpStatus: 409,
    error:
      "E-postadressen används redan av ett annat konto i CVB Base. Kontot flyttas inte automatiskt – kontakta administratören.",
  },
  {
    code: "EMAIL_UNLINKED_ACCOUNT",
    httpStatus: 409,
    error:
      "Det finns redan ett konto med den här e-postadressen som inte är kopplat till någon klient. Det kopplas inte automatiskt – kontakta administratören.",
  },
  {
    code: "INVITATION_IN_PROGRESS",
    httpStatus: 409,
    error: "En inbjudan håller redan på att skickas. Vänta en stund och uppdatera sidan.",
  },
  {
    code: "INVITATION_RECENTLY_SENT",
    httpStatus: 429,
    error: "En inbjudan skickades nyss. Vänta en minut innan du skickar igen.",
  },
];

export function mapBeginError(message: string | undefined): { code: string; httpStatus: number; error: string } {
  const match = BEGIN_ERRORS.find((entry) => message?.includes(entry.code));
  return match ?? { code: "UNKNOWN", httpStatus: 502, error: "Inbjudan kunde inte förberedas. Försök igen." };
}

export const CONFIG_ERROR = "Inbjudningar till CVB Base är inte aktiverade i den här miljön.";
const ACCOUNT_ERROR = "Kontot kunde inte skapas. Försök igen om en stund.";
const SEND_ERROR = "Inbjudan kunde inte skickas. Försök igen.";

// ------------------------------------------------------------------ orchestration

type RpcResult<T> = { data: T | null; error: { message: string } | null };

/** The coach's own Supabase client (RLS) — only the invitation RPCs are used. */
export type InvitationDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<RpcResult<unknown>>;
};

type AdminUserResult = { data: { user: { id: string } | null }; error: { message: string; code?: string } | null };
type AdminLinkResult = {
  data: { user: { id: string } | null; properties: { hashed_token: string } | null };
  error: { message: string; code?: string } | null;
};

/** The two Auth Admin operations the flow needs, nothing more. */
export type InvitationAdmin = {
  auth: {
    admin: {
      createUser: (attributes: {
        email: string;
        email_confirm: boolean;
        app_metadata: Record<string, unknown>;
        user_metadata: Record<string, unknown>;
      }) => Promise<AdminUserResult>;
      generateLink: (params: { type: ActivationLinkType; email: string }) => Promise<AdminLinkResult>;
    };
  };
};

export type InvitationOutcome =
  | { ok: true; status: "sent" }
  | { ok: false; httpStatus: number; code: string; error: string };

type BeginResult = {
  recipient_email: string;
  client_name: string;
  auth_user_id: string | null;
  auth_user_confirmed: boolean;
  attempt: number;
};

export async function sendClientInvitation(
  clientId: string,
  deps: { db: InvitationDb; admin: InvitationAdmin; provider: BookingEmailProvider; config: InvitationConfig },
): Promise<InvitationOutcome> {
  const { db, admin, provider, config } = deps;

  const begin = await db.rpc("begin_client_invitation", { p_client_id: clientId });
  if (begin.error || !begin.data) {
    const mapped = mapBeginError(begin.error?.message);
    return { ok: false, ...mapped };
  }
  const plan = begin.data as BeginResult;

  async function fail(code: string, message: string, error: string, authUserId?: string | null): Promise<InvitationOutcome> {
    await db.rpc("record_client_invitation_result", {
      p_client_id: clientId,
      p_status: "failed",
      p_auth_user_id: authUserId ?? undefined,
      p_error_code: code,
      p_error_message: message,
    });
    return { ok: false, httpStatus: 502, code, error };
  }

  let authUserId = plan.auth_user_id;
  if (!authUserId) {
    const created = await admin.auth.admin.createUser({
      email: plan.recipient_email,
      email_confirm: false,
      app_metadata: { portal_role: "klient", portal_subject_id: clientId },
      user_metadata: { name: plan.client_name },
    });
    if (created.error || !created.data.user) {
      const code = created.error?.code === "email_exists" ? "account_exists" : "account_create_failed";
      return fail(code, created.error?.message?.slice(0, 300) ?? "", ACCOUNT_ERROR);
    }
    authUserId = created.data.user.id;
  }

  // A confirmed account cannot take an invite link (email_exists); it gets
  // a recovery link, which sets the password in the same activation flow.
  const type: ActivationLinkType = plan.auth_user_confirmed ? "recovery" : "invite";
  const link = await admin.auth.admin.generateLink({ type, email: plan.recipient_email });
  const hashedToken = link.data?.properties?.hashed_token;
  if (link.error || !hashedToken) {
    return fail("link_failed", link.error?.message?.slice(0, 300) ?? "", SEND_ERROR, authUserId);
  }
  if (link.data.user?.id !== authUserId) {
    return fail("identity_mismatch", "Länken avsåg ett annat konto än det kopplade.", SEND_ERROR, authUserId);
  }

  const email = buildClientInvitationEmail({
    clientName: plan.client_name,
    activationUrl: buildActivationUrl(config.origin, hashedToken, type),
    validHours: config.validHours,
    loginUrl: `${config.origin}/klient-login`,
  });

  try {
    const sent = await provider.send({
      from: config.from,
      to: plan.recipient_email,
      subject: email.subject,
      body: email.body,
      idempotencyKey: `cvb-client-invitation/${clientId}/${plan.attempt}`,
      replyTo: config.replyTo,
    });
    const recorded = await db.rpc("record_client_invitation_result", {
      p_client_id: clientId,
      p_status: "sent",
      p_auth_user_id: authUserId,
      p_provider_message_id: sent.id,
    });
    if (recorded.error) {
      // The message went out; the ledger stays pending and becomes
      // retryable after the in-progress window. Never reported as failed.
      console.error("[CVB Coaching] Inbjudan skickad men kunde inte registreras", { clientId });
    }
    return { ok: true, status: "sent" };
  } catch (error) {
    const sanitized = sanitizeError(error);
    console.error("[CVB Coaching] Inbjudan kunde inte skickas", { errorCode: sanitized.code });
    return fail(sanitized.code, sanitized.message, SEND_ERROR, authUserId);
  }
}

// ------------------------------------------------------------------ status

export type PortalAccessState = "not_invited" | "pending" | "sent" | "failed" | "activated";

export type PortalAccess = {
  state: PortalAccessState;
  hasAccount: boolean;
  recipientEmail: string | null;
  attemptCount: number;
  lastAttemptAt: string | null;
  providerAcceptedAt: string | null;
  activatedAt: string | null;
  lastErrorCode: string | null;
  pendingStale: boolean;
};

const STATES = new Set<PortalAccessState>(["not_invited", "pending", "sent", "failed", "activated"]);

export function parsePortalAccess(raw: unknown): PortalAccess | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const state = value.state as PortalAccessState;
  if (!STATES.has(state)) return null;
  const str = (key: string) => (typeof value[key] === "string" ? (value[key] as string) : null);
  return {
    state,
    hasAccount: value.has_account === true,
    recipientEmail: str("recipient_email"),
    attemptCount: typeof value.attempt_count === "number" ? value.attempt_count : 0,
    lastAttemptAt: str("last_attempt_at"),
    providerAcceptedAt: str("provider_accepted_at"),
    activatedAt: str("activated_at"),
    lastErrorCode: str("last_error_code"),
    pendingStale: value.pending_stale === true,
  };
}

/** Coach-only; resolved under the coach's own session. */
export async function getClientPortalAccess(clientId: string): Promise<PortalAccess | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("client_portal_access", { p_client_id: clientId });
  if (error) return null;
  return parsePortalAccess(data);
}
