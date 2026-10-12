import "server-only";

import type { BookingEmailProvider } from "@/lib/email/booking-provider";
import { buildClientPasswordResetEmail } from "@/lib/email/client-password-reset-email";
import { sanitizeError } from "@/lib/portal/booking-notifications";
import type { InvitationConfig } from "@/lib/portal/client-invitations";

/**
 * "Glömt lösenord?" for client accounts.
 *
 * Supabase Auth's own recovery token does the work: generateLink("recovery")
 * produces a single-use, time-limited token, and the existing activation
 * route verifies it and sets the new password. Supabase's built-in mailer
 * is not used (no SMTP is configured and its templates are English); the
 * message goes out through the same Resend provider as the invitations.
 *
 * Eligibility is decided by client_recovery_target (service role only):
 * a linked client account, and at most one link per minute per account.
 * Coach accounts never receive a link from this flow. The caller always
 * answers the requester identically and runs this after the response, so
 * neither content nor timing reveals whether an address is registered.
 */

export const RESET_PATH = "/klient-nytt-losenord";

type RpcResult = { data: unknown; error: { message: string } | null };
type LinkResult = {
  data: { user: { id: string } | null; properties: { hashed_token: string } | null };
  error: { message: string; code?: string } | null;
};

export type RecoveryAdmin = {
  rpc: (fn: "client_recovery_target", args: { p_email: string }) => PromiseLike<RpcResult>;
  auth: { admin: { generateLink: (params: { type: "recovery"; email: string }) => Promise<LinkResult> } };
};

export type RecoveryOutcome = "sent" | "skipped" | "failed";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function normalizeRecoveryEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return EMAIL.test(email) && email.length <= 254 ? email : null;
}

export async function sendClientPasswordReset(
  email: string,
  deps: { admin: RecoveryAdmin; provider: BookingEmailProvider; config: InvitationConfig },
): Promise<RecoveryOutcome> {
  const { admin, provider, config } = deps;

  const target = await admin.rpc("client_recovery_target", { p_email: email });
  if (target.error) {
    console.error("[CVB Coaching] Återställning: kontroll misslyckades");
    return "failed";
  }
  const targetId = typeof target.data === "string" ? target.data : null;
  if (!targetId) return "skipped";

  const link = await admin.auth.admin.generateLink({ type: "recovery", email });
  const hashedToken = link.data?.properties?.hashed_token;
  if (link.error || !hashedToken || link.data.user?.id !== targetId) {
    console.error("[CVB Coaching] Återställning: länk kunde inte skapas", { errorCode: link.error?.code ?? "mismatch" });
    return "failed";
  }

  const message = buildClientPasswordResetEmail({
    // Same fragment shape as the invitation link; the token never reaches a server log.
    resetUrl: `${config.origin}${RESET_PATH}#aktivera-recovery-${hashedToken}`,
    validHours: config.validHours,
    loginUrl: `${config.origin}/klient-login`,
  });

  try {
    await provider.send({
      from: config.from,
      to: email,
      subject: message.subject,
      body: message.body,
      // One logical reset per account and minute (matches the database throttle).
      idempotencyKey: `cvb-client-recovery/${targetId}/${Math.floor(Date.now() / 60_000)}`,
      replyTo: config.replyTo,
    });
    return "sent";
  } catch (error) {
    console.error("[CVB Coaching] Återställning kunde inte skickas", { errorCode: sanitizeError(error).code });
    return "failed";
  }
}
