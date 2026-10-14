import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Technical faults are reported as faults (P2-03, P2-04, 2026-10-14):
 * - sign-in separates wrong credentials, a database fault and an account
 *   without portal access — without revealing which accounts exist;
 * - a failed profile read is not a signed-out session;
 * - the calendar's availability page separates a read error from a coach
 *   who has no booking settings.
 */

type Result = { data: unknown; error: { message: string; status?: number; code?: string } | null };

const state: {
  signIn: Result;
  user: { id: string } | null;
  profile: Result;
  settings: Result;
  rules: Result;
  signOut: ReturnType<typeof vi.fn>;
} = {
  signIn: { data: { user: { id: "u1" } }, error: null },
  user: { id: "u1" },
  profile: { data: null, error: null },
  settings: { data: null, error: null },
  rules: { data: [], error: null },
  signOut: vi.fn(async () => ({ error: null })),
};

function chain(final: () => Result) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    maybeSingle: async () => final(),
    single: async () => final(),
    then(resolve: (value: Result) => unknown) {
      return Promise.resolve(final()).then(resolve);
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: async () => state.signIn,
      getUser: async () => ({ data: { user: state.user }, error: state.user ? null : { message: "no session" } }),
      signOut: state.signOut,
    },
    from: (table: string) => {
      if (table === "profiles") return chain(() => state.profile);
      if (table === "coach_booking_settings") return chain(() => state.settings);
      if (table === "coach_availability_rules") return chain(() => state.rules);
      return chain(() => ({ data: [], error: null }));
    },
  })),
}));

import { POST as login } from "@/app/api/portal/auth/login/route";
import { readCoachSession, readClientSession } from "@/lib/portal/session";
import { getBookingSettings, listAvailabilityRules } from "@/lib/portal/availability";
import { PortalDataError } from "@/lib/portal/data-errors";

const COACH_PROFILE = { id: "u1", role: "coach", coach_id: "coach-1", client_id: null, email: "c@example.test", name: "Coach" };
const DB_ERROR = { message: "permission denied for table profiles", code: "42501" };

function loginRequest(email = `user-${Math.random()}@example.test`) {
  return new Request("http://localhost/api/portal/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, password: "hemligt", role: "coach" }),
  });
}

beforeEach(() => {
  state.signIn = { data: { user: { id: "u1" } }, error: null };
  state.user = { id: "u1" };
  state.profile = { data: COACH_PROFILE, error: null };
  state.settings = { data: null, error: null };
  state.rules = { data: [], error: null };
  state.signOut.mockClear();
});

describe("sign-in", () => {
  it("correct credentials and a coach profile sign in", async () => {
    const response = await login(loginRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, role: "coach" });
  });

  it("wrong credentials: 401 with the credentials message", async () => {
    state.signIn = { data: { user: null }, error: { message: "Invalid login credentials", status: 400, code: "invalid_credentials" } };
    const response = await login(loginRequest());
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("Fel e-postadress eller lösenord.");
  });

  it("an Auth outage is not presented as a wrong password", async () => {
    state.signIn = { data: { user: null }, error: { message: "upstream", status: 500 } };
    const response = await login(loginRequest());
    expect(response.status).toBe(503);
    expect((await response.json()).error).not.toMatch(/lösenord/);
  });

  it("a failed profile read is a technical fault, and the half-open session is ended", async () => {
    state.profile = { data: null, error: DB_ERROR };
    const response = await login(loginRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).not.toMatch(/lösenord/);
    expect(JSON.stringify(body)).not.toContain("permission denied");
    expect(state.signOut).toHaveBeenCalled();
  });

  it("an account without a portal profile gets the same answer as wrong credentials", async () => {
    state.profile = { data: null, error: null };
    const response = await login(loginRequest());
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("Fel e-postadress eller lösenord.");
    expect(state.signOut).toHaveBeenCalled();
  });

  it("a client account cannot sign in to the coach portal, same answer", async () => {
    state.profile = { data: { ...COACH_PROFILE, role: "klient", coach_id: null, client_id: "client-1" }, error: null };
    const response = await login(loginRequest());
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("Fel e-postadress eller lösenord.");
  });
});

describe("session read", () => {
  it("no signed-in user is a signed-out session", async () => {
    state.user = null;
    expect(await readCoachSession()).toBeNull();
  });

  it("a user without a profile is a signed-out session", async () => {
    state.profile = { data: null, error: null };
    expect(await readCoachSession()).toBeNull();
  });

  it("a failed profile read throws instead of looking signed out", async () => {
    state.profile = { data: null, error: DB_ERROR };
    await expect(readCoachSession()).rejects.toBeInstanceOf(PortalDataError);
    await expect(readClientSession()).rejects.toBeInstanceOf(PortalDataError);
  });
});

describe("calendar availability", () => {
  it("a coach without booking settings gets null", async () => {
    expect(await getBookingSettings("coach-1")).toBeNull();
  });

  it("a settings read error throws instead of rendering an empty page", async () => {
    state.settings = { data: null, error: { message: "permission denied for table coach_booking_settings" } };
    await expect(getBookingSettings("coach-1")).rejects.toBeInstanceOf(PortalDataError);
  });

  it("a rules read error throws instead of showing no availability", async () => {
    state.rules = { data: null, error: { message: "permission denied for table coach_availability_rules" } };
    await expect(listAvailabilityRules()).rejects.toBeInstanceOf(PortalDataError);
  });
});
