import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signering och verifiering av portalens sessionstoken.
 * Fristående från Next-API:er så att logiken kan enhetstestas.
 */

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type PortalRole = "coach" | "klient";

export type PortalSession = {
  userId: string;
  name: string;
  role: PortalRole;
  /** coachId för en coach, clientId för en klient. */
  subjectId: string;
  issuedAt: number;
};

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(
  session: Omit<PortalSession, "issuedAt">,
  secret: string,
  issuedAt: number = Date.now(),
): string {
  const payload = Buffer.from(JSON.stringify({ ...session, issuedAt })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): PortalSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PortalSession;
    if (typeof parsed?.userId !== "string" || typeof parsed?.subjectId !== "string") return null;
    if (parsed.role !== "coach" && parsed.role !== "klient") return null;
    if (typeof parsed?.issuedAt !== "number") return null;
    if (now - parsed.issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}
