import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken as signToken,
  verifySessionToken as verifyToken,
  type PortalSession,
} from "@/lib/portal/token";

export type { PortalSession };

export const SESSION_COOKIE = "cvb_portal_session";

/**
 * Hemligheten läses enbart server-side och ingår aldrig i klientbundlen.
 * PORTAL_SESSION_SECRET ska sättas i Vercel. Saknas den används en tydligt
 * märkt reservhemlighet så att live-demon aldrig blockeras — den måste vara
 * stabil, eftersom sessionen annars inte kan verifieras mellan instanser.
 */
const FALLBACK_SECRET = "cvb-portal-demo-fallback-secret-set-PORTAL_SESSION_SECRET";

let warned = false;

function sessionSecret(): string {
  const configured = process.env.PORTAL_SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;

  if (!warned) {
    warned = true;
    console.warn(
      "[CVB Coaching] PORTAL_SESSION_SECRET saknas - anvander reservhemlighet. Satt variabeln i Vercel infor live-demo.",
    );
  }
  return FALLBACK_SECRET;
}

export function createSessionToken(session: Omit<PortalSession, "issuedAt">): string {
  return signToken(session, sessionSecret());
}

export function verifySessionToken(token: string | undefined): PortalSession | null {
  return verifyToken(token, sessionSecret());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/** Läser och verifierar sessionen från cookien. Returnerar null om ogiltig. */
export async function readSession(): Promise<PortalSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export type CoachSession = { userId: string; name: string; coachId: string };
export type ClientSession = { userId: string; name: string; clientId: string };

/**
 * Coachsession. En klientsession ger aldrig coachåtkomst — rollen kommer från
 * den signerade token och kan inte sättas från klienten.
 */
export async function readCoachSession(): Promise<CoachSession | null> {
  const session = await readSession();
  if (!session || session.role !== "coach") return null;
  return { userId: session.userId, name: session.name, coachId: session.subjectId };
}

/** Klientsession. Ger endast åtkomst till den egna coachingrelationen. */
export async function readClientSession(): Promise<ClientSession | null> {
  const session = await readSession();
  if (!session || session.role !== "klient") return null;
  return { userId: session.userId, name: session.name, clientId: session.subjectId };
}
