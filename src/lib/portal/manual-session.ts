import "server-only";

/**
 * CVB-CR-20261015-01 — Carolina records a coaching session that has already
 * taken place, from the client view, without a booking.
 *
 * register_manual_coaching_session (SECURITY DEFINER, Carolina's own
 * session) writes one row in the existing sessions model with status
 * 'genomford', numbered like the booking flow. It creates no booking
 * request, reservation, notification or invitation, so nothing is ever
 * emailed, and it never changes an existing session.
 */

export type ManualSessionInput = { date: string; startTime: string; endTime: string };

export type ManualSessionOutcome =
  | { ok: true; sessionId: string }
  | { ok: false; httpStatus: number; code: string; error: string };

type RpcResult<T> = { data: T | null; error: { message: string } | null };

export type ManualSessionDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<RpcResult<unknown>>;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const ERRORS: Array<{ code: string; httpStatus: number; error: string }> = [
  { code: "NOT_COACH", httpStatus: 401, error: "Sessionen har gått ut. Logga in igen." },
  { code: "CLIENT_NOT_FOUND", httpStatus: 404, error: "Klienten kunde inte hittas." },
  { code: "INVALID_TIME", httpStatus: 422, error: "Ange datum, starttid och sluttid." },
  {
    code: "INVALID_INTERVAL",
    httpStatus: 422,
    error: "Sluttiden måste vara efter starttiden, och sessionen kan vara högst åtta timmar.",
  },
  {
    code: "SESSION_IN_FUTURE",
    httpStatus: 422,
    error: "Endast genomförda sessioner kan registreras. Sluttiden har inte passerats ännu.",
  },
  {
    code: "SESSION_OVERLAP",
    httpStatus: 409,
    error: "Klienten har redan en session som överlappar den tiden.",
  },
];

export function mapManualSessionError(message: string | undefined): { code: string; httpStatus: number; error: string } {
  const match = ERRORS.find((entry) => message?.includes(entry.code));
  return match ?? { code: "UNKNOWN", httpStatus: 502, error: "Sessionen kunde inte registreras. Försök igen." };
}

/** Shape check only; every rule is enforced again in the database. */
export function parseManualSessionInput(raw: unknown): ManualSessionInput | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const date = typeof value.date === "string" ? value.date.trim() : "";
  const startTime = typeof value.startTime === "string" ? value.startTime.trim() : "";
  const endTime = typeof value.endTime === "string" ? value.endTime.trim() : "";
  if (!DATE.test(date) || !TIME.test(startTime) || !TIME.test(endTime)) return null;
  return { date, startTime, endTime };
}

export async function registerManualSession(
  clientId: string,
  input: ManualSessionInput,
  deps: { db: ManualSessionDb },
): Promise<ManualSessionOutcome> {
  const result = await deps.db.rpc("register_manual_coaching_session", {
    p_client_id: clientId,
    p_date: input.date,
    p_start_time: input.startTime,
    p_end_time: input.endTime,
  });
  if (result.error || typeof result.data !== "string") {
    return { ok: false, ...mapManualSessionError(result.error?.message) };
  }
  return { ok: true, sessionId: result.data };
}
