import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * CVB-CR-20261021-01 — two faults found when the FAQs were checked against
 * the system.
 *
 * A. Session summary: Carolina could only approve a summary produced by the
 *    AI assistant (which needs the client's article 9 consent). The draft
 *    from the meeting workspace and a summary she writes herself now open as
 *    editable drafts and are approved through the same route.
 * B. The client's own email change under Profil now follows into her sign-in
 *    account and profile, with the same guarantee as Carolina's correction.
 *
 * The database behaviour of B is verified in
 * tests/db/47_own_profile_email_sync.sql.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
}));

// ------------------------------------------------------------------ doubles (B)

const CLIENT = "c0000000-0000-4000-8000-00000000000a";
const OTHER = "c0000000-0000-4000-8000-00000000000b";
const USER = "aaaaaaaa-0000-4000-8000-000000000001";
const OTHER_USER = "bbbbbbbb-0000-4000-8000-000000000002";

type ClientRow = { name: string; role: string; email: string; phone: string };

class Store {
  clients: Record<string, ClientRow> = {};
  users: Record<string, { email: string; confirmed: boolean }> = {};
  profiles: Record<string, { email: string; name: string }> = {};
  adminCalls: string[] = [];
  signedIn: string | null = USER;
  failUpdateRpc = false;
  failAdminUpdate: string | null = null;

  reset() {
    this.clients = {
      [CLIENT]: { name: "Anna Andersson", role: "Vd", email: "anna@example.test", phone: "" },
      [OTHER]: { name: "Bo Berg", role: "Chef", email: "bo@example.test", phone: "" },
    };
    this.users = {
      [USER]: { email: "anna@example.test", confirmed: true },
      [OTHER_USER]: { email: "bo@example.test", confirmed: true },
    };
    this.profiles = {
      [USER]: { email: "anna@example.test", name: "Anna Andersson" },
      [OTHER_USER]: { email: "bo@example.test", name: "Bo Berg" },
    };
    this.adminCalls = [];
    this.signedIn = USER;
    this.failUpdateRpc = false;
    this.failAdminUpdate = null;
  }

  /** Mirrors own_client_profile_check for the signed-in client. */
  check(args: Record<string, unknown>) {
    if (this.signedIn !== USER) throw new Error("NOT_CLIENT");
    const client = this.clients[CLIENT]!;
    const email = String(args.p_email ?? "").trim().toLowerCase();
    if (!String(args.p_name ?? "").trim()) throw new Error("INVALID_NAME");
    if (!String(args.p_role ?? "").trim()) throw new Error("INVALID_ROLE");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("INVALID_EMAIL");
    const changed = client.email.toLowerCase() !== email;
    if (changed) {
      const inUse =
        Object.entries(this.users).some(([uid, u]) => uid !== USER && u.email.toLowerCase() === email) ||
        Object.entries(this.clients).some(([cid, c]) => cid !== CLIENT && c.email.toLowerCase() === email);
      if (inUse) throw new Error("EMAIL_IN_USE");
    }
    return { email, changed };
  }

  rpc(fn: string, args: Record<string, unknown> = {}) {
    try {
      if (fn === "begin_own_client_profile_update") {
        const plan = this.check(args);
        return {
          data: {
            email: plan.email,
            email_changed: plan.changed,
            auth_user_id: USER,
            auth_user_confirmed: this.users[USER]!.confirmed,
          },
          error: null,
        };
      }
      if (fn === "update_own_client_profile") {
        if (this.failUpdateRpc) throw new Error("connection reset");
        const plan = this.check(args);
        if (plan.changed && this.users[USER]!.email.toLowerCase() !== plan.email) {
          throw new Error("AUTH_EMAIL_NOT_SYNCED");
        }
        const client = this.clients[CLIENT]!;
        Object.assign(client, {
          name: String(args.p_name).trim(),
          role: String(args.p_role).trim(),
          email: plan.changed ? plan.email : client.email,
          phone: String(args.p_phone ?? "").trim(),
        });
        this.profiles[USER] = { email: client.email, name: client.name };
        return { data: null, error: null };
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
        return user
          ? { data: { user: { id, email: user.email } }, error: null }
          : { data: { user: null }, error: { message: "not found" } };
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

import { readClientSession } from "@/lib/portal/session";
import { mapOwnProfileError, OWN_EMAIL_ADMIN_UNAVAILABLE_ERROR, updateOwnProfile } from "@/lib/portal/own-profile";
import { POST as profileRoute } from "@/app/api/klient/profil/route";
import { hasSessionSummaryContent, parseSessionSummaryDraft } from "@/lib/portal/session-summary";
import {
  EMPTY_SESSION_SUMMARY_TEMPLATE,
  SESSION_SUMMARY_SECTIONS,
  serializeSessionSummaryDraft,
  type SessionSummaryDraftFields,
} from "@/lib/portal/session-summary-draft";
import SessionWorkspace from "@/components/portal/session-workspace";
import { coachFaqCategories as coachFaq } from "@/components/portal/coach-faq-content";
import { faqCategories as clientFaq } from "@/components/klient/faq-content";

const input = (overrides: Partial<{ name: string; role: string; email: string; phone: string }> = {}) => ({
  name: "Anna Andersson",
  role: "Vd",
  email: "anna@example.test",
  phone: "",
  ...overrides,
});
const deps = () => ({ db, admin: adminClient });
const post = (body: unknown) =>
  new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const signedIn = () =>
  vi.mocked(readClientSession).mockResolvedValue({ userId: USER, name: "Anna", clientId: CLIENT } as never);

beforeEach(() => {
  store.reset();
  adminClient = admin;
});
afterEach(() => {
  vi.mocked(readClientSession).mockReset();
});

// ------------------------------------------------------------------ A. summary format

const fullSummary: SessionSummaryDraftFields = {
  focus: "Ledarskap i ny roll\nHur hon fördelar ansvar.",
  insights: ["Jag behöver låta teamet äga sina beslut.", "Klientens insikt: tid är ett val"],
  awareness: "Hon ser nu när hon tar tillbaka ansvar.",
  newPerspectives: ["Att avstå är också ett beslut"],
  commitments: ["Boka styrelsemötet innan fredag."],
  followUp: ["Hur gick delegeringen?"],
  possibleNextFocus: "Vad som händer om hon faktiskt avstår.",
};

describe("Sammanfattningsutkast: format", () => {
  it("serialisering och tolkning är varandras omvända (AK5)", () => {
    expect(parseSessionSummaryDraft(serializeSessionSummaryDraft(fullSummary))).toEqual(fullSummary);
  });

  it("tolkar ett utkast från mötesläget utan fokus och nya perspektiv", () => {
    const fromMeeting: SessionSummaryDraftFields = {
      focus: "",
      insights: ["Insikt ett"],
      awareness: "Ökad tydlighet",
      newPerspectives: [],
      commitments: ["Åtagande ett"],
      followUp: [],
      possibleNextFocus: "Nästa fokus",
    };
    const parsed = parseSessionSummaryDraft(serializeSessionSummaryDraft(fromMeeting));
    expect(parsed).toEqual(fromMeeting);
    expect(hasSessionSummaryContent(parsed)).toBe(true);
  });

  it("behåller en kort rad som bara ser ut som en rubrik i sitt avsnitt", () => {
    const parsed = parseSessionSummaryDraft("Ökad medvetenhet\nTid för reflektion\nMöjligt nästa fokus\nRollen");
    expect(parsed.awareness).toBe("Tid för reflektion");
    expect(parsed.possibleNextFocus).toBe("Rollen");
  });

  it("hoppar fortfarande över AI-stödets övriga kända avsnitt", () => {
    const parsed = parseSessionSummaryDraft("Ökad medvetenhet\nTydligare.\nOsäkerheter\nUnderlaget är tunt.");
    expect(parsed.awareness).toBe("Tydligare.");
  });

  it("mallen har de sju rubrikerna och saknar innehåll att godkänna", () => {
    for (const section of SESSION_SUMMARY_SECTIONS) {
      expect(EMPTY_SESSION_SUMMARY_TEMPLATE).toContain(section.heading);
    }
    expect(hasSessionSummaryContent(parseSessionSummaryDraft(EMPTY_SESSION_SUMMARY_TEMPLATE))).toBe(false);
  });

  it("en ifylld mall går att godkänna", () => {
    const filled = EMPTY_SESSION_SUMMARY_TEMPLATE.replace("Klientens åtaganden", "Klientens åtaganden\n- Ringa styrelsen");
    const parsed = parseSessionSummaryDraft(filled);
    expect(parsed.commitments).toEqual(["Ringa styrelsen"]);
    expect(hasSessionSummaryContent(parsed)).toBe(true);
  });
});

// ------------------------------------------------------------------ A. workspace

describe("Sessionsvyn: utkast och manuell väg", () => {
  const base = { clientId: CLIENT, sessionId: "s1", clientName: "Anna Andersson", clientFirstName: "Anna" };

  it("öppnar ett ej godkänt utkast från mötesläget som utkast som kan godkännas (AK1)", () => {
    const html = renderToStaticMarkup(
      createElement(SessionWorkspace, { ...base, initialDraft: serializeSessionSummaryDraft(fullSummary) }),
    );
    expect(html).toContain("Utkast · ej godkänt");
    expect(html).toContain("Godkänn och dela");
    expect(html).toContain("Utkast från mötesläget");
    expect(html).not.toContain("Generera om");
  });

  it("erbjuder Skriv sammanfattning när inget utkast finns (AK2)", () => {
    const html = renderToStaticMarkup(createElement(SessionWorkspace, base));
    expect(html).toContain("Skriv sammanfattning");
    expect(html).toContain("Skapa sammanfattning");
    expect(html).not.toContain("Godkänn och dela");
  });

  it("visar inget utkast när sammanfattningen redan är godkänd (AK6)", () => {
    const html = renderToStaticMarkup(
      createElement(SessionWorkspace, { ...base, shareComplete: true, initialDraft: "Fokus för sessionen\nX" }),
    );
    expect(html).not.toContain("Utkast · ej godkänt");
  });

  it("felrutan erbjuder den manuella vägen (AK3)", () => {
    const source = readFileSync(new URL("../src/components/portal/session-workspace.tsx", import.meta.url), "utf8");
    const errorBlock = source.slice(source.indexOf('stage === "error" ?'), source.indexOf('stage === "draft" ?'));
    expect(errorBlock).toContain("onClick={writeSummary}");
    expect(errorBlock).toContain("Skriv sammanfattning");
  });

  it("den manuella vägen anropar aldrig AI-routen", () => {
    const source = readFileSync(new URL("../src/components/portal/session-workspace.tsx", import.meta.url), "utf8");
    const write = source.slice(source.indexOf("function writeSummary()"), source.indexOf("async function createSummary()"));
    expect(write).not.toContain("fetch(");
  });

  it("FAQ-svaret beskriver alla tre vägarna (AK7)", () => {
    const answer = coachFaq
      .flatMap((category) => category.entries)
      .find((entry) => entry.question === "Hur skapar jag en sessionssammanfattning?")!
      .answer.join(" ");
    expect(answer).toContain("mötesläget");
    expect(answer).toContain("Skriv sammanfattning");
    expect(answer).toContain("Godkänn och dela");
  });
});

// ------------------------------------------------------------------ B. SQL contract

const migration = readFileSync(
  new URL("../supabase/migrations/20261021150000_cvb_base_own_profile_email_sync.sql", import.meta.url),
  "utf8",
);
const sql = migration
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .toLowerCase();

describe("SQL-kontrakt: klientens e-postbyte", () => {
  it("är additiv: inga tabell-, policy- eller dataändringar", () => {
    expect(sql).not.toMatch(/\b(create|alter|drop)\s+table\b/);
    expect(sql).not.toMatch(/\b(create|alter|drop)\s+policy\b/);
    expect(sql).not.toMatch(/\bdrop\s+function\b/);
    expect(sql).not.toMatch(/\bdelete\s+from\b/);
  });

  it("skriver bara klientens egen rad och profil, aldrig auth.users", () => {
    const writes = [...sql.matchAll(/\b(insert\s+into|update)\s+([a-z_.]+)/g)].map((m) => m[2]);
    expect(new Set(writes)).toEqual(new Set(["public.clients", "public.profiles"]));
    expect(sql).toContain("where id = v_client_id;");
    expect(sql).toContain("where id = auth.uid() and client_id = v_client_id;");
  });

  it("kopplar aldrig om identiteten och vägrar osynkad e-post", () => {
    const profileSets = [...sql.matchAll(/update\s+public\.profiles\s+set([\s\S]*?)\bwhere\b/g)].map((m) => m[1]);
    expect(profileSets.length).toBe(1);
    expect(profileSets[0]).not.toMatch(/\b(id|client_id|role|coach_id)\s*=/);
    expect(sql).toContain("raise exception 'auth_email_not_synced'");
    expect(sql).toContain("raise exception 'email_in_use'");
  });

  it("behåller signaturen och ger endast authenticated rätt; kontrollen är intern", () => {
    expect(sql).toContain("create or replace function public.update_own_client_profile(\n  p_name text,\n  p_role text,\n  p_email text,\n  p_phone text\n)\nreturns void");
    for (const fn of ["begin_own_client_profile_update", "update_own_client_profile"]) {
      expect(sql).toMatch(new RegExp(`revoke execute on function public\\.${fn}\\(text, text, text, text\\) from public, anon;`));
      expect(sql).toMatch(new RegExp(`grant execute on function public\\.${fn}\\(text, text, text, text\\) to authenticated;`));
    }
    expect(sql).toMatch(/revoke execute on function public\.own_client_profile_check\([^)]*\) from public, anon, authenticated;/);
    expect(sql.match(/security definer/g)?.length).toBe(3);
    expect(sql.match(/set search_path = ''/g)?.length).toBe(3);
  });
});

// ------------------------------------------------------------------ B. orchestration

describe("Klientens profil: e-postbyte följer med till kontot", () => {
  it("byter adress på det egna kontot, behåller bekräftelsen, profilen följer", async () => {
    const outcome = await updateOwnProfile(input({ email: "anna.ny@example.test" }), deps());
    expect(outcome).toEqual({ ok: true, emailChanged: true });
    expect(store.adminCalls).toEqual([`get:${USER}`, `update:${USER}:anna.ny@example.test:true`]);
    expect(store.users[USER]).toEqual({ email: "anna.ny@example.test", confirmed: true });
    expect(store.clients[CLIENT]!.email).toBe("anna.ny@example.test");
    expect(store.profiles[USER]!.email).toBe("anna.ny@example.test");
  });

  it("namnbyte utan adressändring rör inte kontot", async () => {
    const outcome = await updateOwnProfile(input({ name: "Anna Lind" }), deps());
    expect(outcome).toEqual({ ok: true, emailChanged: false });
    expect(store.adminCalls).toEqual([]);
    expect(store.profiles[USER]).toEqual({ email: "anna@example.test", name: "Anna Lind" });
  });

  it("återställer kontots adress om den avslutande skrivningen misslyckas", async () => {
    store.failUpdateRpc = true;
    const outcome = await updateOwnProfile(input({ email: "anna.ny@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "UNKNOWN", httpStatus: 502 });
    expect(store.users[USER]!.email).toBe("anna@example.test");
    expect(store.clients[CLIENT]!.email).toBe("anna@example.test");
  });

  it("vägrar en adress som redan används, utan att röra kontot", async () => {
    const outcome = await updateOwnProfile(input({ email: "bo@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "EMAIL_IN_USE", httpStatus: 409 });
    expect(store.adminCalls).toEqual([]);
    expect(store.clients[CLIENT]!.email).toBe("anna@example.test");
  });

  it("översätter Auth-konflikten email_exists till EMAIL_IN_USE och skriver inget", async () => {
    store.failAdminUpdate = "email_exists";
    const outcome = await updateOwnProfile(input({ email: "upptagen@example.test" }), deps());
    expect(outcome).toMatchObject({ ok: false, code: "EMAIL_IN_USE" });
    expect(store.clients[CLIENT]!.email).toBe("anna@example.test");
  });

  it("kräver Admin-klienten bara vid adressbyte", async () => {
    adminClient = null;
    const changed = await updateOwnProfile(input({ email: "anna.ny@example.test" }), deps());
    expect(changed).toEqual({
      ok: false,
      httpStatus: 503,
      code: "ADMIN_UNAVAILABLE",
      error: OWN_EMAIL_ADMIN_UNAVAILABLE_ERROR,
    });
    expect(store.clients[CLIENT]!.email).toBe("anna@example.test");
    const nameOnly = await updateOwnProfile(input({ name: "Anna Lind" }), deps());
    expect(nameOnly.ok).toBe(true);
  });

  it("databasen vägrar skriva om kontot inte bär den nya adressen", () => {
    const result = store.rpc("update_own_client_profile", {
      p_name: "Anna Andersson",
      p_role: "Vd",
      p_email: "anna.ny@example.test",
      p_phone: "",
    });
    expect(result.error?.message).toBe("AUTH_EMAIL_NOT_SYNCED");
    expect(mapOwnProfileError(result.error?.message).httpStatus).toBe(409);
  });
});

describe("Klientens profil: route", () => {
  it("kräver inloggad klient", async () => {
    vi.mocked(readClientSession).mockResolvedValue(null);
    const response = await profileRoute(post(input()));
    expect(response.status).toBe(401);
  });

  it("sparar och returnerar emailChanged", async () => {
    signedIn();
    const response = await profileRoute(post(input({ email: " Anna.Ny@Example.test " })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, emailChanged: true });
    expect(store.users[USER]!.email).toBe("anna.ny@example.test");
  });

  it("returnerar konfliktkoden till klienten", async () => {
    signedIn();
    const response = await profileRoute(post(input({ email: "bo@example.test" })));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ ok: false, code: "EMAIL_IN_USE" });
  });

  it("klientens FAQ säger att den nya adressen blir inloggningen", () => {
    const answer = clientFaq
      .flatMap((category) => category.entries)
      .find((entry) => entry.question === "Var ändrar jag mina kontaktuppgifter?")!
      .answer.join(" ");
    expect(answer).toContain("din inloggning");
  });
});
