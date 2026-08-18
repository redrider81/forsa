import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Demo-konton. Endast fiktiva uppgifter — inga verkliga användare.
 * Lösenordet sätts med PORTAL_DEMO_PASSWORD. Saknas variabeln används
 * demolösenordet nedan så att live-demon aldrig blockeras.
 */
const DEMO_FALLBACK_PASSWORD = "cvb-demo-2026";

export type PortalUser = {
  id: string;
  email: string;
  name: string;
  coachId: string;
  role: "coach";
};

const users: PortalUser[] = [
  {
    id: "user-carolina",
    email: "carolina@cvbcoaching.se",
    name: "Carolina von Braun",
    coachId: "coach-cvb",
    role: "coach",
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

export function authenticate(email: string, password: string): PortalUser | null {
  const normalised = email.trim().toLowerCase();
  const user = users.find((candidate) => candidate.email === normalised);
  const passwordOk = constantTimeEquals(password, expectedPassword());
  if (!user || !passwordOk) return null;
  return user;
}

/**
 * Demoledtråd som renderas server-side i inloggningsvyn så att demon går att
 * använda utan instruktion. Stäng av med PORTAL_SHOW_DEMO_HINT=false.
 * Värdet ingår aldrig i klientbundlen — det skickas som renderad text.
 */
export function demoHint(): { email: string; password: string } | null {
  if (process.env.PORTAL_SHOW_DEMO_HINT === "false") return null;
  return { email: users[0].email, password: expectedPassword() };
}
