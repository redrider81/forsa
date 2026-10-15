import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * CVB-CR-20261015-01 — Client & Session Management.
 *
 * 1. The SQL contract, asserted against the migration itself (additive only,
 *    no booking/notification writes, grants).
 * 2. The email-correction orchestration and both routes, against an
 *    in-memory double of the documented RPC and Auth Admin contracts.
 * 3. Manual session registration: input shape, error mapping, route.
 *
 * The database behaviour itself (ownership, validation, identity link,
 * history, numbering, no booking rows) is verified in
 * tests/db/45_client_session_management.sql.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
}));

// ------------------------------------------------------------------ doubles

const COACH = "11111111-1111-4111-8111-111111111111";
const OTHER_COACH = "22222222-2222-4222-8222-222222222222";
const ANNA = "c0000000-0000-4000-8000-00000000000a"; // linked, confirmed account
const BO = "c0000000-0000-4000-8000-00000000000b"; // no account
const CILLA = "c0000000-0000-4000-8000-00000000000c"; // linked, unconfirmed account
const DORA = "c0000000-0000-4000-8000-00000000000d"; // other coach's client
const ANNA_USER = "aaaaaaaa-0000-4000-8000-000000000001";
const CILLA_USER = "cccccccc-0000-4000-8000-000000000003";

type ClientRow = { coach: string; name: string; initials: string; role: string; email: string; phone: string };
type UserRow = { email: string; confirmed: boolean; client: string };

class Store {
  clients: Record<string, ClientRow> = {};
  users: Record<string, UserRow> = {};
  profiles: Record<string, { email: string; name: string }> = {};
  sessions: Array<{ id: string; client: string; date: string; time: string; duration: number }> = [];
  adminCalls: string[] = [];
  coach = COACH;
  failUpdateRpc = false;
  failAdminUpdate: string | null = null;

  reset() {
    this.clients = {
      [ANNA]: { coach: COACH, name: "Anna Andersson", initials: "AA", role: "Vd", email: "anna@example.test", phone: "" },
      [BO]: { coach: COACH, name: "Bo Berg", initials: "BB", role: "Chef", email: "bo@example.test", phone: "070" },
      [CILLA]: { coach: COACH, name: "Cilla Ceder", initials: "CC", role: "Ledare", email: "cilla@example.test", phone: "" },
      [DORA]: { coach: OTHER_COACH, name: "Dora Dal", initials: "DD", role: "r", email: "dora@example.test", phone: "" },
    };
    this.users = {
      [ANNA_USER]: { email: "anna@example.test", confirmed: true, client: ANNA },
      [CILLA_USER]: { email: "cilla@example.test", confirmed: false, client: CILLA },
    };
    this.profiles = {
      [ANNA_USER]: { email: "anna@example.test", name: "Anna Andersson" },
      [CILLA_USER]: { email: "cilla@example.test", name: "Cilla Ceder" },
    };
    this.sessions = [];
    this.adminCalls = [];
    this.coach = COACH;
    this.failUpdateRpc = false;
    this.failAdminUpdate = null;
  }

  linkedUser(clientId: string): string | null {
    return Object.entries(this.users).find(([, u]) => u.client === clientId)?.[0] ?? null;
  }

  /** Mirrors coach_client_details_check. */
  check(args: Record<string, unknown>) {
    const id = args.p_client_id as string;
    const client = this.clients[id];
    if (!client || client.coach !== this.coach) throw new Error("CLIENT_NOT_FOUND");
    const name = String(args.p_name ?? "").trim();
    const role = String(args.p_role ?? "").trim();
    const email = String(args.p_email ?? "").trim().toLowerCase();
    if (!name) throw new Error("INVALID_NAME");
    if (!role) throw new Error("INVALID_ROLE");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("INVALID_EMAIL");
    const changed = client.email.trim().toLowerCase() !== email;
    const linked = this.linkedUser(id);
    if (changed) {
      const inUse =
        Object.entries(this.users).some(([uid, u]) => u.email.toLowerCase() === email && uid !== linked) ||
        Object.entries(this.clients).some(([cid, c]) => cid !== id && c.email.toLowerCase() === email);
      if (inUse) throw new Error("EMAIL_IN_USE");
    }
    return { email, changed, linked };
  }

  rpc(fn: string, args: Record<string, unknown> = {}) {
    try {
      if (fn === "begin_coach_client_update") {
        const plan = this.check(args);
        return {
          data: {
            email: plan.email,
            email_changed: plan.changed,
            auth_user_id: plan.linked,
            auth_user_confirmed: plan.linked ? this.users[plan.linked]!.confirmed : false,
          },
          error: null,
        };
      }
      if (fn === "update_coach_client_details") {
        if (this.failUpdateRpc) throw new Error("connection reset");
        const plan = this.check(args);
        if (plan.changed && plan.linked && this.users[plan.linked]!.email.toLowerCase() !== plan.email) {
          throw new Error("AUTH_EMAIL_NOT_SYNCED");
        }
        const client = this.clients[args.p_client_id as string]!;
        Object.assign(client, {
          name: String(args.p_name).trim(),
          initials: String(args.p_initials),
          role: String(args.p_role).trim(),
          email: plan.changed ? plan.email : client.email,
          phone: String(args.p_phone ?? "").trim(),
        });
        if (plan.linked) {
          this.profiles[plan.linked] = { email: client.email, name: client.name };
        }
        return { data: { email_changed: plan.changed }, error: null };
      }
      if (fn === "register_manual_coaching_session") {
        const id = args.p_client_id as string;
        if (!this.clients[id] || this.clients[id]!.coach !== this.coach) throw new Error("CLIENT_NOT_FOUND");
        const [sh, sm] = String(args.p_start_time).split(":").map(Number);
        const [eh, em] = String(args.p_end_time).split(":").map(Number);
        const duration = eh! * 60 + em! - (sh! * 60 + sm!);
        if (duration <= 0 || duration > 480) throw new Error("INVALID_INTERVAL");
        const sessionId = `sess-${this.sessions.length + 1}`;
        this.sessions.push({ id: sessionId, client: id, date: String(args.p_date), time: String(args.p_start_time), duration });
        return { data: sessionId, error: null };
      }
      throw new Error(`unexpected rpc ${fn}`);
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  }
}

const store = new Store();
const db = { rpc: async (fn: string, args?: Record<string, unknown>) => store.rpc(fn, args) };

const admin = {
  auth: {
    admin: {
      getUserById: async (id: string) => {
        store.adminCalls.push(`get:${id}`);
        const user = store.users[id];
        return user ? { data: { user: { id, email: user.email } }, error: null } : { data: { user: null }, error: { message: "not found" } };
      },
      updateUserById: async (id: string, attributes: { email: string; email_confirm?: boolean }) => {
        store.adminCalls.push(`update:${id}:${attributes.email}:${attributes.email_confirm ?? "-"}`);
        if (store.failAdminUpdate) return { data: { user: null }, error: { message: "fail", code: store.failAdminUpdate } };
        const user = store.users[id]!;
        user.email = attributes.email;
        if (attributes.email_confirm) user.confirmed = true;
        return { data: { user: { id, email: user.email } }, error: null };
      },
    },
  },
};

let adminClient: typeof admin | null = admin;

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn(async () => db) }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: vi.fn(() => adminClient) }));
vi.mock("@/lib/portal/session", () => ({ readCoachSession: vi.fn(), readClientSession: vi.fn() }));

import { readCoachSession } from "@/lib/portal/session";
import {
  ADMIN_UNAVAILABLE_ERROR,
  mapClientDetailsError,
  parseClientDetailsInput,
  updateClientDetails,
} from "@/lib/portal/client-details";
import { mapManualSessionError, parseManualSessionInput, registerManualSession } from "@/lib/portal/manual-session";
import { POST as detailsRoute } from "@/app/api/portal/klienter/[clientId]/uppgifter/route";
import { POST as sessionRoute } from "@/app/api/portal/klienter/[clientId]/sessioner/route";
import ClientDetailsEditor from "@/components/portal/client-details-editor";
import ManualSessionForm from "@/components/portal/manual-session-form";

const input = (overrides: Partial<{ name: string; role: string; email: string; phone: string }> = {}) => ({
  name: "Anna Andersson",
  role: "Vd",
  email: "anna@example.test",
  phone: "",
  ...overrides,
});
const deps = () => ({ db, admin: adminClient });
const signedIn = () => vi.mocked(readCoachSession).mockResolvedValue({ userId: "u", name: "Carolina", coachId: COACH });
const post = (body: unknown) =>
  new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const params = (clientId: string) => ({ params: Promise.resolve({ clientId }) });

beforeEach(() => {
  store.reset();
  adminClient = admin;
});
afterEach(() => {
  vi.mocked(readCoachSession).mockReset();
});

// ------------------------------------------------------------------ 1. SQL contract

const migration = readFileSync(
  new URL("../supabase/migrations/20261015180000_cvb_base_client_session_management.sql", import.meta.url),
  "utf8",
);
const sql = migration
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .toLowerCase();

describe("SQL-kontrakt: CVB-CR-20261015-01", () => {
  it("är additiv: inga tabell-, kolumn-, policy- eller dataändringar i schemat", () => {
    expect(sql).not.toMatch(/\b(create|alter|drop)\s+table\b/);
    expect(sql).not.toMatch(/\b(create|alter|drop)\s+policy\b/);
    expect(sql).not.toMatch(/\bdrop\s+function\b/);
    expect(sql).not.toMatch(/\bdelete\s+from\b/);
    expect(sql).not.toMatch(/\btruncate\b/);
  });

  it("skriver bara klientrad, profil och sessionsrad — aldrig bokningar, utskick eller auth.users", () => {
    const writes = [...sql.matchAll(/\b(insert\s+into|update)\s+([a-z_.]+)/g)].map((m) => m[2]);
    expect(new Set(writes)).toEqual(new Set(["public.clients", "public.profiles", "public.sessions"]));
    expect(sql).not.toMatch(/session_booking_requests|public_booking_requests|_notifications\b/);
  });

  it("registrerar manuella sessioner som genomförda och refuserar framtida", () => {
    expect(sql).toContain("values (p_client_id, v_next_number, p_date, p_start_time, v_duration, 'genomford')");
    expect(sql).toContain("raise exception 'session_in_future'");
    expect(sql).toContain("raise exception 'session_overlap'");
  });

  it("kopplar aldrig om identiteten och vägrar osynkad e-post", () => {
    const profileSets = [...sql.matchAll(/update\s+public\.profiles\s+set([\s\S]*?)\bwhere\b/g)].map((m) => m[1]);
    expect(profileSets.length).toBe(1);
    expect(profileSets[0]).not.toMatch(/\b(id|client_id|role|coach_id)\s*=/);
    expect(sql).toContain("raise exception 'auth_email_not_synced'");
  });

  it("ger endast authenticated rätt att köra RPC:erna; den delade kontrollen är intern", () => {
    for (const fn of ["begin_coach_client_update", "update_coach_client_details", "register_manual_coaching_session"]) {
      expect(sql).toMatch(new RegExp(`revoke execute on function public\\.${fn}\\([^)]*\\) from public, anon;`));
      expect(sql).toMatch(new RegExp(`grant execute on function public\\.${fn}\\([^)]*\\) to authenticated;`));
    }
    expect(sql).toMatch(/revoke execute on function public\.coach_client_details_check\([^)]*\) from public, anon, authenticated;/);
    expect(sql.match(/security definer/g)?.length).toBe(4);
    expect(sql.match(/set search_path = ''/g)?.length).toBe(4);
  });
});

// ------------------------------------------------------------------ 2. client details

describe("Klientuppgifter: orkestrering", () => {
  it("sparar uppgifter för en klient utan konto utan att röra Auth", async () => {
    const outcome = await updateClientDetails(BO, input({ name: "Bo Bergström", role: "Vd", email: "BO.NY@example.test", phone: "071" }), deps());
    expect(outcome).toEqual({ ok: true, emailChanged: true });
    expect(store.clients[BO]).toMatchObject({ name: "Bo Bergström", initials: "BB", email: "bo.ny@example.test", phone: "071" });
    expect(store.adminCalls).toEqual([]);
  });

  it("namnbyte utan adressändring rör inte kontot men följer med till profilen", async () => {
    const outcome = await updateClientDetails(ANNA, input({ name: "Anna Lind" }), deps());
    expect(outcome).toEqual({ ok: true, emailChanged: false });
    expect(store.adminCalls).toEqual([]);
    expect(store.profiles[ANNA_USER]).toEqual({ email: "anna@example.test", name: "Anna Lind" });
    expect(store.clients[ANNA]!.initials).toBe("AL");
  });

  it("korrigerar e-post för ett bekräftat konto: samma konto, bekräftelse behålls, profil följer", async () => {
    const outcome = await updateClientDetails(ANNA, input({ email: "anna.ny@example.test" }), deps());
    expect(outcome).toEqual({ ok: true, emailChanged: true });
    expect(store.adminCalls).toEqual([`get:${ANNA_USER}`, `update:${ANNA_USER}:anna.ny@example.test:true`]);
    expect(store.users[ANNA_USER]).toEqual({ email: "anna.ny@example.test", confirmed: true, client: ANNA });
    expect(store.clients[ANNA]!.email).toBe("anna.ny@example.test");
    expect(store.profiles[ANNA_USER]!.email).toBe("anna.ny@example.test");
  });

  it("bekräftar inte ett obekräftat konto vid adresskorrigering", async () => {
    await updateClientDetails(CILLA, input({ name: "Cilla Ceder", role: "Ledare", email: "cilla.ny@example.test" }), deps());
    expect(store.adminCalls).toContain(`update:${CILLA_USER}:cilla.ny@example.test:-`);
    expect(store.users[CILLA_USER]!.confirmed).toBe(false);
  });

  it("hoppar över Auth-uppdateringen om kontot redan bär den nya adressen", async () => {
    store.users[ANNA_USER]!.email = "anna.ny@example.test";
    const outcome = await updateClientDetails(ANNA, input({ email: "anna.ny@example.test" }), deps());
    expect(outcome.ok).toBe(true);
    expect(store.adminCalls).toEqual([`get:${ANNA_USER}`]);
  });

  it("återställer kontots adress om den avslutande skrivningen misslyckas", async () => {
    store.failUpdateRpc = true;
    const outcome = await updateClientDetails(ANNA, input({ email: "anna.ny@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "UNKNOWN", httpStatus: 502 });
    expect(store.users[ANNA_USER]!.email).toBe("anna@example.test");
    expect(store.clients[ANNA]!.email).toBe("anna@example.test");
    expect(store.adminCalls.at(-1)).toBe(`update:${ANNA_USER}:anna@example.test:-`);
  });

  it("vägrar adresser som redan används, utan att röra kontot", async () => {
    const outcome = await updateClientDetails(ANNA, input({ email: "bo@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "EMAIL_IN_USE", httpStatus: 409 });
    expect(store.adminCalls).toEqual([]);
    expect(store.clients[ANNA]!.email).toBe("anna@example.test");
  });

  it("översätter Auth-konflikten email_exists till EMAIL_IN_USE och skriver inget", async () => {
    store.failAdminUpdate = "email_exists";
    const outcome = await updateClientDetails(ANNA, input({ email: "upptagen@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "EMAIL_IN_USE" });
    expect(store.clients[ANNA]!.email).toBe("anna@example.test");
  });

  it("kräver Admin-klienten bara när ett kopplat konto ska få ny adress", async () => {
    adminClient = null;
    const linked = await updateClientDetails(ANNA, input({ email: "anna.ny@example.test" }), deps());
    expect(linked).toEqual({ ok: false, httpStatus: 503, code: "ADMIN_UNAVAILABLE", error: ADMIN_UNAVAILABLE_ERROR });
    expect(store.clients[ANNA]!.email).toBe("anna@example.test");

    const nameOnly = await updateClientDetails(ANNA, input({ name: "Anna Lind" }), deps());
    expect(nameOnly.ok).toBe(true);
    const unlinked = await updateClientDetails(BO, input({ name: "Bo Berg", role: "Chef", email: "bo2@example.test" }), deps());
    expect(unlinked.ok).toBe(true);
  });

  it("annan coach når inte klienten", async () => {
    store.coach = OTHER_COACH;
    const outcome = await updateClientDetails(ANNA, input({ email: "anna.ny@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "CLIENT_NOT_FOUND", httpStatus: 404 });
    expect(store.adminCalls).toEqual([]);
  });

  it("mappar databaskoder till svenska meddelanden", () => {
    expect(mapClientDetailsError("INVALID_EMAIL").httpStatus).toBe(422);
    expect(mapClientDetailsError("P0001: INVITATION_IN_PROGRESS").code).toBe("INVITATION_IN_PROGRESS");
    expect(mapClientDetailsError(undefined)).toMatchObject({ code: "UNKNOWN", httpStatus: 502 });
  });

  it("kontrollerar indatats form", () => {
    expect(parseClientDetailsInput({ name: " A ", role: "r", email: " a@b.se ", phone: undefined })).toEqual({
      name: "A",
      role: "r",
      email: "a@b.se",
      phone: "",
    });
    expect(parseClientDetailsInput({ name: "A", role: "r" })).toBeNull();
    expect(parseClientDetailsInput(null)).toBeNull();
  });
});

describe("Klientuppgifter: route", () => {
  it("kräver coachsession", async () => {
    vi.mocked(readCoachSession).mockResolvedValue(null);
    const response = await detailsRoute(post(input()), params(ANNA));
    expect(response.status).toBe(401);
    expect(store.clients[ANNA]!.email).toBe("anna@example.test");
  });

  it("avvisar ogiltigt klient-id och ogiltig kropp", async () => {
    signedIn();
    expect((await detailsRoute(post(input()), params("inte-ett-id"))).status).toBe(404);
    expect((await detailsRoute(post({ name: "x" }), params(ANNA))).status).toBe(400);
  });

  it("sparar och returnerar resultatet", async () => {
    signedIn();
    const response = await detailsRoute(post(input({ email: "anna.ny@example.test" })), params(ANNA));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, emailChanged: true });
    expect(store.users[ANNA_USER]!.email).toBe("anna.ny@example.test");
  });
});

// ------------------------------------------------------------------ 3. manual session

describe("Manuell session", () => {
  it("kontrollerar indatats form", () => {
    expect(parseManualSessionInput({ date: "2026-10-01", startTime: "09:00", endTime: "10:15" })).toEqual({
      date: "2026-10-01",
      startTime: "09:00",
      endTime: "10:15",
    });
    for (const bad of [
      { date: "1/10/2026", startTime: "09:00", endTime: "10:00" },
      { date: "2026-10-01", startTime: "9:00", endTime: "10:00" },
      { date: "2026-10-01", startTime: "09:00" },
      null,
    ]) {
      expect(parseManualSessionInput(bad)).toBeNull();
    }
  });

  it("registrerar via RPC:n och returnerar sessionens id", async () => {
    const outcome = await registerManualSession(BO, { date: "2026-10-01", startTime: "09:00", endTime: "10:15" }, { db });
    expect(outcome).toEqual({ ok: true, sessionId: "sess-1" });
    expect(store.sessions).toEqual([{ id: "sess-1", client: BO, date: "2026-10-01", time: "09:00", duration: 75 }]);
  });

  it("mappar databaskoder till svenska meddelanden", () => {
    expect(mapManualSessionError("INVALID_INTERVAL")).toMatchObject({ code: "INVALID_INTERVAL", httpStatus: 422 });
    expect(mapManualSessionError("SESSION_IN_FUTURE").httpStatus).toBe(422);
    expect(mapManualSessionError("SESSION_OVERLAP").httpStatus).toBe(409);
    expect(mapManualSessionError("CLIENT_NOT_FOUND").httpStatus).toBe(404);
    expect(mapManualSessionError("boom")).toMatchObject({ code: "UNKNOWN", httpStatus: 502 });
  });

  it("route: kräver coachsession, avvisar ogiltiga tider, registrerar giltiga", async () => {
    vi.mocked(readCoachSession).mockResolvedValue(null);
    expect((await sessionRoute(post({ date: "2026-10-01", startTime: "09:00", endTime: "10:00" }), params(BO))).status).toBe(401);

    signedIn();
    expect((await sessionRoute(post({ date: "2026-10-01", startTime: "09:00" }), params(BO))).status).toBe(400);
    const refused = await sessionRoute(post({ date: "2026-10-01", startTime: "10:00", endTime: "09:00" }), params(BO));
    expect(refused.status).toBe(422);
    expect(store.sessions).toEqual([]);

    const response = await sessionRoute(post({ date: "2026-10-01", startTime: "09:00", endTime: "10:00" }), params(BO));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, sessionId: "sess-1" });
  });

  it("varken modul eller route når e-postlagret", () => {
    for (const file of [
      "../src/lib/portal/manual-session.ts",
      "../src/app/api/portal/klienter/[clientId]/sessioner/route.ts",
      "../src/lib/portal/client-details.ts",
      "../src/app/api/portal/klienter/[clientId]/uppgifter/route.ts",
    ]) {
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(source).not.toMatch(/@\/lib\/email|resend|booking-notifications/i);
    }
  });
});

// ------------------------------------------------------------------ 4. client view

describe("Klientvyn", () => {
  it("visar klientens uppgifter med redigeringsknapp", () => {
    const html = renderToStaticMarkup(
      createElement(ClientDetailsEditor, {
        clientId: ANNA,
        details: { name: "Anna Andersson", role: "Vd", email: "anna@example.test", phone: "" },
        hasAccount: true,
      }),
    );
    expect(html).toContain("Redigera uppgifter");
    expect(html).toContain("anna@example.test");
    expect(html).toContain("Anna Andersson");
  });

  it("visar Lägg till session", () => {
    const html = renderToStaticMarkup(createElement(ManualSessionForm, { clientId: ANNA }));
    expect(html).toContain("Lägg till session");
  });

  it("klientvyn placerar båda funktionerna under den aktuella klienten", () => {
    const page = readFileSync(new URL("../src/app/cvb-base/klienter/[clientId]/page.tsx", import.meta.url), "utf8");
    expect(page).toContain("<ClientDetailsEditor");
    expect(page).toContain("clientId={client.id}");
    const sessionsPanel = page.slice(page.indexOf('label="Sessioner"'));
    expect(sessionsPanel.indexOf("<ManualSessionForm clientId={client.id} />")).toBeGreaterThan(-1);
    expect(sessionsPanel.indexOf("<ManualSessionForm")).toBeLessThan(sessionsPanel.indexOf("dossier.sessions"));
  });
});
