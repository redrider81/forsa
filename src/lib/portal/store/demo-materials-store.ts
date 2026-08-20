import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  EMPTY_DEMO_MATERIALS_STATE,
  fitMaterialsWithinCookie,
  normaliseDemoMaterialsState,
  type DemoMaterialsState,
} from "@/lib/portal/store/demo-materials-state";

export const DEMO_MATERIALS_COOKIE = "cvb_demo_materials";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const FALLBACK_SECRET = "cvb-demo-state-fallback-set-PORTAL_SESSION_SECRET";

function secret(): string {
  const configured = process.env.PORTAL_SESSION_SECRET;
  return configured && configured.length >= 16
    ? `${configured}:demo-materials`
    : `${FALLBACK_SECRET}:materials`;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeDemoMaterialsState(state: DemoMaterialsState): string {
  const payload = Buffer.from(JSON.stringify(fitMaterialsWithinCookie(state))).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeDemoMaterialsState(token: string | undefined): DemoMaterialsState {
  if (!token) return EMPTY_DEMO_MATERIALS_STATE;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return EMPTY_DEMO_MATERIALS_STATE;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return EMPTY_DEMO_MATERIALS_STATE;

  try {
    return normaliseDemoMaterialsState(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
  } catch {
    return EMPTY_DEMO_MATERIALS_STATE;
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

export async function readDemoMaterialsState(): Promise<DemoMaterialsState> {
  const store = await cookies();
  return decodeDemoMaterialsState(store.get(DEMO_MATERIALS_COOKIE)?.value);
}

export async function writeDemoMaterialsState(state: DemoMaterialsState): Promise<void> {
  const store = await cookies();
  store.set(DEMO_MATERIALS_COOKIE, encodeDemoMaterialsState(state), cookieOptions());
}

export async function updateDemoMaterialsState(
  mutate: (state: DemoMaterialsState) => DemoMaterialsState,
): Promise<DemoMaterialsState> {
  const next = normaliseDemoMaterialsState(mutate(await readDemoMaterialsState()));
  await writeDemoMaterialsState(next);
  return next;
}
