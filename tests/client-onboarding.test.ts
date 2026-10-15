import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Secure client onboarding: trusted identity linkage, invitation and
 * first-time activation.
 *
 * Four layers:
 *
 * 1. The SQL contract, asserted against the migration itself (trigger reads
 *    only trusted app metadata, never re-links, conflict codes, no write
 *    policies, no anon access).
 * 2. Pure rules: link origin, validity, email content, activation input.
 * 3. The invitation orchestration and both routes, against an in-memory
 *    double that implements the documented RPC and Auth Admin contracts.
 * 4. The coach panel rendered for each state.
 *
 * The same migration and the real Supabase Auth flow (GoTrue v2.195.0) were
 * also exercised end to end against an isolated local Supabase stack.
 */

const afterQueue: Array<() => Promise<void> | void> = [];
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => Promise<void> | void) => {
    afterQueue.push(task);
  },
}));
async function flushAfter() {
  while (afterQueue.length) await afterQueue.shift()!();
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
}));

// ------------------------------------------------------------------ doubles

const COACH = "11111111-1111-4111-8111-111111111111";
const OTHER_COACH = "22222222-2222-4222-8222-222222222222";
const ANNA = "c0000000-0000-4000-8000-00000000000a";
const BO = "c0000000-0000-4000-8000-00000000000b";
const ENDED = "c0000000-0000-4000-8000-00000000000c";
const DUPLICATE = "c0000000-0000-4000-8000-00000000000d";

type AuthUser = { id: string; email: string; confirmed: boolean; appMeta: Record<string, unknown> };
type Invitation = {
  status: "pending" | "sent" | "failed";
  attempt_count: number;
  last_attempt_at: number;
  auth_user_id: string | null;
  activated_at: string | null;
  last_error_code: string | null;
};

class Store {
  clients: Record<string, { coach: string; email: string; name: string; status: "aktiv" | "avslutad" }> = {
    [ANNA]: { coach: COACH, email: "Anna@Example.test", name: "Anna Andersson", status: "aktiv" },
    [BO]: { coach: OTHER_COACH, email: "bo@example.test", name: "Bo Berg", status: "aktiv" },
    [ENDED]: { coach: COACH, email: "ended@example.test", name: "Eva Ended", status: "avslutad" },
    [DUPLICATE]: { coach: COACH, email: "anna@example.test", name: "Anna Dubblett", status: "aktiv" },
  };
  users: AuthUser[] = [];
  /** auth user id -> client id (profiles) */
  profiles: Record<string, string> = {};
  invitations: Record<string, Invitation> = {};
  currentCoach: string | null = COACH;
  rpcCalls: string[] = [];
  adminCalls: string[] = [];
  tokens: Record<string, { userId: string; type: string }> = {};
  seq = 0;

  reset() {
    Object.assign(this, new Store());
  }

  owned(clientId: string) {
    return this.currentCoach !== null && this.clients[clientId]?.coach === this.currentCoach;
  }

  /** Mirrors begin_client_invitation() in 20261012120000. */
  begin(clientId: string) {
    if (!this.currentCoach) return { error: "NOT_COACH" };
    if (!this.owned(clientId)) return { error: "CLIENT_NOT_FOUND" };
    const client = this.clients[clientId];
    if (client.status !== "aktiv") return { error: "CLIENT_NOT_ACTIVE" };
    const email = client.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "INVALID_EMAIL" };
    const linkedId = Object.keys(this.profiles).find((id) => this.profiles[id] === clientId) ?? null;
    const linked = linkedId ? this.users.find((u) => u.id === linkedId)! : null;
    const emailUser = this.users.find((u) => u.email === email) ?? null;
    const invitation = this.invitations[clientId];
    if (linked) {
      if (invitation?.activated_at || (!invitation && linked.confirmed)) return { error: "ALREADY_ACTIVATED" };
      if (linked.email !== email) return { error: "LINKED_EMAIL_MISMATCH" };
    } else if (emailUser) {
      return { error: this.profiles[emailUser.id] ? "EMAIL_IN_USE" : "EMAIL_UNLINKED_ACCOUNT" };
    }
    if (invitation) {
      if (invitation.status === "pending" && invitation.last_attempt_at > Date.now() - 120_000) {
        return { error: "INVITATION_IN_PROGRESS" };
      }
      if (invitation.status === "sent" && invitation.last_attempt_at > Date.now() - 60_000) {
        return { error: "INVITATION_RECENTLY_SENT" };
      }
      Object.assign(invitation, {
        status: "pending",
        attempt_count: invitation.attempt_count + 1,
        last_attempt_at: Date.now(),
        auth_user_id: linkedId ?? invitation.auth_user_id,
        last_error_code: null,
      });
    } else {
      this.invitations[clientId] = {
        status: "pending",
        attempt_count: 1,
        last_attempt_at: Date.now(),
        auth_user_id: linkedId,
        activated_at: null,
        last_error_code: null,
      };
    }
    return {
      data: {
        recipient_email: email,
        client_name: client.name,
        auth_user_id: linkedId,
        auth_user_confirmed: linked?.confirmed ?? false,
        attempt: this.invitations[clientId].attempt_count,
      },
    };
  }

  /** Mirrors record_client_invitation_result(). */
  record(args: Record<string, unknown>) {
    const clientId = String(args.p_client_id);
    if (!this.owned(clientId)) return { error: "CLIENT_NOT_FOUND" };
    if (args.p_auth_user_id && this.profiles[String(args.p_auth_user_id)] !== clientId) return { error: "IDENTITY_MISMATCH" };
    const invitation = this.invitations[clientId];
    if (invitation?.status === "pending") {
      invitation.status = args.p_status as "sent" | "failed";
      invitation.auth_user_id = (args.p_auth_user_id as string) ?? invitation.auth_user_id;
      invitation.last_error_code = args.p_status === "failed" ? String(args.p_error_code) : null;
    }
    return {};
  }

  /** Mirrors GoTrue createUser + the handle_new_auth_user trigger. */
  createUser(attributes: { email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown> }) {
    this.adminCalls.push("createUser");
    if (this.users.some((u) => u.email === attributes.email)) {
      return { data: { user: null }, error: { message: "already registered", code: "email_exists" } };
    }
    const subject = String(attributes.app_metadata.portal_subject_id);
    if (attributes.app_metadata.portal_role !== "klient" || this.clients[subject]?.status !== "aktiv" || Object.values(this.profiles).includes(subject)) {
      return { data: { user: null }, error: { message: "Database error creating new user", code: "unexpected_failure" } };
    }
    const user = { id: `user-${++this.seq}`, email: attributes.email, confirmed: false, appMeta: attributes.app_metadata };
    this.users.push(user);
    this.profiles[user.id] = subject;
    return { data: { user: { id: user.id } }, error: null };
  }

  generateLink(params: { type: string; email: string }) {
    this.adminCalls.push(`generateLink:${params.type}`);
    const user = this.users.find((u) => u.email === params.email);
    if (!user) return { data: { user: null, properties: null }, error: { message: "not found", code: "user_not_found" } };
    if (params.type === "invite" && user.confirmed) {
      return { data: { user: null, properties: null }, error: { message: "already registered", code: "email_exists" } };
    }
    const token = `${(++this.seq).toString(16).padStart(8, "0")}${"ab".repeat(24)}`;
    this.tokens[token] = { userId: user.id, type: params.type };
    return { data: { user: { id: user.id }, properties: { hashed_token: token } }, error: null };
  }
}

const store = new Store();

const db = {
  rpc: async (name: string, args: Record<string, unknown> = {}) => {
    store.rpcCalls.push(name);
    const result =
      name === "begin_client_invitation"
        ? store.begin(String(args.p_client_id))
        : name === "record_client_invitation_result"
          ? store.record(args)
          : (() => {
              throw new Error(`Oväntat RPC-anrop i test: ${name}`);
            })();
    return "error" in result && result.error
      ? { data: null, error: { message: String(result.error) } }
      : { data: ("data" in result ? result.data : null) ?? null, error: null };
  },
};

const admin = {
  auth: {
    admin: {
      createUser: async (attributes: Parameters<Store["createUser"]>[0]) => store.createUser(attributes),
      generateLink: async (params: { type: "invite" | "recovery"; email: string }) => store.generateLink(params),
    },
  },
};

type Sent = { to: string; subject: string; body: string; idempotencyKey: string };
let sent: Sent[] = [];
let providerFails = false;
const provider = {
  send: async (payload: Sent & { from: string }) => {
    if (providerFails) throw Object.assign(new Error("Resend nere"), { code: "provider_down" });
    sent.push(payload);
    return { id: `msg-${sent.length}` };
  },
};

const config = { origin: "https://cvbcoaching.se", validHours: 24, from: "CVB Coaching <x@cvbcoaching.se>", replyTo: "c@cvbcoaching.se" };

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => serverClient),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => admin),
}));
vi.mock("@/lib/portal/session", () => ({
  readCoachSession: vi.fn(),
  readClientSession: vi.fn(),
}));
vi.mock("@/lib/email/booking-provider", () => ({
  createResendBookingProvider: vi.fn(() => provider),
}));

// The activation route's server client: verifyOtp / profiles / updateUser.
let serverClient: Record<string, unknown> = db;

import { readCoachSession } from "@/lib/portal/session";
import {
  buildActivationUrl,
  CANONICAL_ORIGIN,
  mapBeginError,
  parsePortalAccess,
  resolveInvitationConfig,
  resolveInvitationOrigin,
  resolveValidHours,
  sendClientInvitation,
} from "@/lib/portal/client-invitations";
import { buildClientInvitationEmail } from "@/lib/email/client-invitation-email";
import { isValidTokenHash, parseActivationFragment, passwordProblem } from "@/lib/portal/activation";
import { POST as inviteRoute } from "@/app/api/portal/klienter/[clientId]/inbjudan/route";
import { POST as activateRoute } from "@/app/api/portal/auth/aktivera/route";
import { POST as recoveryRoute } from "@/app/api/portal/auth/aterstall/route";
import { normalizeRecoveryEmail, sendClientPasswordReset, type RecoveryAdmin } from "@/lib/portal/password-recovery";
import { buildClientPasswordResetEmail } from "@/lib/email/client-password-reset-email";
import ClientAccessPanel, { type ClientAccessView } from "@/components/portal/client-access-panel";

const deps = () => ({ db, admin, provider, config });
const env = (values: Record<string, string>) => values as unknown as NodeJS.ProcessEnv;

beforeEach(() => {
  store.reset();
  sent = [];
  providerFails = false;
  serverClient = db;
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(readCoachSession).mockReset();
});

// ------------------------------------------------------------------ 1. SQL contract

const migration = readFileSync(
  new URL("../supabase/migrations/20261012120000_cvb_base_client_invitations.sql", import.meta.url),
  "utf8",
);
const triggerBody = migration.slice(
  migration.indexOf("create or replace function public.handle_new_auth_user()"),
  migration.indexOf("revoke execute on function public.handle_new_auth_user()"),
);

describe("SQL-kontrakt: betrodd identitetskoppling", () => {
  it("läser roll och subjekt endast från raw_app_meta_data", () => {
    expect(triggerBody).toContain("new.raw_app_meta_data ->> 'portal_role'");
    expect(triggerBody).toContain("new.raw_app_meta_data ->> 'portal_subject_id'");
    expect(triggerBody).not.toMatch(/raw_user_meta_data\s*->>\s*'portal_(role|subject_id)'/);
  });

  it("kopplar aldrig om ett konto som redan har en profil", () => {
    const guard = triggerBody.indexOf("if exists (select 1 from public.profiles where id = new.id)");
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(triggerBody.indexOf("insert into public.profiles"));
  });

  it("validerar subjektet och låter ogiltiga länkar misslyckas", () => {
    expect(triggerBody).toContain("raise exception 'handle_new_auth_user: invalid portal_role'");
    expect(triggerBody).toContain("where id = v_subject_id and status = 'aktiv'");
    expect(triggerBody).toContain("from public.coaches where id = v_subject_id");
    expect(triggerBody).toContain("set search_path = ''");
  });

  it("körs även när app_metadata skrivs efter INSERT (GoTrue)", () => {
    expect(migration).toMatch(/after insert or update of raw_app_meta_data on auth\.users/);
  });

  it("har inga skrivpolicyer på ledgern och ingen anon-åtkomst", () => {
    expect(migration).not.toMatch(/on public\.client_invitations\s+for (insert|update|delete|all)/);
    for (const fn of ["begin_client_invitation", "record_client_invitation_result", "client_portal_access", "mark_own_client_invitation_activated"]) {
      expect(migration).toMatch(new RegExp(`revoke execute on function public\\.${fn}\\([^)]*\\) from public, anon;`));
    }
  });

  it("vägrar varje konflikterande identitet i stället för att reparera", () => {
    for (const code of ["ALREADY_ACTIVATED", "LINKED_EMAIL_MISMATCH", "EMAIL_IN_USE", "EMAIL_UNLINKED_ACCOUNT", "CLIENT_NOT_ACTIVE", "INVITATION_IN_PROGRESS"]) {
      expect(migration).toContain(`raise exception '${code}'`);
    }
    expect(migration).toContain("select * into v_client from public.clients where id = p_client_id for update;");
  });

  it("lagrar aldrig token, länk eller lösenord", () => {
    const table = migration.slice(migration.indexOf("create table public.client_invitations"), migration.indexOf("create index client_invitations"));
    expect(table).not.toMatch(/token|password|link|url/i);
  });
});

// ------------------------------------------------------------------ 2. pure rules

describe("länkens origin och giltighet", () => {
  it("använder alltid den kanoniska domänen i produktion", () => {
    expect(resolveInvitationOrigin(env({ VERCEL_ENV: "production", PORTAL_INVITATION_ORIGIN: "https://evil.example" }))).toBe(CANONICAL_ORIGIN);
  });

  it("kräver uttrycklig origin utanför produktion och nekar okrypterade externa adresser", () => {
    expect(resolveInvitationOrigin(env({}))).toBeNull();
    expect(resolveInvitationOrigin(env({ PORTAL_INVITATION_ORIGIN: "http://evil.example" }))).toBeNull();
    expect(resolveInvitationOrigin(env({ PORTAL_INVITATION_ORIGIN: "http://localhost:3100/x" }))).toBe("http://localhost:3100");
  });

  it("kräver giltighet 1–24 timmar", () => {
    expect(resolveValidHours(env({}))).toBeNull();
    expect(resolveValidHours(env({ PORTAL_INVITATION_VALID_HOURS: "0" }))).toBeNull();
    expect(resolveValidHours(env({ PORTAL_INVITATION_VALID_HOURS: "48" }))).toBeNull();
    expect(resolveValidHours(env({ PORTAL_INVITATION_VALID_HOURS: "24" }))).toBe(24);
  });

  it("ger ingen simulerad framgång när e-post är avstängd, och ignorerar fångstkatalog i produktionsbygge", () => {
    const base = { VERCEL_ENV: "production", PORTAL_INVITATION_VALID_HOURS: "24", NODE_ENV: "production" };
    expect(resolveInvitationConfig(env({ ...base, EMAIL_SEND_ENABLED: "false" }))).toEqual({ ok: false, reason: "email_disabled" });
    expect(resolveInvitationConfig(env({ ...base, PORTAL_EMAIL_CAPTURE_DIR: "/tmp/x" }))).toEqual({ ok: false, reason: "email_disabled" });
    expect(resolveInvitationConfig(env({ ...base, EMAIL_SEND_ENABLED: "true", EMAIL_FROM: "CVB <a@b.se>" })).ok).toBe(true);
  });

  it("lägger token i fragmentet, aldrig i query", () => {
    const url = buildActivationUrl(CANONICAL_ORIGIN, "ab".repeat(28), "invite");
    expect(url).toBe(`https://cvbcoaching.se/klient-aktivera#aktivera-invite-${"ab".repeat(28)}`);
    expect(new URL(url).search).toBe("");
  });

  it("fragmentet är en giltig CSS-selektor (root-layouten kör querySelector på det)", () => {
    const hash = new URL(buildActivationUrl(CANONICAL_ORIGIN, `0${"ab".repeat(28)}`, "recovery")).hash;
    expect(hash).toMatch(/^#[a-zA-Z][a-zA-Z0-9-]*$/);
  });
});

describe("inbjudningsmejlet", () => {
  const email = buildClientInvitationEmail({
    clientName: "Anna Andersson",
    activationUrl: "https://cvbcoaching.se/klient-aktivera#aktivera-invite-abc",
    validHours: 24,
    loginUrl: "https://cvbcoaching.se/klient-login",
  });

  it("förklarar avsändare, vad CVB Base är, varför, hur, giltighet, utgång och kontakt", () => {
    expect(email.subject).toBe("Din inbjudan till CVB Base");
    expect(email.body).toContain("Hej Anna,");
    expect(email.body).toContain("Välkommen till CvB Base, din personliga klientportal hos CvB Coaching!");
    expect(email.body).toContain("aktivera ditt konto och välja ditt lösenord:");
    expect(email.body).toContain("https://cvbcoaching.se/klient-aktivera#aktivera-invite-abc");
    expect(email.body).toContain("Länken är giltig i ett dygn och kan bara användas en gång.");
    expect(email.body).toContain("”Glömt lösenord?” på https://cvbcoaching.se/klient-login");
    expect(email.body).toContain("så hjälper jag dig");
    expect(email.body).toContain("carolina@cvbcoaching.se");
    expect(email.body).toMatch(/Carolina von Braun\nCvB Coaching$/);
  });

  it("innehåller inget lösenord och inget efternamn", () => {
    expect(email.body).not.toMatch(/lösenord:[ \t]*\S/i);
    expect(email.body).not.toContain("Andersson");
  });
});

describe("aktiveringsindata", () => {
  it("validerar token, typ och fragment", () => {
    expect(isValidTokenHash("ab".repeat(28))).toBe(true);
    expect(isValidTokenHash("<script>")).toBe(false);
    expect(parseActivationFragment(`#aktivera-invite-${"ab".repeat(28)}`)).toEqual({ tokenHash: "ab".repeat(28), type: "invite" });
    expect(parseActivationFragment(`#aktivera-signup-${"ab".repeat(28)}`)).toBeNull();
    expect(parseActivationFragment(`#aktivera-invite-xyz`)).toBeNull();
    expect(parseActivationFragment("")).toBeNull();
  });

  it("kräver ett rimligt lösenord", () => {
    expect(passwordProblem("")).toBe("Ange ett lösenord.");
    expect(passwordProblem("kort")).toMatch(/minst 10 tecken/);
    expect(passwordProblem(" mellanslag-runt ")).toMatch(/mellanslag/);
    expect(passwordProblem("å".repeat(40))).toMatch(/för långt/);
    expect(passwordProblem("ett-bra-lösenord")).toBeNull();
  });
});

// ------------------------------------------------------------------ 3. orchestration and routes

describe("inbjudan: orkestrering", () => {
  it("ny klient: skapar konto via betrodd app_metadata, invite-länk, mejl och status sent", async () => {
    const outcome = await sendClientInvitation(ANNA, deps());
    expect(outcome).toEqual({ ok: true, status: "sent" });
    const user = store.users[0];
    expect(user.email).toBe("anna@example.test");
    expect(user.appMeta).toEqual({ portal_role: "klient", portal_subject_id: ANNA });
    expect(store.profiles[user.id]).toBe(ANNA);
    expect(store.adminCalls).toEqual(["createUser", "generateLink:invite"]);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("anna@example.test");
    expect(sent[0].body).toMatch(/https:\/\/cvbcoaching\.se\/klient-aktivera#aktivera-invite-[a-f0-9]+\s/);
    expect(store.invitations[ANNA]).toMatchObject({ status: "sent", auth_user_id: user.id, activated_at: null });
  });

  it("dubbelklick: andra försöket stoppas utan nytt konto eller mejl", async () => {
    await sendClientInvitation(ANNA, deps());
    const second = await sendClientInvitation(ANNA, deps());
    expect(second).toMatchObject({ ok: false, code: "INVITATION_RECENTLY_SENT", httpStatus: 429 });
    expect(store.users).toHaveLength(1);
    expect(sent).toHaveLength(1);
  });

  it("omsändning: återanvänder kontot, ny länk, ingen ny profil", async () => {
    await sendClientInvitation(ANNA, deps());
    store.invitations[ANNA].last_attempt_at -= 120_000;
    const again = await sendClientInvitation(ANNA, deps());
    expect(again.ok).toBe(true);
    expect(store.users).toHaveLength(1);
    expect(Object.keys(store.profiles)).toHaveLength(1);
    expect(store.adminCalls).toEqual(["createUser", "generateLink:invite", "generateLink:invite"]);
    expect(sent[1].body).not.toBe(sent[0].body);
    expect(store.invitations[ANNA].attempt_count).toBe(2);
  });

  it("bekräftat konto utan slutförd aktivering får recovery-länk", async () => {
    await sendClientInvitation(ANNA, deps());
    store.users[0].confirmed = true;
    store.invitations[ANNA].last_attempt_at -= 120_000;
    expect((await sendClientInvitation(ANNA, deps())).ok).toBe(true);
    expect(store.adminCalls.at(-1)).toBe("generateLink:recovery");
    expect(sent[1].body).toContain("#aktivera-recovery-");
  });

  it("redan aktiverat konto: ingen ny inbjudan", async () => {
    await sendClientInvitation(ANNA, deps());
    store.invitations[ANNA].activated_at = new Date().toISOString();
    store.invitations[ANNA].last_attempt_at -= 120_000;
    const outcome = await sendClientInvitation(ANNA, deps());
    expect(outcome).toMatchObject({ ok: false, code: "ALREADY_ACTIVATED" });
    expect(sent).toHaveLength(1);
  });

  it("leveransfel: status failed med kopplat konto, säker omförsök utan dubblettkonto", async () => {
    providerFails = true;
    const failed = await sendClientInvitation(ANNA, deps());
    expect(failed).toMatchObject({ ok: false, httpStatus: 502 });
    expect(store.invitations[ANNA]).toMatchObject({ status: "failed", last_error_code: "provider_down" });
    expect(store.invitations[ANNA].auth_user_id).toBe(store.users[0].id);

    providerFails = false;
    const retry = await sendClientInvitation(ANNA, deps());
    expect(retry.ok).toBe(true);
    expect(store.users).toHaveLength(1);
    expect(store.adminCalls.filter((c) => c === "createUser")).toHaveLength(1);
  });

  it("kontot finns redan på annan klient: vägras, flyttas aldrig", async () => {
    await sendClientInvitation(ANNA, deps());
    const conflict = await sendClientInvitation(DUPLICATE, deps());
    expect(conflict).toMatchObject({ ok: false, code: "EMAIL_IN_USE", httpStatus: 409 });
    expect(store.profiles[store.users[0].id]).toBe(ANNA);
    expect(store.adminCalls).toEqual(["createUser", "generateLink:invite"]);
  });

  it("okopplat befintligt konto: vägras, adopteras aldrig", async () => {
    store.users.push({ id: "orphan", email: "anna@example.test", confirmed: true, appMeta: {} });
    const outcome = await sendClientInvitation(ANNA, deps());
    expect(outcome).toMatchObject({ ok: false, code: "EMAIL_UNLINKED_ACCOUNT" });
    expect(store.profiles.orphan).toBeUndefined();
    expect(store.adminCalls).toEqual([]);
  });

  it("annan coachs klient och avslutad klient: vägras innan något skapas", async () => {
    expect(await sendClientInvitation(BO, deps())).toMatchObject({ ok: false, code: "CLIENT_NOT_FOUND", httpStatus: 404 });
    expect(await sendClientInvitation(ENDED, deps())).toMatchObject({ ok: false, code: "CLIENT_NOT_ACTIVE" });
    expect(store.adminCalls).toEqual([]);
  });

  it("klientsession (ingen coach) kan inte bjuda in", async () => {
    store.currentCoach = null;
    expect(await sendClientInvitation(ANNA, deps())).toMatchObject({ ok: false, code: "NOT_COACH", httpStatus: 401 });
    expect(store.adminCalls).toEqual([]);
  });

  it("felkoder mappas till svenska meddelanden", () => {
    expect(mapBeginError("ERROR: EMAIL_IN_USE").error).toMatch(/flyttas inte automatiskt/);
    expect(mapBeginError("något annat").code).toBe("UNKNOWN");
  });
});

describe("inbjudningsrouten", () => {
  const params = (clientId: string) => ({ params: Promise.resolve({ clientId }) });

  it("nekar utan coachsession", async () => {
    vi.mocked(readCoachSession).mockResolvedValue(null);
    const response = await inviteRoute(new Request("http://x", { method: "POST" }), params(ANNA));
    expect(response.status).toBe(401);
    expect(store.rpcCalls).toEqual([]);
  });

  it("saknad konfiguration: 503 innan något provisioneras", async () => {
    vi.mocked(readCoachSession).mockResolvedValue({ userId: "u", name: "C", coachId: COACH });
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PORTAL_INVITATION_VALID_HOURS", "");
    const response = await inviteRoute(new Request("http://x", { method: "POST" }), params(ANNA));
    expect(response.status).toBe(503);
    expect(store.rpcCalls).toEqual([]);
    expect(store.adminCalls).toEqual([]);
  });

  it("skickar med kanonisk domän oavsett Host-header", async () => {
    vi.mocked(readCoachSession).mockResolvedValue({ userId: "u", name: "C", coachId: COACH });
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PORTAL_INVITATION_VALID_HOURS", "24");
    vi.stubEnv("EMAIL_SEND_ENABLED", "true");
    vi.stubEnv("EMAIL_FROM", "CVB Coaching <x@cvbcoaching.se>");
    const request = new Request("http://evil.example/api", { method: "POST", headers: { host: "evil.example" } });
    const response = await inviteRoute(request, params(ANNA));
    expect(response.status).toBe(200);
    expect(sent[0].body).toContain("https://cvbcoaching.se/klient-aktivera#");
    expect(sent[0].body).not.toContain("evil.example");
  });
});

describe("aktiveringsrouten", () => {
  const TOKEN = "ab".repeat(28);
  type Calls = string[];
  function client(opts: { verifyError?: string; role?: "klient" | "coach"; passwordError?: string }, calls: Calls) {
    return {
      auth: {
        verifyOtp: async (args: { type: string; token_hash: string }) => {
          calls.push(`verifyOtp:${args.type}`);
          return opts.verifyError
            ? { data: { user: null, session: null }, error: { message: opts.verifyError, code: "otp_expired" } }
            : { data: { user: { id: "user-1" }, session: { access_token: "x" } }, error: null };
        },
        updateUser: async () => {
          calls.push("updateUser");
          return { error: opts.passwordError ? { message: opts.passwordError, code: "weak_password" } : null };
        },
        signOut: async (options?: { scope?: string }) => {
          calls.push(options?.scope ? `signOut:${options.scope}` : "signOut");
          return { error: null };
        },
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: opts.role ? { role: opts.role, client_id: opts.role === "klient" ? ANNA : null } : null }),
          }),
        }),
      }),
      rpc: async (name: string) => {
        calls.push(`rpc:${name}`);
        return { error: null };
      },
    };
  }
  const post = (body: unknown) =>
    activateRoute(new Request("http://x/api/portal/auth/aktivera", { method: "POST", body: JSON.stringify(body) }));

  it("ogiltig token eller typ: avvisas utan att Supabase anropas", async () => {
    const calls: Calls = [];
    serverClient = client({ role: "klient" }, calls);
    expect((await post({ tokenHash: "x", type: "invite", password: "ett-bra-lösenord" })).status).toBe(400);
    expect((await post({ tokenHash: TOKEN, type: "signup", password: "ett-bra-lösenord" })).status).toBe(400);
    expect(calls).toEqual([]);
  });

  it("svagt lösenord stoppas innan token förbrukas", async () => {
    const calls: Calls = [];
    serverClient = client({ role: "klient" }, calls);
    const response = await post({ tokenHash: TOKEN, type: "invite", password: "kort" });
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  it("utgången eller redan använd länk ger tydligt svenskt fel", async () => {
    const calls: Calls = [];
    serverClient = client({ verifyError: "Email link is invalid or has expired" }, calls);
    const response = await post({ tokenHash: TOKEN, type: "invite", password: "ett-bra-lösenord" });
    expect(response.status).toBe(400);
    expect(((await response.json()) as { error: string }).error).toMatch(/gått ut eller redan använts/);
    expect(calls).toEqual(["verifyOtp:invite"]);
  });

  it("konto utan klientprofil loggas ut och får inget lösenord satt", async () => {
    const calls: Calls = [];
    serverClient = client({ role: "coach" }, calls);
    expect((await post({ tokenHash: TOKEN, type: "invite", password: "ett-bra-lösenord" })).status).toBe(403);
    expect(calls).toEqual(["verifyOtp:invite", "signOut"]);
  });

  it("lyckad aktivering: verifierar, sätter lösenord och registrerar aktiveringen", async () => {
    const calls: Calls = [];
    serverClient = client({ role: "klient" }, calls);
    const response = await post({ tokenHash: TOKEN, type: "recovery", password: "ett-bra-lösenord" });
    expect(response.status).toBe(200);
    expect(calls).toEqual(["verifyOtp:recovery", "updateUser", "signOut:others", "rpc:mark_own_client_invitation_activated"]);
  });

  it("lösenordet avvisas av Supabase: loggas ut, markeras inte aktiverat", async () => {
    const calls: Calls = [];
    serverClient = client({ role: "klient", passwordError: "weak" }, calls);
    expect((await post({ tokenHash: TOKEN, type: "invite", password: "ett-bra-lösenord" })).status).toBe(400);
    expect(calls).toEqual(["verifyOtp:invite", "updateUser", "signOut"]);
  });
});

// ------------------------------------------------------------------ 4. coach panel

describe("kontopanelen", () => {
  const base: ClientAccessView = {
    state: "not_invited",
    recipientEmail: null,
    lastAttemptAt: null,
    providerAcceptedAt: null,
    activatedAt: null,
    pendingStale: false,
  };
  const render = (access: Partial<ClientAccessView>, clientActive = true) =>
    renderToStaticMarkup(createElement(ClientAccessPanel, { clientId: ANNA, clientActive, access: { ...base, ...access } }));

  it("visar varje status med rätt åtgärd", () => {
    expect(render({})).toContain("EJ INBJUDEN");
    expect(render({})).toContain("Skicka inbjudan");
    const sentHtml = render({ state: "sent", providerAcceptedAt: "2026-10-12T10:00:00Z", recipientEmail: "anna@example.test" });
    expect(sentHtml).toContain("INBJUDAN SKICKAD");
    expect(sentHtml).toContain("inte att klienten har fått eller öppnat");
    expect(sentHtml).toContain("Skicka ny inbjudan");
    expect(render({ state: "failed" })).toContain("LEVERANS MISSLYCKADES");
    expect(render({ state: "pending" })).not.toContain("<button");
    expect(render({ state: "pending", pendingStale: true })).toContain("Skicka ny inbjudan");
  });

  it("aktiverat konto och avslutad klient har ingen inbjudningsknapp", () => {
    const activated = render({ state: "activated", activatedAt: "2026-10-12T10:00:00Z" });
    expect(activated).toContain("AKTIVERAT");
    expect(activated).not.toContain("<button");
    const ended = render({}, false);
    expect(ended).not.toContain("<button");
    expect(ended).toContain("Klienten är avslutad");
  });

  it("tolkar status från databasen strikt", () => {
    expect(parsePortalAccess({ state: "hacked" })).toBeNull();
    expect(parsePortalAccess({ state: "sent", has_account: true, attempt_count: 2 })).toMatchObject({ state: "sent", hasAccount: true, attemptCount: 2 });
  });
});

// ------------------------------------------------------------------ 5. session refresh scope

describe("sessionsförnyelse (proxy)", () => {
  const proxySource = readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8");

  it("körs bara för portalen, inte för den publika webbplatsen", async () => {
    const { config: proxyConfig } = await import("@/proxy");
    expect(proxyConfig.matcher).toContain("/cvb-base/:path*");
    expect(proxyConfig.matcher).toContain("/klient/:path*");
    expect(proxyConfig.matcher).toContain("/api/portal/:path*");
    for (const path of proxyConfig.matcher) {
      expect(path).not.toBe("/");
      expect(path).not.toMatch(/^\/(om-oss|kontakt|coaching|en|villkor|integritet)/);
    }
  });

  it("förnyar sessionen men fattar inga behörighetsbeslut", () => {
    expect(proxySource).toContain("await supabase.auth.getClaims();");
    expect(proxySource).not.toMatch(/redirect|rewrite|profiles/);
  });
});

// ------------------------------------------------------------------ 6. password recovery

describe("Glömt lösenord: SQL-kontrakt", () => {
  const fn = migration.slice(
    migration.indexOf("create or replace function public.client_recovery_target"),
    migration.indexOf("grant execute on function public.client_recovery_target"),
  );

  it("bara service role, bara klientkonton, högst en länk per minut", () => {
    expect(migration).toContain("revoke execute on function public.client_recovery_target(text) from public, anon, authenticated;");
    expect(migration).toContain("grant execute on function public.client_recovery_target(text) to service_role;");
    expect(fn).toContain("p.role = 'klient'");
    expect(fn).toContain("u.recovery_sent_at < now() - interval '60 seconds'");
    expect(fn).toContain("set search_path = ''");
  });

  it("migrationen är upprepningsbar", () => {
    expect(migration).toContain("create table if not exists public.client_invitations");
    expect(migration).toContain("drop policy if exists client_invitations_select_coach");
    expect(migration).toContain("drop trigger if exists on_auth_user_created on auth.users;");
    expect(migration).not.toMatch(/^create (table|index|policy) (?!if not exists)(?!client_invitations_select_coach)/m);
  });
});

describe("Glömt lösenord: orkestrering", () => {
  const TARGET = "user-77";
  function recoveryAdmin(target: string | null, linkUser = TARGET) {
    const calls: string[] = [];
    const admin: RecoveryAdmin = {
      rpc: async (fn, args) => {
        calls.push(`${fn}:${args.p_email}`);
        return { data: target, error: null };
      },
      auth: {
        admin: {
          generateLink: async ({ type }) => {
            calls.push(`generateLink:${type}`);
            return { data: { user: { id: linkUser }, properties: { hashed_token: "cd".repeat(28) } }, error: null };
          },
        },
      },
    };
    return { admin, calls };
  }

  it("normaliserar och validerar adressen", () => {
    expect(normalizeRecoveryEmail("  Anna@Example.TEST ")).toBe("anna@example.test");
    expect(normalizeRecoveryEmail("inte-en-adress")).toBeNull();
    expect(normalizeRecoveryEmail({ role: "coach" })).toBeNull();
  });

  it("klientkonto: recovery-länk med kanonisk domän och token i fragmentet", async () => {
    const { admin, calls } = recoveryAdmin(TARGET);
    expect(await sendClientPasswordReset("anna@example.test", { admin, provider, config })).toBe("sent");
    expect(calls).toEqual(["client_recovery_target:anna@example.test", "generateLink:recovery"]);
    expect(sent[0].to).toBe("anna@example.test");
    expect(sent[0].body).toContain(`https://cvbcoaching.se/klient-nytt-losenord#aktivera-recovery-${"cd".repeat(28)}`);
    expect(sent[0].idempotencyKey).toMatch(/^cvb-client-recovery\/user-77\/\d+$/);
  });

  it("okänd adress, coach eller strypt konto: ingen länk skapas och inget skickas", async () => {
    const { admin, calls } = recoveryAdmin(null);
    expect(await sendClientPasswordReset("okand@example.test", { admin, provider, config })).toBe("skipped");
    expect(calls).toEqual(["client_recovery_target:okand@example.test"]);
    expect(sent).toHaveLength(0);
  });

  it("länken avser ett annat konto: skickas inte", async () => {
    const { admin } = recoveryAdmin(TARGET, "someone-else");
    expect(await sendClientPasswordReset("anna@example.test", { admin, provider, config })).toBe("failed");
    expect(sent).toHaveLength(0);
  });

  it("leveransfel rapporteras utan token i loggen", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    providerFails = true;
    const { admin } = recoveryAdmin(TARGET);
    expect(await sendClientPasswordReset("anna@example.test", { admin, provider, config })).toBe("failed");
    expect(JSON.stringify(spy.mock.calls)).not.toContain("cd".repeat(28));
    spy.mockRestore();
  });

  it("mejlet är på svenska, utan coachinginnehåll och utan lösenord", () => {
    const email = buildClientPasswordResetEmail({
      resetUrl: "https://cvbcoaching.se/klient-nytt-losenord#aktivera-recovery-abc",
      validHours: 24,
      loginUrl: "https://cvbcoaching.se/klient-login",
    });
    expect(email.subject).toBe("Återställ ditt lösenord till CVB Base");
    expect(email.body).toContain("Länken gäller i ett dygn och kan bara användas en gång.");
    expect(email.body).toContain("Om det inte var du som begärde detta");
    expect(email.body).not.toMatch(/lösenord:\s*\S/i);
  });
});

describe("Glömt lösenord: routen", () => {
  const post = (body: unknown, ip = "10.0.0.1") =>
    recoveryRoute(
      new Request("http://x/api/portal/auth/aterstall", {
        method: "POST",
        headers: { "x-forwarded-for": ip },
        body: JSON.stringify(body),
      }),
    );

  beforeEach(() => {
    afterQueue.length = 0;
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PORTAL_INVITATION_VALID_HOURS", "24");
    vi.stubEnv("EMAIL_SEND_ENABLED", "true");
    vi.stubEnv("EMAIL_FROM", "CVB Coaching <x@cvbcoaching.se>");
  });

  it("samma svar för registrerad och okänd adress, arbetet sker efter svaret", async () => {
    (admin as unknown as { rpc: unknown }).rpc = async (_fn: string, args: { p_email: string }) => ({
      data: args.p_email === "anna@example.test" ? "user-1" : null,
      error: null,
    });
    store.users.push({ id: "user-1", email: "anna@example.test", confirmed: true, appMeta: {} });

    const known = await post({ email: "anna@example.test" }, "10.0.0.2");
    const unknown = await post({ email: "okand@example.test" }, "10.0.0.3");
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(await known.json()).toEqual(await unknown.json());
    expect(sent).toHaveLength(0);

    await flushAfter();
    expect(sent.map((m) => m.to)).toEqual(["anna@example.test"]);
  });

  it("rollen eller klient-id i begäran ignoreras", async () => {
    const calls: string[] = [];
    (admin as unknown as { rpc: unknown }).rpc = async (fn: string, args: Record<string, unknown>) => {
      calls.push(`${fn}:${JSON.stringify(args)}`);
      return { data: null, error: null };
    };
    await post({ email: "x@example.test", role: "coach", clientId: ANNA }, "10.0.0.4");
    await flushAfter();
    expect(calls).toEqual(['client_recovery_target:{"p_email":"x@example.test"}']);
  });

  it("ogiltig adress avvisas, och för många försök från samma IP ger 429", async () => {
    expect((await post({ email: "nej" }, "10.0.0.5")).status).toBe(400);
    for (let i = 0; i < 5; i += 1) expect((await post({ email: `a${i}@example.test` }, "10.0.0.6")).status).toBe(200);
    expect((await post({ email: "a9@example.test" }, "10.0.0.6")).status).toBe(429);
  });
});
