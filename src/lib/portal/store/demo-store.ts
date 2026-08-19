import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  EMPTY_DEMO_STATE,
  fitWithinCookie,
  normaliseDemoState,
  type DemoState,
} from "@/lib/portal/store/demo-state";

/**
 * Läser och skriver demo-state i en signerad httpOnly-cookie.
 * Se demo-state.ts för varför lagringen ser ut så här och vad den inte gör.
 */

export const DEMO_STATE_COOKIE = "cvb_demo_state";

/** Demoläget ska överleva utloggning, därför längre livslängd än sessionen. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const FALLBACK_SECRET = "cvb-demo-state-fallback-set-PORTAL_SESSION_SECRET";

function secret(): string {
  const configured = process.env.PORTAL_SESSION_SECRET;
  return configured && configured.length >= 16 ? `${configured}:demo-state` : FALLBACK_SECRET;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeDemoState(state: DemoState): string {
  const payload = Buffer.from(JSON.stringify(fitWithinCookie(state))).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeDemoState(token: string | undefined): DemoState {
  if (!token) return EMPTY_DEMO_STATE;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return EMPTY_DEMO_STATE;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return EMPTY_DEMO_STATE;

  try {
    return normaliseDemoState(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  } catch {
    return EMPTY_DEMO_STATE;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Läser aktuellt demoläge. Returnerar tomt tillstånd om cookien saknas. */
export async function readDemoState(): Promise<DemoState> {
  const store = await cookies();
  return decodeDemoState(store.get(DEMO_STATE_COOKIE)?.value);
}

/** Skriver demoläget. Får endast anropas från route handlers. */
export async function writeDemoState(state: DemoState): Promise<void> {
  const store = await cookies();
  store.set(DEMO_STATE_COOKIE, encodeDemoState(state), cookieOptions());
}

/** Nollställer demoläget till seed-datan. */
export async function clearDemoState(): Promise<void> {
  const store = await cookies();
  store.delete(DEMO_STATE_COOKIE);
}

/** Läser, muterar och skriver tillbaka i ett steg. */
export async function updateDemoState(
  mutate: (state: DemoState) => DemoState,
): Promise<DemoState> {
  const next = normaliseDemoState(mutate(await readDemoState()));
  await writeDemoState(next);
  return next;
}
