import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Consumer/business classification and the online withdrawal function
 * (ångerfunktion) for consumer contracts.
 *
 * Four layers:
 *
 * 1. The pure presentation rule for when the function is shown.
 * 2. The contract workspace rendered to HTML for each relevant state.
 * 3. The withdrawal and retry routes, against an in-memory double that
 *    implements the documented RPC contract (ownership, classification,
 *    signature state, server-side deadline, idempotency, append-only audit,
 *    outbox). Email is a post-commit side effect.
 * 4. The SQL contract, asserted against the migration itself, so the double
 *    cannot drift from what the database does. The same migration was also
 *    exercised against a real local Supabase stack as the real roles.
 */

// ------------------------------------------------------------------ module doubles

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
  usePathname: () => "/klient/avtal/x",
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

type ContractRow = {
  id: string;
  coach_id: string;
  client_id: string;
  title: string;
  status: "utkast" | "skickat" | "kund_signerad" | "signerat" | "arkiverat";
  version_id: string;
  counterparty_type: "consumer" | "business" | null;
  coach_signed_at: string | null;
  withdrawal_deadline: string | null;
  early_performance_requested_at: string | null;
};

type SignatureRow = { contract_id: string; signer_role: "klient" | "coach" };

type WithdrawalRow = {
  id: string;
  contract_id: string;
  client_id: string;
  contract_version_id: string;
  contract_title: string;
  requester_name: string;
  receipt_email: string;
  withdrawal_deadline: string | null;
  requested_at: string;
};

type NotificationRow = {
  withdrawal_id: string;
  event_type: string;
  status: "pending" | "sending" | "sent" | "failed";
  attempt_count: number;
};

const COACH = "coach-cvb";
const KLARA = "client-klara";
const OLLE = "client-olle";

class Store {
  contracts: ContractRow[] = [];
  signatures: SignatureRow[] = [];
  withdrawals: WithdrawalRow[] = [];
  notifications: NotificationRow[] = [];
  clients: Record<string, { name: string; email: string }> = {
    [KLARA]: { name: "Klara Konsument", email: "klara@example.test" },
    [OLLE]: { name: "Olle Annan", email: "olle@example.test" },
  };
  currentClientId: string | null = null;
  currentCoachId: string | null = null;
  rpcCalls: string[] = [];
  seq = 0;

  reset() {
    Object.assign(this, new Store());
  }

  contract(overrides: Partial<ContractRow>): ContractRow {
    const row: ContractRow = {
      id: `contract-${++this.seq}`,
      coach_id: COACH,
      client_id: KLARA,
      title: "Individuell coaching",
      status: "signerat",
      version_id: `version-${this.seq}`,
      counterparty_type: "consumer",
      coach_signed_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      withdrawal_deadline: new Date(Date.now() + 10 * 86_400_000).toISOString(),
      early_performance_requested_at: null,
      ...overrides,
    };
    this.contracts.push(row);
    this.signatures.push({ contract_id: row.id, signer_role: "klient" });
    if (row.status === "signerat") this.signatures.push({ contract_id: row.id, signer_role: "coach" });
    return row;
  }

  /** Mirrors exercise_contract_withdrawal() in 20260930090000. */
  exercise(contractId: string) {
    const clientId = this.currentClientId;
    if (!clientId) return { error: "NOT_AUTHORIZED" };
    const row = this.contracts.find((c) => c.id === contractId);
    if (!row || row.client_id !== clientId) return { error: "CONTRACT_NOT_FOUND" };
    const existing = this.withdrawals.find((w) => w.contract_id === contractId);
    if (existing) {
      return { data: [{ withdrawal_id: existing.id, requested_at: existing.requested_at, already_withdrawn: true }] };
    }
    if (row.counterparty_type !== "consumer") return { error: "WITHDRAWAL_NOT_AVAILABLE" };
    const clientSigned = this.signatures.some((s) => s.contract_id === contractId && s.signer_role === "klient");
    if (!["kund_signerad", "signerat", "arkiverat"].includes(row.status) || !clientSigned) {
      return { error: "WITHDRAWAL_NOT_AVAILABLE" };
    }
    if (row.withdrawal_deadline && Date.now() >= new Date(row.withdrawal_deadline).getTime()) {
      return { error: "WITHDRAWAL_PERIOD_EXPIRED" };
    }
    const client = this.clients[clientId];
    const withdrawal: WithdrawalRow = {
      id: `withdrawal-${++this.seq}`,
      contract_id: contractId,
      client_id: clientId,
      contract_version_id: row.version_id,
      contract_title: row.title,
      requester_name: client.name,
      receipt_email: client.email,
      withdrawal_deadline: row.withdrawal_deadline,
      requested_at: new Date().toISOString(),
    };
    this.withdrawals.push(withdrawal);
    for (const event_type of ["client_withdrawal_receipt", "coach_withdrawal_notice"]) {
      this.notifications.push({ withdrawal_id: withdrawal.id, event_type, status: "pending", attempt_count: 0 });
    }
    return { data: [{ withdrawal_id: withdrawal.id, requested_at: withdrawal.requested_at, already_withdrawn: false }] };
  }

  /** Mirrors record_contract_withdrawal_notification_result(). */
  record(args: Record<string, unknown>) {
    const withdrawal = this.withdrawals.find((w) => w.id === args.p_withdrawal_id);
    if (!withdrawal) return { error: "NOT_AUTHORIZED" };
    const contract = this.contracts.find((c) => c.id === withdrawal.contract_id)!;
    const authorised = withdrawal.client_id === this.currentClientId || contract.coach_id === this.currentCoachId;
    if (!authorised) return { error: "NOT_AUTHORIZED" };
    const row = this.notifications.find(
      (n) => n.withdrawal_id === args.p_withdrawal_id && n.event_type === args.p_event_type,
    );
    if (!row) return { error: "NOTIFICATION_NOT_FOUND" };
    if (row.status === "sent") return {};
    row.status = args.p_status as NotificationRow["status"];
    if (row.status === "sending") row.attempt_count += 1;
    return {};
  }

  visibleContract(id: string) {
    const row = this.contracts.find((c) => c.id === id);
    if (!row) return null;
    const ownClient = row.client_id === this.currentClientId;
    const ownCoach = row.coach_id === this.currentCoachId;
    return ownClient || ownCoach ? row : null;
  }
}

const store = new Store();

function selectBuilder(table: string) {
  const filters: Array<[string, unknown]> = [];
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters.push([column, value]);
      return builder;
    },
    maybeSingle: async () => {
      if (table === "contracts") {
        const id = filters.find(([c]) => c === "id")?.[1] as string;
        const row = store.visibleContract(id);
        if (!row) return { data: null, error: null };
        const withdrawal = store.withdrawals.find((w) => w.contract_id === row.id) ?? null;
        return {
          data: {
            id: row.id,
            early_performance_requested_at: row.early_performance_requested_at,
            contract_withdrawals: withdrawal,
          },
          error: null,
        };
      }
      if (table === "contract_withdrawal_notifications") {
        const [withdrawalId, eventType] = [filters[0]?.[1], filters[1]?.[1]];
        const withdrawal = store.withdrawals.find((w) => w.id === withdrawalId);
        const contract = withdrawal && store.contracts.find((c) => c.id === withdrawal.contract_id);
        // Coach-only RLS on the ledger.
        if (!contract || contract.coach_id !== store.currentCoachId) return { data: null, error: null };
        const row = store.notifications.find((n) => n.withdrawal_id === withdrawalId && n.event_type === eventType);
        return { data: row ? { status: row.status } : null, error: null };
      }
      throw new Error(`Oväntad tabell i test: ${table}`);
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: (table: string) => selectBuilder(table),
    rpc: async (name: string, args: Record<string, unknown>) => {
      store.rpcCalls.push(name);
      if (name === "exercise_contract_withdrawal") {
        const result = store.exercise(String(args.p_contract_id));
        return result.error ? { data: null, error: { message: result.error } } : { data: result.data, error: null };
      }
      if (name === "record_contract_withdrawal_notification_result") {
        const result = store.record(args);
        return result.error ? { data: null, error: { message: result.error } } : { data: null, error: null };
      }
      throw new Error(`Oväntat RPC-anrop i test: ${name}`);
    },
  })),
}));

vi.mock("@/lib/portal/session", () => ({
  readClientSession: vi.fn(),
  readCoachSession: vi.fn(),
}));

vi.mock("@/lib/email/booking-provider", () => ({
  createResendBookingProvider: vi.fn(() => {
    throw new Error("Resend ska aldrig instansieras i test utan uttrycklig stub.");
  }),
}));

import { readClientSession, readCoachSession } from "@/lib/portal/session";
import { createResendBookingProvider } from "@/lib/email/booking-provider";
import { POST as withdrawPost } from "@/app/api/portal/avtal/[contractId]/angra/route";
import { POST as retryPost } from "@/app/api/portal/avtal/[contractId]/angra/skicka-om/route";
import { canShowWithdrawalFunction, formatWithdrawalLastDay } from "@/lib/portal/contract-withdrawal-rules";
import { buildWithdrawalEmail } from "@/lib/email/withdrawal-emails";
import ContractWorkspace from "@/components/portal/avtal/contract-workspace";
import type { Contract, ContractSignature } from "@/lib/portal/contracts";

const migration = readFileSync(
  new URL("../supabase/migrations/20260930090000_cvb_base_consumer_withdrawal.sql", import.meta.url),
  "utf-8",
);
const demoMigration = readFileSync(
  new URL("../supabase/migrations/20260930090100_cvb_base_contract_counterparty_demo.sql", import.meta.url),
  "utf-8",
);
const workspaceSource = readFileSync(
  new URL("../src/components/portal/avtal/contract-workspace.tsx", import.meta.url),
  "utf-8",
);

function sqlFunction(name: string): string {
  const start = migration.indexOf(`function public.${name}(`);
  expect(start, name).toBeGreaterThan(-1);
  const end = migration.indexOf("$$;", start);
  return migration.slice(start, end);
}

const originalEnv = { ...process.env };

function asClient(clientId: string) {
  store.currentClientId = clientId;
  store.currentCoachId = null;
  vi.mocked(readClientSession).mockResolvedValue({ userId: `user-${clientId}`, name: clientId, clientId });
  vi.mocked(readCoachSession).mockResolvedValue(null);
}

function asCoach() {
  store.currentClientId = null;
  store.currentCoachId = COACH;
  vi.mocked(readClientSession).mockResolvedValue(null);
  vi.mocked(readCoachSession).mockResolvedValue({ userId: "coach-user", name: "Carolina von Braun", coachId: COACH });
}

function withdraw(contractId: string, body?: unknown) {
  return withdrawPost(
    new Request("http://localhost/api/portal/avtal/x/angra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ contractId }) },
  );
}

function retry(contractId: string, eventType: string) {
  return retryPost(
    new Request("http://localhost/api/portal/avtal/x/angra/skicka-om", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType }),
    }),
    { params: Promise.resolve({ contractId }) },
  );
}

beforeEach(() => {
  store.reset();
  delete process.env.EMAIL_SEND_ENABLED;
  delete process.env.EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
  vi.mocked(readClientSession).mockReset();
  vi.mocked(readCoachSession).mockReset();
  vi.mocked(createResendBookingProvider).mockClear();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

// ------------------------------------------------------------------ 1. rule

const baseSubject = {
  status: "signerat" as const,
  counterpartyType: "consumer" as const,
  clientSignedAt: "2026-09-20T10:00:00Z",
  withdrawalDeadline: "2026-10-06T22:00:00Z",
  withdrawal: null,
};

describe("när ångerfunktionen visas", () => {
  const now = new Date("2026-10-01T12:00:00Z");

  it("visas för ett konsumentavtal inom ångerfristen", () => {
    expect(canShowWithdrawalFunction(baseSubject, now)).toBe(true);
  });

  it("visas aldrig för ett företagsavtal", () => {
    expect(canShowWithdrawalFunction({ ...baseSubject, counterpartyType: "business" }, now)).toBe(false);
  });

  it("visas inte för ett oklassificerat avtal", () => {
    expect(canShowWithdrawalFunction({ ...baseSubject, counterpartyType: null }, now)).toBe(false);
  });

  it("visas inte efter att fristen löpt ut", () => {
    expect(canShowWithdrawalFunction(baseSubject, new Date("2026-10-06T22:00:00Z"))).toBe(false);
  });

  it("visas inte när ångerrätten redan utövats", () => {
    expect(canShowWithdrawalFunction({ ...baseSubject, withdrawal: { requestedAt: "2026-09-30T08:00:00Z" } }, now)).toBe(false);
  });

  it("visas redan efter klientens egen signatur, innan fristen börjat", () => {
    expect(
      canShowWithdrawalFunction({ ...baseSubject, status: "kund_signerad", withdrawalDeadline: null }, now),
    ).toBe(true);
  });

  it("visas inte innan klienten har signerat", () => {
    expect(
      canShowWithdrawalFunction({ ...baseSubject, status: "skickat", clientSignedAt: null, withdrawalDeadline: null }, now),
    ).toBe(false);
  });

  it("visar fristens sista dag i svensk tid", () => {
    // Exclusive deadline = midnight Stockholm after the last day.
    expect(formatWithdrawalLastDay("2026-10-14T22:00:00Z")).toBe("14 oktober 2026");
  });
});

// ------------------------------------------------------------------ 2. rendered UI

function contract(overrides: Partial<Contract>): Contract {
  return {
    id: "c1",
    coachId: COACH,
    clientId: KLARA,
    clientName: "Klara Konsument",
    clientEmail: "klara@example.test",
    engagementId: null,
    templateId: null,
    title: "Individuell coaching hösten 2026",
    content: { sections: [{ id: "s", heading: "Omfattning", body: "Sex samtal." }], fields: [] },
    priceAmount: 12000,
    currency: "SEK",
    paymentTerms: null,
    status: "skickat",
    versionId: "v1",
    sentAt: "2026-09-20T08:00:00Z",
    clientSignedAt: null,
    coachSignedAt: null,
    lockedAt: null,
    counterpartyType: "consumer",
    withdrawalDeadline: null,
    earlyPerformanceRequestedAt: null,
    generalTermsVersion: "2026-10-01",
    withdrawal: null,
    createdAt: "2026-09-19T08:00:00Z",
    updatedAt: "2026-09-20T08:00:00Z",
    ...overrides,
  };
}

const signatures: ContractSignature[] = [
  { id: "sig-k", contractId: "c1", signerRole: "klient", signerName: "Klara Konsument", signerEmail: "klara@example.test", contractVersionId: "v1", signedAt: "2026-09-21T09:00:00Z" },
  { id: "sig-c", contractId: "c1", signerRole: "coach", signerName: "Carolina von Braun", signerEmail: "c@example.test", contractVersionId: "v1", signedAt: "2026-09-22T09:00:00Z" },
];

function renderWorkspace(value: Contract, viewerRole: "coach" | "klient", sigs: ContractSignature[] = []) {
  return renderToStaticMarkup(
    createElement(ContractWorkspace, { initialContract: value, initialSignatures: sigs, viewerRole }),
  );
}

const future = () => new Date(Date.now() + 5 * 86_400_000).toISOString();
const past = () => new Date(Date.now() - 1000).toISOString();

describe("avtalsvyn", () => {
  it("klienten måste fortfarande kryssa i ett uttryckligt godkännande innan signering", () => {
    const html = renderWorkspace(contract({}), "klient");
    expect(html).toContain("Jag har läst och godkänner avtalet samt tillämpliga");
    // The consent box starts unticked and the sign button starts disabled.
    expect(html).not.toMatch(/<input[^>]*type="checkbox"[^>]*checked/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Signera avtal<\/button>/);
    expect(workspaceSource).toContain("disabled={!consent || signState === \"signing\"}");
  });

  it("länkar till exakt den fastlåsta villkorsversionen i en ny flik så att signeringsläget behålls", () => {
    const html = renderWorkspace(contract({}), "klient");
    expect(html).toMatch(/<a href="\/villkor\/2026-10-01" target="_blank" rel="noopener noreferrer"[^>]*>allmänna villkor för CVB Coaching<\/a>/);
    expect(html.replace(/<!-- -->/g, "")).toContain("(version 2026-10-01)");
  });

  it("konsumentavtal: informerar om ångerrätt och erbjuder tidig start som ett separat, frivilligt val", () => {
    const html = renderWorkspace(contract({}), "klient");
    expect(html).toContain("Det här är ett konsumentavtal.");
    expect(html).toContain("Jag begär att coachingen påbörjas under ångerfristen");
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(2);
    expect(workspaceSource).toContain("const [earlyStart, setEarlyStart] = useState(false);");
    expect(workspaceSource).toContain("requestEarlyPerformance: viewerRole === \"klient\" && earlyStart");
  });

  it("företagsavtal: ingen ångerrättsinformation och ingen tidig start", () => {
    const html = renderWorkspace(contract({ counterpartyType: "business" }), "klient");
    expect(html).not.toContain("Ångerrätt");
    expect(html).not.toContain("påbörjas under ångerfristen");
    expect(html).toContain("Företagsavtal");
  });

  it("oklassificerat skickat avtal kan inte signeras förrän avtalstypen är angiven", () => {
    const html = renderWorkspace(contract({ counterpartyType: null }), "klient");
    expect(html).toContain("Avtalet kan signeras när Carolina har bekräftat avtalstypen.");
    expect(html).not.toContain("Signera avtal");
  });

  it("B2B får ingen ångerfunktion, inte ens inom 14 dagar", () => {
    const html = renderWorkspace(
      contract({ counterpartyType: "business", status: "signerat", clientSignedAt: signatures[0].signedAt, coachSignedAt: signatures[1].signedAt }),
      "klient",
      signatures,
    );
    expect(html).not.toContain("Ångra avtalet här");
    expect(html).not.toContain("Ångra avtal<");
  });

  it("B2C på distans inom fristen visar Ångra avtalet här", () => {
    const html = renderWorkspace(
      contract({ status: "signerat", clientSignedAt: signatures[0].signedAt, coachSignedAt: signatures[1].signedAt, withdrawalDeadline: future() }),
      "klient",
      signatures,
    );
    expect(html).toContain(">Ångra avtal</h2>");
    expect(html).toContain(">Ångra avtalet här</button>");
  });

  it("B2C efter fristen visar ingen ångerfunktion", () => {
    const html = renderWorkspace(
      contract({ status: "signerat", clientSignedAt: signatures[0].signedAt, coachSignedAt: signatures[1].signedAt, withdrawalDeadline: past() }),
      "klient",
      signatures,
    );
    expect(html).not.toContain("Ångra avtalet här");
  });

  it("coachen ser aldrig ångerfunktionen", () => {
    const html = renderWorkspace(
      contract({ status: "signerat", clientSignedAt: signatures[0].signedAt, coachSignedAt: signatures[1].signedAt, withdrawalDeadline: future() }),
      "coach",
      signatures,
    );
    expect(html).not.toContain("Ångra avtalet här");
    expect(html).toContain("Konsumentavtal · ångerfristens sista dag");
  });

  it("ångrat avtal: signaturerna visas kvar som historik tillsammans med ångerregistreringen", () => {
    const withdrawal = {
      id: "w1",
      requestedAt: "2026-09-25T10:15:00Z",
      withdrawalDeadline: null,
      requesterName: "Klara Konsument",
      receiptEmail: "klara@example.test",
    };
    for (const role of ["klient", "coach"] as const) {
      const html = renderWorkspace(
        contract({ status: "signerat", clientSignedAt: signatures[0].signedAt, coachSignedAt: signatures[1].signedAt, withdrawal }),
        role,
        signatures,
      );
      expect(html).toContain("SIGNERAT");
      expect(html).toContain("Klara Konsument");
      expect(html).toContain("Carolina von Braun");
      expect(html).toContain("Ångerrätten har utövats");
      expect(html).toContain(">Ångrat<");
      expect(html).not.toContain("Ångra avtalet här");
    }
  });

  it("coachen kan inte kontrasignera ett avtal som klienten redan ångrat", () => {
    const withdrawal = { id: "w1", requestedAt: "2026-09-25T10:15:00Z", withdrawalDeadline: null, requesterName: "Klara Konsument", receiptEmail: "klara@example.test" };
    const html = renderWorkspace(
      contract({ status: "kund_signerad", clientSignedAt: signatures[0].signedAt, withdrawal }),
      "coach",
      [signatures[0]],
    );
    expect(html).not.toContain(">Signera avtal</button>");
  });

  it("coachen måste välja avtalstyp innan ett utkast kan skickas", () => {
    const html = renderWorkspace(contract({ status: "utkast", counterpartyType: null }), "coach");
    expect(html).toContain("Avtalstyp");
    expect(html).toContain("Konsumentavtal");
    expect(html).toContain("Företagsavtal");
    expect(html).not.toMatch(/name="counterpartyType"[^>]*checked/);
  });
});

// ------------------------------------------------------------------ 3. routes

describe("ångerroute: behörighet", () => {
  it("coachen kan inte utöva klientens ångerrätt", async () => {
    const row = store.contract({});
    asCoach();
    const response = await withdraw(row.id);
    expect(response.status).toBe(403);
    expect(store.rpcCalls).not.toContain("exercise_contract_withdrawal");
    expect(store.withdrawals).toHaveLength(0);
  });

  it("en annan klient kan inte ångra avtalet", async () => {
    const row = store.contract({});
    asClient(OLLE);
    const response = await withdraw(row.id);
    expect(response.status).toBe(404);
    expect(store.withdrawals).toHaveLength(0);
  });

  it("utan session nekas anropet", async () => {
    const row = store.contract({});
    vi.mocked(readClientSession).mockResolvedValue(null);
    const response = await withdraw(row.id);
    expect(response.status).toBe(403);
    expect(store.withdrawals).toHaveLength(0);
  });
});

describe("ångerroute: regler", () => {
  it("registrerar en ångring för ett konsumentavtal inom fristen", async () => {
    const row = store.contract({});
    asClient(KLARA);
    const response = await withdraw(row.id);
    const body = (await response.json()) as { ok: boolean; withdrawal: { requestedAt: string; alreadyWithdrawn: boolean } };
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.withdrawal.alreadyWithdrawn).toBe(false);
    expect(store.withdrawals).toHaveLength(1);
    expect(store.withdrawals[0]).toMatchObject({
      contract_id: row.id,
      client_id: KLARA,
      contract_version_id: row.version_id,
      requester_name: "Klara Konsument",
      receipt_email: "klara@example.test",
    });
  });

  it("B2B-avtal nekas", async () => {
    const row = store.contract({ counterparty_type: "business" });
    asClient(KLARA);
    const response = await withdraw(row.id);
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: string }).error).toContain("gäller inte");
    expect(store.withdrawals).toHaveLength(0);
  });

  it("ångring efter fristen nekas", async () => {
    const row = store.contract({ withdrawal_deadline: past() });
    asClient(KLARA);
    const response = await withdraw(row.id);
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: string }).error).toContain("löpt ut");
    expect(store.withdrawals).toHaveLength(0);
  });

  it("fristen avgörs server-side — en tidsgräns i anropet ignoreras", async () => {
    const row = store.contract({ withdrawal_deadline: past() });
    asClient(KLARA);
    const response = await withdraw(row.id, { withdrawalDeadline: "2099-01-01T00:00:00Z", requestedAt: "2020-01-01" });
    expect(response.status).toBe(409);
    expect(store.withdrawals).toHaveLength(0);
  });

  it("dubbel ångring är idempotent: samma post, inga nya mejl", async () => {
    const row = store.contract({});
    asClient(KLARA);
    const first = (await (await withdraw(row.id)).json()) as { withdrawal: { requestedAt: string } };
    const attempts = store.notifications.map((n) => n.attempt_count);
    const second = (await (await withdraw(row.id)).json()) as { withdrawal: { requestedAt: string; alreadyWithdrawn: boolean } };
    expect(second.withdrawal.alreadyWithdrawn).toBe(true);
    expect(second.withdrawal.requestedAt).toBe(first.withdrawal.requestedAt);
    expect(store.withdrawals).toHaveLength(1);
    expect(store.notifications).toHaveLength(2);
    expect(store.notifications.map((n) => n.attempt_count)).toEqual(attempts);
  });

  it("signaturhistoriken och avtalsstatus består efter ångring", async () => {
    const row = store.contract({});
    const before = JSON.stringify(store.signatures);
    asClient(KLARA);
    await withdraw(row.id);
    expect(JSON.stringify(store.signatures)).toBe(before);
    expect(store.contracts.find((c) => c.id === row.id)?.status).toBe("signerat");
  });

  it("kvitto och notis skickas via befintlig outbox (simulerat läge lokalt)", async () => {
    const row = store.contract({});
    asClient(KLARA);
    await withdraw(row.id);
    expect(store.notifications.map((n) => [n.event_type, n.status])).toEqual([
      ["client_withdrawal_receipt", "sent"],
      ["coach_withdrawal_notice", "sent"],
    ]);
    expect(createResendBookingProvider).not.toHaveBeenCalled();
  });
});

describe("ångerroute: e-post som misslyckas", () => {
  beforeEach(() => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <no-reply@example.test>";
    process.env.RESEND_API_KEY = "test";
  });

  it("den registrerade ångringen kvarstår och svaret är ok även när alla utskick misslyckas", async () => {
    const send = vi.fn(async () => {
      throw Object.assign(new Error("provider down"), { code: "provider_down" });
    });
    vi.mocked(createResendBookingProvider).mockReturnValue({ send });
    const row = store.contract({});
    asClient(KLARA);
    const response = await withdraw(row.id);
    expect(response.status).toBe(200);
    expect(((await response.json()) as { ok: boolean }).ok).toBe(true);
    expect(store.withdrawals).toHaveLength(1);
    expect(store.notifications.every((n) => n.status === "failed")).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("använder deterministiska idempotensnycklar och svarsadress till operatören", async () => {
    const send = vi.fn(async () => ({ id: "msg" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send });
    const row = store.contract({});
    asClient(KLARA);
    await withdraw(row.id);
    const withdrawalId = store.withdrawals[0].id;
    const calls = send.mock.calls as unknown as Array<[{ to: string; idempotencyKey: string; subject: string; replyTo?: string }]>;
    expect(calls.map(([payload]) => payload.idempotencyKey)).toEqual([
      `cvb-contract-withdrawal/${withdrawalId}/client_withdrawal_receipt`,
      `cvb-contract-withdrawal/${withdrawalId}/coach_withdrawal_notice`,
    ]);
    expect(calls[0][0].to).toBe("klara@example.test");
    expect(calls[0][0].subject).toContain("Mottagningsbevis");
    expect(calls[1][0].replyTo).toBeUndefined();
  });

  it("coachen kan skicka om ett misslyckat kvitto; ett skickat skickas inte igen", async () => {
    const failing = vi.fn(async () => {
      throw new Error("down");
    });
    vi.mocked(createResendBookingProvider).mockReturnValue({ send: failing });
    const row = store.contract({});
    asClient(KLARA);
    await withdraw(row.id);

    const ok = vi.fn(async () => ({ id: "msg-2" }));
    vi.mocked(createResendBookingProvider).mockReturnValue({ send: ok });
    asCoach();
    const first = await retry(row.id, "client_withdrawal_receipt");
    expect(((await first.json()) as { ok: boolean }).ok).toBe(true);
    expect(store.notifications.find((n) => n.event_type === "client_withdrawal_receipt")?.status).toBe("sent");

    const again = await retry(row.id, "client_withdrawal_receipt");
    expect(again.status).toBe(409);
    expect(ok).toHaveBeenCalledTimes(1);
    expect(store.withdrawals).toHaveLength(1);
  });

  it("omskick kräver coachsession", async () => {
    const row = store.contract({});
    asClient(KLARA);
    await withdraw(row.id);
    const response = await retry(row.id, "client_withdrawal_receipt");
    expect(response.status).toBe(401);
  });
});

describe("mottagningsbevis", () => {
  const context = {
    withdrawalId: "w1",
    contractId: "c1",
    contractTitle: "Individuell coaching hösten 2026",
    contractVersionId: "v1",
    clientName: "Klara Konsument",
    receiptEmail: "klara@example.test",
    requestedAt: "2026-09-30T08:15:00Z",
    withdrawalDeadline: "2026-10-14T22:00:00Z",
    earlyPerformanceRequestedAt: null,
  };

  it("innehåller begärans innehåll och tidpunkt, utan marknadsföring", () => {
    const email = buildWithdrawalEmail("client_withdrawal_receipt", context);
    expect(email.body).toContain("Vi har tagit emot din begäran att ångra avtalet Individuell coaching hösten 2026.");
    expect(email.body).toContain("Begäran registrerades 30 september 2026 kl. 10:15:00 (svensk tid).");
    expect(email.body).toContain("Namn: Klara Konsument");
    expect(email.body).toContain("Avtals-ID: c1");
    expect(email.body).toContain("Ångerfristens sista dag: 14 oktober 2026");
    expect(email.body).not.toMatch(/\bAI\b|erbjudande|nyhetsbrev|rabatt/i);
  });

  it("notisen till Carolina anger klient, avtal och tidpunkt", () => {
    const email = buildWithdrawalEmail("coach_withdrawal_notice", context);
    expect(email.subject).toBe("Avtal ångrat: Individuell coaching hösten 2026");
    expect(email.body).toContain("Klara Konsument har utövat ångerrätten");
  });
});

// ------------------------------------------------------------------ 4. SQL contract

describe("SQL-kontrakt", () => {
  it("klassificeringen är en uttrycklig kolumn per avtal, utan generell backfill", () => {
    expect(migration).toContain("create type public.contract_counterparty_type as enum ('consumer', 'business');");
    expect(migration).toContain("add column counterparty_type public.contract_counterparty_type,");
    // Only the RPC sets it, from its argument — never a literal backfill.
    expect(migration).not.toMatch(/set counterparty_type\s*=\s*'/i);
    // Never derived from the client's organisation (comments aside).
    expect(migration.replace(/--.*$/gm, "")).not.toContain("organisation_id");
  });

  it("demobackfillen ligger i en separat migration och rör bara namngivna demoavtal", () => {
    expect(demoMigration).toContain("DEMO DATA ONLY");
    expect(demoMigration).toContain("where counterparty_type is null");
    expect(demoMigration).toContain("coach_id = '289fc70a-53be-5bda-87de-d2fcc55f79c5'");
    expect(demoMigration).not.toContain("'consumer'");
  });

  it("ett avtal kan inte skickas oklassificerat", () => {
    expect(sqlFunction("send_contract_for_signature")).toContain("raise exception 'COUNTERPARTY_TYPE_REQUIRED'");
  });

  it("fristen räknas server-side från coachens signatur, när avtalet ingås", () => {
    const coach = sqlFunction("sign_contract_as_coach");
    expect(coach).toContain("when v_row.counterparty_type = 'consumer' then public.contract_withdrawal_deadline(v_now)");
    expect(coach).toContain("raise exception 'CONTRACT_WITHDRAWN'");
    const deadline = sqlFunction("contract_withdrawal_deadline");
    expect(deadline).toContain("at time zone 'Europe/Stockholm')::date + 14");
    expect(deadline).toContain("while public.swedish_non_business_day(v_last_day) loop");
  });

  it("tidig start registreras bara som klientens separata val och bara för konsumentavtal", () => {
    const client = sqlFunction("sign_contract_as_client");
    expect(client).toContain("p_request_early_performance boolean default false");
    expect(client).toContain(
      "when v_row.counterparty_type = 'consumer' and coalesce(p_request_early_performance, false) then now()",
    );
  });

  it("ångerfunktionen: bara klienten, bara egna avtal, bara konsument, inom fristen, idempotent", () => {
    const fn = sqlFunction("exercise_contract_withdrawal");
    expect(fn).toContain("v_client_id := public.current_client_id();");
    expect(fn).toContain("raise exception 'NOT_AUTHORIZED'");
    expect(fn).toContain("if v_row.id is null or v_row.client_id <> v_client_id then");
    expect(fn).toContain("if v_row.counterparty_type is distinct from 'consumer' then");
    expect(fn).toContain("raise exception 'WITHDRAWAL_PERIOD_EXPIRED'");
    expect(fn).toContain("already_withdrawn := true;");
    expect(fn).toContain("for update;");
  });

  it("ångring raderar eller muterar aldrig avtal eller signaturer", () => {
    const fn = sqlFunction("exercise_contract_withdrawal");
    expect(fn).not.toMatch(/delete from/i);
    expect(fn).not.toMatch(/update public\.contracts/i);
    expect(fn).not.toMatch(/contract_signatures\s+set/i);
    expect(migration).toContain("contract_id uuid not null unique references public.contracts(id) on delete restrict");
    expect(migration).toContain("create trigger contract_withdrawals_no_update");
  });

  it("utskicksraderna skrivs i samma transaktion som ångringen", () => {
    const fn = sqlFunction("exercise_contract_withdrawal");
    expect(fn.indexOf("insert into public.contract_withdrawals")).toBeLessThan(
      fn.indexOf("insert into public.contract_withdrawal_notifications"),
    );
  });

  it("RLS och privilegier: anon når inget, ingen skrivrätt till revisionsspåret", () => {
    for (const table of ["contract_withdrawals", "contract_withdrawal_notifications"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toContain(`grant select on table public.${table} to authenticated;`);
      expect(migration).not.toMatch(new RegExp(`grant (insert|update|delete)[^;]*${table}`));
    }
    expect(migration).not.toMatch(/grant [^;]* to anon/);
    for (const fn of [
      "exercise_contract_withdrawal(uuid)",
      "record_contract_withdrawal_notification_result(uuid, text, text, text, text, text, text)",
      "set_contract_counterparty_type(uuid, public.contract_counterparty_type)",
      "sign_contract_as_client(uuid, uuid, boolean)",
    ]) {
      expect(migration).toContain(`revoke execute on function public.${fn} from public, anon;`);
    }
  });

  it("varje SECURITY DEFINER-funktion låser search_path", () => {
    const definers = migration.split("create or replace function").slice(1).filter((body) => body.includes("security definer"));
    expect(definers.length).toBeGreaterThanOrEqual(6);
    for (const body of definers) {
      expect(body.slice(0, body.indexOf("as $$"))).toContain("set search_path = public");
    }
  });

  it("inga signerings- eller ångerkolumner kan skrivas direkt av inloggade roller", () => {
    const grants = migration.match(/grant (insert|update) \(([^)]*)\) on table public\.contracts/g) ?? [];
    const columns = grants.join(" ");
    for (const column of ["status", "withdrawal_deadline", "early_performance_requested_at", "client_signed_at", "coach_signed_at", "locked_at", "version_id"]) {
      expect(columns).not.toMatch(new RegExp(`\\b${column}\\b`));
    }
  });
});
