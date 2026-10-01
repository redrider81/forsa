import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Release blockers:
 *
 *   1. A private client (organisation_id NULL) can use /klient, /klient/profil
 *      and /klient/avtal; business clients render as before.
 *   2. A consumer receives a durable contract confirmation when the contract
 *      is concluded, queued in the signing transaction, sent after commit,
 *      retryable, idempotent, and rendered once from the signed version.
 *   3. Special-category (art. 9) consent is explicit, auditable and
 *      withdrawable, and gates AI input per data source. Organisation
 *      context stays free of individual coaching content.
 *
 * Behaviour runs against an in-memory double of the documented RPC
 * contract; the SQL itself is asserted against the migrations (and was run
 * against a local Supabase stack as the real roles).
 */

// ------------------------------------------------------------------ module doubles

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
  usePathname: () => "/klient",
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: () => {
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

type Row = Record<string, unknown>;

class Db {
  tables: Record<string, Row[]> = {};
  currentCoachId: string | null = null;
  currentClientId: string | null = null;
  rpcCalls: Array<{ name: string; args: Row }> = [];
  seq = 0;

  reset() {
    this.tables = {
      contracts: [],
      contract_signatures: [],
      contract_confirmation_notifications: [],
      special_category_consents: [],
    };
    this.currentCoachId = null;
    this.currentClientId = null;
    this.rpcCalls = [];
  }

  /** Mirrors sign_contract_as_coach() in 20261001090000. */
  signAsCoach(args: Row) {
    const contract = this.tables.contracts.find((c) => c.id === args.p_contract_id);
    if (!contract || contract.coach_id !== this.currentCoachId) return "Contract not found or unauthorized";
    if (contract.status !== "kund_signerad") return "Contract is not awaiting coach signature";
    if (contract.version_id !== args.p_version_id) return "Contract version mismatch";
    const now = new Date().toISOString();
    this.tables.contract_signatures.push({
      id: `sig-${++this.seq}`,
      contract_id: contract.id,
      signer_role: "coach",
      signer_name: "Carolina von Braun",
      signer_email: "c@example.test",
      contract_version_id: contract.version_id,
      signed_at: now,
    });
    Object.assign(contract, {
      status: "signerat",
      coach_signed_at: now,
      locked_at: now,
      withdrawal_deadline: contract.counterparty_type === "consumer" ? "2026-10-15T22:00:00Z" : null,
    });
    if (contract.counterparty_type === "consumer") {
      const exists = this.tables.contract_confirmation_notifications.some((n) => n.contract_id === contract.id);
      if (!exists) {
        this.tables.contract_confirmation_notifications.push({
          contract_id: contract.id,
          contract_version_id: contract.version_id,
          recipient_email: (contract.clients as { email: string }).email || null,
          idempotency_key: `cvb-contract-confirmation/${contract.id}/${contract.version_id}`,
          status: "pending",
          attempt_count: 0,
          rendered_subject: null,
          rendered_body: null,
          terms_version: null,
          last_attempt_at: null,
          provider_accepted_at: null,
          created_at: now,
        });
      }
    }
    return null;
  }

  /** Mirrors record_contract_confirmation_result(). */
  recordConfirmation(args: Row) {
    const contract = this.tables.contracts.find((c) => c.id === args.p_contract_id);
    if (!contract || contract.coach_id !== this.currentCoachId) return "NOT_AUTHORIZED";
    const row = this.tables.contract_confirmation_notifications.find((n) => n.contract_id === args.p_contract_id);
    if (!row) return "NOTIFICATION_NOT_FOUND";
    if (row.status === "sent") return null;
    row.status = args.p_status;
    if (args.p_status === "sending") row.attempt_count = Number(row.attempt_count) + 1;
    row.rendered_subject ??= args.p_rendered_subject ?? null;
    row.rendered_body ??= args.p_rendered_body ?? null;
    row.terms_version ??= args.p_terms_version ?? null;
    if (args.p_status === "sent") row.provider_accepted_at = new Date().toISOString();
    return null;
  }

  grantConsent(args: Row) {
    if (!this.currentClientId) return { error: "NOT_AUTHORIZED" };
    if (args.p_version !== "2026-10-01") return { error: "UNKNOWN_CONSENT_VERSION" };
    const active = this.tables.special_category_consents.find(
      (r) => r.client_id === this.currentClientId && r.withdrawn_at === null,
    );
    if (active) return { data: [{ consent_id: active.id, granted_at: active.granted_at, already_granted: true }] };
    const row = {
      id: `consent-${++this.seq}`,
      client_id: this.currentClientId,
      consent_version: args.p_version,
      granted_at: new Date(Date.now() + this.seq).toISOString(),
      withdrawn_at: null,
    };
    this.tables.special_category_consents.push(row);
    return { data: [{ consent_id: row.id, granted_at: row.granted_at, already_granted: false }] };
  }

  withdrawConsent() {
    if (!this.currentClientId) return { error: "NOT_AUTHORIZED" };
    const active = this.tables.special_category_consents.find(
      (r) => r.client_id === this.currentClientId && r.withdrawn_at === null,
    );
    if (active) active.withdrawn_at = new Date(Date.now() + ++this.seq).toISOString();
    return { data: [{ consent_id: active?.id ?? null, withdrawn_at: active?.withdrawn_at ?? null, was_active: Boolean(active) }] };
  }

  /** RLS per table, as in the migrations. */
  visible(table: string, row: Row): boolean {
    if (table === "contracts") return row.coach_id === this.currentCoachId || row.client_id === this.currentClientId;
    if (table === "contract_signatures") {
      const contract = this.tables.contracts.find((c) => c.id === row.contract_id);
      return Boolean(contract && this.visible("contracts", contract));
    }
    if (table === "contract_confirmation_notifications") {
      const contract = this.tables.contracts.find((c) => c.id === row.contract_id);
      return Boolean(contract && contract.coach_id === this.currentCoachId);
    }
    if (table === "special_category_consents") {
      return row.client_id === this.currentClientId || this.currentCoachId !== null;
    }
    return false;
  }
}

const db = new Db();

function query(table: string) {
  let rows = () => (db.tables[table] ?? []).filter((row) => db.visible(table, row));
  const filters: Array<(row: Row) => boolean> = [];
  let orderBy: { column: string; ascending: boolean } | null = null;
  const result = () => {
    let out = rows().filter((row) => filters.every((f) => f(row)));
    if (orderBy) {
      const { column, ascending } = orderBy;
      out = [...out].sort((a, b) => (String(a[column]) < String(b[column]) ? -1 : 1) * (ascending ? 1 : -1));
    }
    return out;
  };
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters.push((row) => row[column] === value);
      return builder;
    },
    in: (column: string, values: unknown[]) => {
      filters.push((row) => values.includes(row[column]));
      return builder;
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      orderBy = { column, ascending: options?.ascending ?? true };
      return builder;
    },
    maybeSingle: async () => ({ data: result()[0] ?? null, error: null }),
    single: async () => ({ data: result()[0] ?? null, error: null }),
    then(resolve: (value: { data: Row[]; error: null }) => unknown) {
      return Promise.resolve({ data: result(), error: null }).then(resolve);
    },
  };
  void rows;
  rows = rows.bind(null);
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: (table: string) => query(table),
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    rpc: async (name: string, args: Row = {}) => {
      db.rpcCalls.push({ name, args });
      if (name === "sign_contract_as_coach") {
        const error = db.signAsCoach(args);
        return { data: null, error: error ? { message: error } : null };
      }
      if (name === "record_contract_confirmation_result") {
        const error = db.recordConfirmation(args);
        return { data: null, error: error ? { message: error } : null };
      }
      if (name === "grant_special_category_consent") {
        const r = db.grantConsent(args);
        return r.error ? { data: null, error: { message: r.error } } : { data: r.data, error: null };
      }
      if (name === "withdraw_special_category_consent") {
        const r = db.withdrawConsent();
        return r.error ? { data: null, error: { message: r.error } } : { data: r.data, error: null };
      }
      throw new Error(`Oväntat RPC-anrop i test: ${name}`);
    },
  })),
}));

vi.mock("@/lib/portal/session", () => ({
  readSession: vi.fn(),
  readCoachSession: vi.fn(),
  readClientSession: vi.fn(),
}));

vi.mock("@/lib/email/booking-provider", () => ({
  createResendBookingProvider: vi.fn(() => {
    throw new Error("Resend ska aldrig instansieras i test utan uttrycklig stub.");
  }),
}));

let repositoryData: unknown = null;
vi.mock("@/lib/portal/repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/portal/repository")>();
  return {
    ...actual,
    fetchPortalRepositoryData: vi.fn(async () => repositoryData ?? actual.SEED_REPOSITORY_DATA),
  };
});

vi.mock("@/lib/ai/openai", () => ({
  hasApiKey: () => true,
  generate: vi.fn(async () => ({ text: "Sammanställning.", model: "test-model" })),
  AiError: class AiError extends Error {
    code = "unknown";
    userMessage = "fel";
  },
}));

import { readClientSession, readCoachSession, readSession } from "@/lib/portal/session";
import { createResendBookingProvider } from "@/lib/email/booking-provider";
import { generate } from "@/lib/ai/openai";
import {
  buildClientPerspective,
  SEED_REPOSITORY_DATA,
  type PortalRepositoryData,
} from "@/lib/portal/repository";
import { buildClientContext, buildEngagementContext } from "@/lib/ai/context";
import { buildContractConfirmationEmail, type ContractConfirmationContext } from "@/lib/email/contract-confirmation-email";
import { termsDocument } from "@/lib/legal/content/terms";
import { SPECIAL_CATEGORY_CONSENT_VERSION } from "@/lib/portal/special-category-consent-rules";
import ClientOverviewPage from "@/app/klient/page";
import ClientProfilePage from "@/app/klient/profil/page";
import ClientAvtalPage from "@/app/klient/avtal/page";
import SpecialCategoryConsentCard from "@/components/klient/special-category-consent-card";
import { POST as signPost } from "@/app/api/portal/avtal/[contractId]/signera/route";
import { POST as confirmationRetryPost } from "@/app/api/portal/avtal/[contractId]/bekraftelse/skicka-om/route";
import { POST as consentPost } from "@/app/api/klient/samtycke/route";
import { POST as aiClientPost } from "@/app/api/portal/ai/klient/route";
import { POST as aiSummaryPost } from "@/app/api/portal/ai/sessionssammanfattning/route";

const readMigration = (name: string) =>
  readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf-8");
const confirmationSql = readMigration("20261001090000_cvb_base_contract_confirmation.sql");
const consentSql = readMigration("20261001090100_cvb_base_special_category_consent.sql");

const COACH = SEED_REPOSITORY_DATA.coach.id;
const EMMA = "klient-emma-lind";
const originalEnv = { ...process.env };

/** Emma as a private client: no organisation anywhere in her chain. */
function privateEmmaData(): PortalRepositoryData {
  const emma = SEED_REPOSITORY_DATA.clients.find((c) => c.id === EMMA)!;
  return {
    ...SEED_REPOSITORY_DATA,
    clients: SEED_REPOSITORY_DATA.clients.map((c) => (c.id === EMMA ? { ...c, organisationId: undefined } : c)),
    engagements: SEED_REPOSITORY_DATA.engagements.map((e) =>
      e.id === emma.engagementId ? { ...e, organisationId: undefined } : e,
    ),
  };
}

function asClient(clientId: string) {
  db.currentClientId = clientId;
  db.currentCoachId = null;
  vi.mocked(readClientSession).mockResolvedValue({ userId: `u-${clientId}`, name: clientId, clientId });
  vi.mocked(readCoachSession).mockResolvedValue(null);
  vi.mocked(readSession).mockResolvedValue({ userId: `u-${clientId}`, name: clientId, role: "klient" });
}

function asCoach() {
  db.currentClientId = null;
  db.currentCoachId = COACH;
  vi.mocked(readClientSession).mockResolvedValue(null);
  vi.mocked(readCoachSession).mockResolvedValue({ userId: "coach-user", name: "Carolina von Braun", coachId: COACH });
  vi.mocked(readSession).mockResolvedValue({ userId: "coach-user", name: "Carolina von Braun", role: "coach" });
}

const json = (body: unknown) =>
  new Request("http://localhost/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  db.reset();
  repositoryData = null;
  delete process.env.EMAIL_SEND_ENABLED;
  delete process.env.EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
  vi.mocked(readClientSession).mockReset();
  vi.mocked(readCoachSession).mockReset();
  vi.mocked(readSession).mockReset();
  vi.mocked(createResendBookingProvider).mockReset();
  vi.mocked(createResendBookingProvider).mockImplementation(() => {
    throw new Error("Resend ska aldrig instansieras i test utan uttrycklig stub.");
  });
  vi.mocked(generate).mockClear();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

// ================================================================== 1. PRIVATE CLIENT

describe("privat klient utan organisation", () => {
  it("buildClientPerspective lyckas och organisationen är null — ingen dummyorganisation", () => {
    const view = buildClientPerspective(COACH, EMMA, undefined, undefined, privateEmmaData());
    expect(view).not.toBeNull();
    expect(view!.organisation).toBeNull();
    expect(view!.client.name).toBe("Emma Lind");
    expect(view!.sessions.length).toBeGreaterThan(0);
  });

  it("får inga organisations- eller sponsorfält", () => {
    const view = buildClientPerspective(COACH, EMMA, undefined, undefined, privateEmmaData())!;
    const serialized = JSON.stringify(view);
    for (const org of SEED_REPOSITORY_DATA.organisations) {
      expect(serialized).not.toContain(org.name);
      if (org.sponsor) expect(serialized).not.toContain(org.sponsor.name);
    }
  });

  it("/klient renderar för en privat klient, utan organisationsrad", async () => {
    repositoryData = privateEmmaData();
    asClient(EMMA);
    const html = renderToStaticMarkup(await ClientOverviewPage());
    expect(html).toContain("Emma Lind");
    // The organisation's name; "Northline Studio" alone appears in seed
    // session locations and agreement text, which are content, not org fields.
    expect(html).not.toContain("Northline Studio AB");
  });

  it("/klient/profil renderar för en privat klient, utan organisationsfält", async () => {
    repositoryData = privateEmmaData();
    asClient(EMMA);
    const html = renderToStaticMarkup(await ClientProfilePage());
    expect(html).toContain("Emma Lind");
    expect(html).not.toContain(">Organisation<");
    expect(html).not.toContain("Northline Studio AB");
    expect(html).toContain("Känsliga personuppgifter");
  });

  it("/klient/avtal renderar för en privat klient", async () => {
    asClient(EMMA);
    const html = renderToStaticMarkup(await ClientAvtalPage());
    expect(html).toContain("Dina coachningsavtal med CVB Coaching.");
  });
});

describe("företagsklient — oförändrat beteende", () => {
  it("behåller organisationen i perspektivet", () => {
    const view = buildClientPerspective(COACH, EMMA);
    expect(view!.organisation?.name).toBe("Northline Studio AB");
  });

  it("/klient visar organisationen som tidigare", async () => {
    asClient(EMMA);
    const html = renderToStaticMarkup(await ClientOverviewPage());
    expect(html).toContain("Northline Studio AB");
  });

  it("/klient/profil visar organisationsfältet som tidigare", async () => {
    asClient(EMMA);
    const html = renderToStaticMarkup(await ClientProfilePage());
    expect(html).toContain("Northline Studio AB");
  });

  it("okänd klient ger fortfarande notFound", async () => {
    asClient("klient-finns-inte");
    await expect(ClientOverviewPage()).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

// ================================================================== 2. CONTRACT CONFIRMATION

function seedContract(overrides: Row = {}) {
  const contract: Row = {
    id: `contract-${++db.seq}`,
    coach_id: COACH,
    client_id: "client-klara",
    engagement_id: null,
    template_id: null,
    title: "Individuell coaching hösten 2026",
    content: {
      sections: [{ id: "s1", heading: "Omfattning", body: "Åtta samtal om 60 minuter." }],
      fields: [{ id: "f1", label: "Antal sessioner", type: "antal", value: "8", options: [] }],
    },
    price_amount: 12000,
    currency: "SEK",
    payment_terms: "30 dagar netto",
    status: "kund_signerad",
    version_id: `version-${db.seq}`,
    sent_at: "2026-09-20T08:00:00Z",
    client_signed_at: "2026-09-21T09:00:00Z",
    coach_signed_at: null,
    locked_at: null,
    counterparty_type: "consumer",
    withdrawal_deadline: null,
    early_performance_requested_at: "2026-09-21T09:00:00Z",
    general_terms_version: "2026-10-01",
    created_at: "2026-09-19T08:00:00Z",
    updated_at: "2026-09-21T09:00:00Z",
    clients: { name: "Klara Konsument", email: "klara@example.test" },
    contract_withdrawals: null,
    ...overrides,
  };
  db.tables.contracts.push(contract);
  db.tables.contract_signatures.push({
    id: `sig-${++db.seq}`,
    contract_id: contract.id,
    signer_role: "klient",
    signer_name: "Klara Konsument",
    signer_email: "klara@example.test",
    contract_version_id: contract.version_id,
    signed_at: "2026-09-21T09:00:00Z",
  });
  return contract;
}

const sign = (contractId: string) => signPost(json({}), { params: Promise.resolve({ contractId }) });
const retryConfirmation = (contractId: string) =>
  confirmationRetryPost(json({}), { params: Promise.resolve({ contractId }) });
const confirmationRow = (contractId: string) =>
  db.tables.contract_confirmation_notifications.find((n) => n.contract_id === contractId);

describe("avtalsbekräftelse — konsument", () => {
  it("klient signerat → coach kontrasignerar → signerat → bekräftelse köad och skickad (simulerat lokalt)", async () => {
    const contract = seedContract();
    asCoach();
    const response = await sign(String(contract.id));
    expect(response.status).toBe(200);
    expect(contract.status).toBe("signerat");
    const row = confirmationRow(String(contract.id));
    expect(row).toBeDefined();
    expect(row!.status).toBe("sent");
    expect(row!.idempotency_key).toBe(`cvb-contract-confirmation/${contract.id}/${contract.version_id}`);
  });

  it("bekräftelsen innehåller den signerade versionen, pris, betalningsvillkor och ångerfristen", async () => {
    const contract = seedContract();
    asCoach();
    await sign(String(contract.id));
    const body = String(confirmationRow(String(contract.id))!.rendered_body);
    for (const needle of [
      "Carolina von Braun",
      "Klara Konsument",
      "Individuell coaching hösten 2026",
      `Avtals-ID: ${contract.id}`,
      `Avtalsversion: ${contract.version_id}`,
      "Avtalet ingicks:",
      "Pris: 12\u00a0000 SEK",
      "Valuta: SEK",
      "Betalningsvillkor: 30 dagar netto",
      "Åtta samtal om 60 minuter.",
      "UPPDRAGSSPECIFIKA VILLKOR",
      "Antal sessioner: 8",
      "ÅNGERRÄTT",
      "Ångerfristens sista dag: 15 oktober 2026.",
      "Ångra avtalet här",
      "Du begärde",
      "ALLMÄNNA VILLKOR FÖR COACHING (version",
      "STANDARDFORMULÄR FÖR UTÖVANDE AV ÅNGERRÄTT",
    ]) {
      expect(body, needle).toContain(needle);
    }
    expect(body).not.toMatch(/https?:\/\/\S*avtal/);
  });

  it("e-post lyckas → sent", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <no-reply@example.test>";
    const send = vi.fn(async () => ({ id: "msg-1" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send });
    const contract = seedContract();
    asCoach();
    await sign(String(contract.id));
    expect(send).toHaveBeenCalledTimes(1);
    const [[payload]] = send.mock.calls as unknown as Array<[{ to: string; subject: string; idempotencyKey: string }]>;
    expect(payload.to).toBe("klara@example.test");
    expect(payload.subject).toBe("Avtalsbekräftelse: Individuell coaching hösten 2026");
    expect(confirmationRow(String(contract.id))!.status).toBe("sent");
  });

  it("e-post misslyckas → avtalet förblir signerat, felet syns, omskick lyckas med samma låsta innehåll", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <no-reply@example.test>";
    const failing = vi.fn(async () => {
      throw Object.assign(new Error("down"), { code: "provider_down" });
    });
    vi.mocked(createResendBookingProvider).mockReturnValue({ send: failing });
    const contract = seedContract();
    asCoach();
    const response = await sign(String(contract.id));
    expect(response.status).toBe(200);
    expect(contract.status).toBe("signerat");
    expect(db.tables.contract_signatures.filter((s) => s.contract_id === contract.id)).toHaveLength(2);
    const row = confirmationRow(String(contract.id))!;
    expect(row.status).toBe("failed");
    const firstBody = row.rendered_body;

    // Failed confirmations appear in Carolina's existing failed-email list.
    const { listFailedContractConfirmations } = await import("@/lib/portal/contract-confirmation");
    const failed = await listFailedContractConfirmations();
    expect(failed).toEqual([
      expect.objectContaining({ contractId: contract.id, clientName: "Klara Konsument", contractTitle: contract.title }),
    ]);

    // Even if the stored contract text somehow changed, the retry re-sends the signed snapshot.
    contract.content = { sections: [{ id: "s1", heading: "Ändrad", body: "Något annat." }], fields: [] };
    const ok = vi.fn(async () => ({ id: "msg-2" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send: ok });
    const retried = await retryConfirmation(String(contract.id));
    expect(((await retried.json()) as { ok: boolean }).ok).toBe(true);
    expect(row.status).toBe("sent");
    const [[payload]] = ok.mock.calls as unknown as Array<[{ body: string; idempotencyKey: string }]>;
    expect(payload.body).toBe(firstBody);
    expect(payload.body).not.toContain("Något annat.");
    expect(payload.idempotencyKey).toBe(`cvb-contract-confirmation/${contract.id}/${contract.version_id}`);

    const again = await retryConfirmation(String(contract.id));
    expect(again.status).toBe(409);
    expect(ok).toHaveBeenCalledTimes(1);
  });

  it("dubbel coach-signering skapar ingen andra bekräftelse och inget nytt utskick", async () => {
    const contract = seedContract();
    asCoach();
    await sign(String(contract.id));
    const second = await sign(String(contract.id));
    expect(second.status).toBe(502);
    expect(db.tables.contract_confirmation_notifications).toHaveLength(1);
    expect(confirmationRow(String(contract.id))!.attempt_count).toBe(1);
  });

  it("omskick kräver coachsession", async () => {
    const contract = seedContract();
    asCoach();
    await sign(String(contract.id));
    asClient("client-klara");
    expect((await retryConfirmation(String(contract.id))).status).toBe(401);
  });

  it("klientens egen signering köar ingen bekräftelse", async () => {
    const contract = seedContract({ status: "skickat" });
    db.tables.contract_signatures = [];
    asClient("client-klara");
    // The double has no client-sign RPC: the client path must never reach the confirmation code.
    await sign(String(contract.id)).catch(() => undefined);
    expect(db.tables.contract_confirmation_notifications).toHaveLength(0);
    expect(db.rpcCalls.some((c) => c.name === "record_contract_confirmation_result")).toBe(false);
  });
});

describe("avtalsbekräftelse — företag", () => {
  it("B2B-avtal köar ingen konsumentbekräftelse", async () => {
    const contract = seedContract({ counterparty_type: "business", early_performance_requested_at: null });
    asCoach();
    const response = await sign(String(contract.id));
    expect(response.status).toBe(200);
    expect(contract.status).toBe("signerat");
    expect(db.tables.contract_confirmation_notifications).toHaveLength(0);
  });

  it("om bekräftelsen byggs för ett företagsavtal saknar den all konsumentspecifik ångertext", () => {
    const ctx: ContractConfirmationContext = {
      contractId: "c",
      versionId: "v",
      title: "Företagsprogram",
      clientName: "Emma Lind",
      counterpartyType: "business",
      clientSignerName: "Emma Lind",
      clientSignedAt: "2026-09-21T09:00:00Z",
      coachSignerName: "Carolina von Braun",
      concludedAt: "2026-09-22T09:00:00Z",
      priceAmount: 36000,
      currency: "SEK",
      paymentTerms: "Faktureras månadsvis",
      content: { sections: [], fields: [] },
      withdrawalDeadline: null,
      earlyPerformanceRequestedAt: null,
      party: { tradeName: "CVB Coaching", name: "Carolina von Braun", address: "Skårsgatan 53, 412 69 Göteborg", email: "carolina@cvbcoaching.se" },
      terms: termsDocument("sv"),
      termsVersion: "2026-10-01",
    };
    const { body } = buildContractConfirmationEmail(ctx);
    expect(body).toContain("Avtalstyp: Företagsavtal");
    expect(body).not.toMatch(/ÅNGERRÄTT|ångerfrist|14 dagar|Standardformulär/i);
    expect(body).not.toContain("Ångerfristens sista dag");
    expect(body).not.toContain("Du har rätt att ångra avtalet inom 14 dagar");
    expect(body).not.toContain("välj Ångra avtalet här");
  });
});

describe("avtalsbekräftelse — SQL-kontrakt", () => {
  const fn = confirmationSql.slice(confirmationSql.indexOf("function public.sign_contract_as_coach("));

  it("köas i samma transaktion som kontrasigneringen, endast för konsumentavtal, högst en gång", () => {
    expect(fn).toContain("if v_row.counterparty_type = 'consumer' then");
    expect(fn).toContain("insert into public.contract_confirmation_notifications");
    expect(fn).toContain("on conflict (contract_id) do nothing;");
    expect(confirmationSql).toContain("contract_id uuid not null unique references public.contracts(id) on delete restrict");
  });

  it("ögonblicksbilden skrivs bara en gång och sent är terminalt", () => {
    expect(confirmationSql).toContain("rendered_body = coalesce(rendered_body, p_rendered_body)");
    expect(confirmationSql).toContain("if v_current = 'sent' then");
  });

  it("endast ägande coach kan registrera resultat; klient och anon når inte ledgern", () => {
    expect(confirmationSql).toContain("where id = p_contract_id and coach_id = public.current_coach_id()");
    expect(confirmationSql).toContain("revoke execute on function public.record_contract_confirmation_result(uuid, text, text, text, text, text, text, text) from public, anon;");
    expect(confirmationSql).not.toMatch(/grant (insert|update|delete)/);
    expect(confirmationSql).not.toMatch(/to anon/);
  });

  it("signaturkontrollerna från föregående migration är oförändrade", () => {
    for (const guard of [
      "raise exception 'Contract is not awaiting coach signature'",
      "raise exception 'Contract version mismatch'",
      "raise exception 'CONTRACT_WITHDRAWN'",
      "raise exception 'Client has not signed yet'",
      "raise exception 'Contract already signed by coach'",
      "when v_row.counterparty_type = 'consumer' then public.contract_withdrawal_deadline(v_now)",
    ]) {
      expect(fn).toContain(guard);
    }
  });
});

// ================================================================== 3. ARTICLE 9

const emmaSeed = {
  reflection: SEED_REPOSITORY_DATA.reflections.find((r) => r.clientId === EMMA)!.text,
  insight: SEED_REPOSITORY_DATA.insights.find((i) => i.clientId === EMMA)!.text,
  commitment: SEED_REPOSITORY_DATA.commitments.find((c) => c.clientId === EMMA)!.text,
  focus: SEED_REPOSITORY_DATA.sessions.find((s) => s.clientId === EMMA && s.status === "genomford")!.clientFocus,
  summaryFocus: SEED_REPOSITORY_DATA.sessions.find((s) => s.clientId === EMMA && s.summary?.approved)!.summary!.focus,
  coachNote: SEED_REPOSITORY_DATA.sessions.find((s) => s.clientId === EMMA && s.coachNotes)!.coachNotes!,
  clientWording: SEED_REPOSITORY_DATA.clients.find((c) => c.id === EMMA)!.goal.clientWording,
  goalHeadline: SEED_REPOSITORY_DATA.clients.find((c) => c.id === EMMA)!.goal.headline,
};
const CONVERSATION_CONTENT = [
  emmaSeed.reflection,
  emmaSeed.insight,
  emmaSeed.commitment,
  emmaSeed.focus,
  emmaSeed.summaryFocus,
  emmaSeed.coachNote,
  emmaSeed.clientWording,
];

describe("AI-spärr per datakälla", () => {
  it("utan samtycke: inget samtalsinnehåll eller coachanteckningar, även i coachläge", () => {
    const context = buildClientContext(COACH, EMMA, undefined, { includeCoachNotes: true, specialCategoryConsent: false })!;
    for (const content of CONVERSATION_CONTENT) {
      expect(context.text, content).not.toContain(content);
    }
    expect(context.text).not.toContain("COACH PRIVAT");
    expect(context.text).not.toContain("KLIENTENS EGNA REFLEKTIONER");
    expect(context.text).toContain("Klienten har inget aktivt samtycke");
    expect(context.sources.join(" ")).toContain("Samtalsinnehåll ingår inte");
  });

  it("utan samtycke finns ramen kvar: namn, överenskommelse, målrubrik och sessionsdatum", () => {
    const context = buildClientContext(COACH, EMMA, undefined, { specialCategoryConsent: false })!;
    expect(context.text).toContain("Namn: Emma Lind");
    expect(context.text).toContain("COACHNINGSÖVERENSKOMMELSE");
    expect(context.text).toContain(`Mål: ${emmaSeed.goalHeadline}`);
    expect(context.text).toMatch(/Session \d+ — /);
  });

  it("standard är utan samtycke", () => {
    const context = buildClientContext(COACH, EMMA)!;
    expect(context.text).not.toContain(emmaSeed.reflection);
  });

  it("med samtycke ingår samtalsinnehållet — och coachanteckningar endast i coachläge", () => {
    const withNotes = buildClientContext(COACH, EMMA, undefined, { includeCoachNotes: true, specialCategoryConsent: true })!;
    for (const content of CONVERSATION_CONTENT) {
      expect(withNotes.text, content).toContain(content);
    }
    const withoutNotes = buildClientContext(COACH, EMMA, undefined, { specialCategoryConsent: true })!;
    expect(withoutNotes.text).not.toContain(emmaSeed.coachNote);
  });

  it("organisationskontexten innehåller aldrig individuellt samtalsinnehåll", () => {
    const emmaEngagement = SEED_REPOSITORY_DATA.clients.find((c) => c.id === EMMA)!.engagementId;
    for (const engagement of SEED_REPOSITORY_DATA.engagements) {
      const context = buildEngagementContext(COACH, engagement.id);
      if (!context) continue;
      for (const client of SEED_REPOSITORY_DATA.clients.filter((c) => c.engagementId === engagement.id)) {
        const sources = [
          ...SEED_REPOSITORY_DATA.reflections.filter((r) => r.clientId === client.id).map((r) => r.text),
          ...SEED_REPOSITORY_DATA.insights.filter((i) => i.clientId === client.id).map((i) => i.text),
          ...SEED_REPOSITORY_DATA.sessions
            .filter((s) => s.clientId === client.id)
            .flatMap((s) => [s.coachNotes, s.summary?.focus, ...(s.summary?.insights ?? [])]),
          client.goal.clientWording,
        ].filter((text): text is string => Boolean(text && text.length > 12));
        for (const text of sources) {
          expect(context.text, `${engagement.id}: ${text}`).not.toContain(text);
        }
      }
      expect(context.text).not.toMatch(/COACH PRIVAT|KLIENTENS EGNA REFLEKTIONER|FÖRBEREDELSE|INSIKTER/);
    }
    expect(emmaEngagement).toBeTruthy();
  });
});

describe("AI-routes läser klientens faktiska samtyckesläge", () => {
  const ask = () => aiClientPost(json({ clientId: EMMA, mode: "forbered" }));
  const promptSent = () => {
    const calls = vi.mocked(generate).mock.calls as unknown as Array<[{ user: string }]>;
    return calls.at(-1)![0].user;
  };

  it("utan samtycke skickas inget samtalsinnehåll till OpenAI", async () => {
    asCoach();
    const response = await ask();
    expect(response.status).toBe(200);
    for (const content of CONVERSATION_CONTENT) {
      expect(promptSent(), content).not.toContain(content);
    }
  });

  it("med aktivt samtycke ingår samtalsinnehållet", async () => {
    db.tables.special_category_consents.push({
      id: "c1", client_id: EMMA, consent_version: "2026-10-01", granted_at: "2026-09-01T10:00:00Z", withdrawn_at: null,
    });
    asCoach();
    await ask();
    expect(promptSent()).toContain(emmaSeed.reflection);
    expect(promptSent()).toContain(emmaSeed.coachNote);
  });

  it("efter återkallelse är samtalsinnehållet borta igen", async () => {
    db.tables.special_category_consents.push({
      id: "c1", client_id: EMMA, consent_version: "2026-10-01", granted_at: "2026-09-01T10:00:00Z", withdrawn_at: "2026-09-15T10:00:00Z",
    });
    asCoach();
    await ask();
    expect(promptSent()).not.toContain(emmaSeed.reflection);
  });

  it("utkast till sessionssammanfattning kräver samtycke och anropar då inte OpenAI alls", async () => {
    asCoach();
    const session = SEED_REPOSITORY_DATA.sessions.find((s) => s.clientId === EMMA)!;
    const response = await aiSummaryPost(
      json({ clientId: EMMA, sessionId: session.id, notes: "Anteckningar från samtalet som är tillräckligt långa." }),
    );
    expect(response.status).toBe(409);
    expect(generate).not.toHaveBeenCalled();
  });
});

describe("samtycke — route och historik", () => {
  it("coach kan inte lämna eller återkalla samtycke åt klienten", async () => {
    asCoach();
    expect((await consentPost(json({ action: "grant" }))).status).toBe(401);
    expect(db.tables.special_category_consents).toHaveLength(0);
  });

  it("klient lämnar samtycke med den versionsbundna texten, återkallar, och historiken består", async () => {
    asClient(EMMA);
    const granted = (await (await consentPost(json({ action: "grant" }))).json()) as { history: Array<{ withdrawnAt: string | null; version: string }> };
    expect(granted.history).toHaveLength(1);
    expect(granted.history[0]).toMatchObject({ withdrawnAt: null, version: SPECIAL_CATEGORY_CONSENT_VERSION });
    expect(db.rpcCalls.find((c) => c.name === "grant_special_category_consent")!.args).toEqual({ p_version: SPECIAL_CATEGORY_CONSENT_VERSION });

    const withdrawn = (await (await consentPost(json({ action: "withdraw" }))).json()) as { history: Array<{ withdrawnAt: string | null }> };
    expect(withdrawn.history).toHaveLength(1);
    expect(withdrawn.history[0].withdrawnAt).not.toBeNull();

    const regranted = (await (await consentPost(json({ action: "grant" }))).json()) as { history: unknown[] };
    expect(regranted.history).toHaveLength(2);
  });

  it("ogiltig åtgärd nekas", async () => {
    asClient(EMMA);
    expect((await consentPost(json({ action: "all" }))).status).toBe(400);
  });
});

describe("samtycke — gränssnitt", () => {
  it("valet är uttryckligt: okryssad ruta, knappen inaktiv, ingen blankettformulering", () => {
    const html = renderToStaticMarkup(createElement(SpecialCategoryConsentCard, { initialHistory: [] }));
    expect(html).toContain("I coachingen kan du själv välja att dela information som kan vara känslig enligt dataskyddsreglerna");
    expect(html).toContain("Du har inte lämnat något samtycke.");
    expect(html).toMatch(/<input type="checkbox"(?![^>]*checked)[^>]*>/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Lämna samtycke<\/button>/);
    expect(html).not.toMatch(/all behandling/i);
  });

  it("visar aktuellt samtycke och erbjuder återkallelse", () => {
    const html = renderToStaticMarkup(
      createElement(SpecialCategoryConsentCard, {
        initialHistory: [{ id: "c1", version: "2026-10-01", grantedAt: "2026-09-01T10:00:00Z", withdrawnAt: null }],
      }),
    );
    expect(html).toContain("Samtycke lämnat 1 september 2026");
    expect(html).toContain(">Återkalla samtycke</button>");
  });

  it("visar återkallat läge", () => {
    const html = renderToStaticMarkup(
      createElement(SpecialCategoryConsentCard, {
        initialHistory: [{ id: "c1", version: "2026-10-01", grantedAt: "2026-09-01T10:00:00Z", withdrawnAt: "2026-09-15T10:00:00Z" }],
      }),
    );
    expect(html).toContain("Samtycket återkallades 15 september 2026");
    expect(html).toContain("Lämna samtycke");
  });
});

describe("samtycke — SQL-kontrakt", () => {
  it("klientens version är en som databasen accepterar", () => {
    expect(consentSql).toContain(`p_version not in ('${SPECIAL_CATEGORY_CONSENT_VERSION}')`);
  });

  it("endast klienten, bara sitt eget, via RPC med servertid", () => {
    for (const fn of ["grant_special_category_consent", "withdraw_special_category_consent"]) {
      const body = consentSql.slice(consentSql.indexOf(`function public.${fn}(`));
      expect(body).toContain("v_client_id := public.current_client_id();");
      expect(body).toContain("raise exception 'NOT_AUTHORIZED'");
    }
    expect(consentSql).toContain("granted_at timestamptz not null default now()");
    expect(consentSql).toContain("set withdrawn_at = now()");
    expect(consentSql).toContain("grant select on table public.special_category_consents to authenticated;");
    expect(consentSql).not.toMatch(/grant (insert|update|delete)/);
    expect(consentSql).not.toMatch(/to anon/);
  });

  it("historiken kan inte skrivas om: bara övergången till återkallad tillåts, högst ett aktivt samtycke", () => {
    expect(consentSql).toContain("only withdrawal of an active consent is allowed");
    expect(consentSql).toContain("where withdrawn_at is null;");
    expect(consentSql).toContain("create unique index special_category_consents_one_active_idx");
  });

  it("RLS: klienten ser sitt eget, coachen sina klienters", () => {
    expect(consentSql).toContain("using (client_id = public.current_client_id());");
    expect(consentSql).toContain("using (public.client_owned_by_current_coach(client_id));");
  });
});
