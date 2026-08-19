import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import type { PortalRole } from "@/lib/portal/token";

/**
 * Demo-konton. Endast fiktiva uppgifter — inga verkliga användare.
 *
 * Lösenordet sätts med PORTAL_DEMO_PASSWORD. Saknas variabeln används
 * demolösenordet nedan så att live-demon aldrig blockeras.
 *
 * Ingen publik registrering finns. I en produktionsversion ersätts detta av
 * inbjudningsbaserad access: CVB skapar coachingrelationen och bjuder in klienten.
 */
const DEMO_FALLBACK_PASSWORD = "cvb-demo-2026";

export type PortalUser = {
  id: string;
  email: string;
  name: string;
  role: PortalRole;
  /** coachId för coacher, clientId för klienter. */
  subjectId: string;
};

const coachUsers: PortalUser[] = [
  {
    id: "user-carolina",
    email: "carolina@cvbcoaching.se",
    name: "Carolina von Braun",
    role: "coach",
    subjectId: "coach-cvb",
  },
];

const clientUsers: PortalUser[] = [
  {
    id: "user-emma",
    email: "emma@northlinestudio.se",
    name: "Emma Lind",
    role: "klient",
    subjectId: "klient-emma-lind",
  },
];

function expectedPassword(): string {
  const configured = process.env.PORTAL_DEMO_PASSWORD;
  return configured && configured.length > 0 ? configured : DEMO_FALLBACK_PASSWORD;
}

function constantTimeEquals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Autentiserar mot rätt kontolista. En klient kan aldrig logga in som coach. */
export function authenticate(email: string, password: string, role: PortalRole): PortalUser | null {
  const normalised = email.trim().toLowerCase();
  const pool = role === "coach" ? coachUsers : clientUsers;
  const user = pool.find((candidate) => candidate.email === normalised);
  const passwordOk = constantTimeEquals(password, expectedPassword());
  if (!user || !passwordOk) return null;
  return user;
}

/**
 * Demoledtråd som renderas server-side i inloggningsvyn så att demon går att
 * använda utan instruktion. Stäng av med PORTAL_SHOW_DEMO_HINT=false.
 * Värdet ingår aldrig i klientbundlen — det skickas som renderad text.
 */
export function demoHint(role: PortalRole): { email: string; password: string } | null {
  if (process.env.PORTAL_SHOW_DEMO_HINT === "false") return null;
  const user = role === "coach" ? coachUsers[0] : clientUsers[0];
  return { email: user.email, password: expectedPassword() };
}
