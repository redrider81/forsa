import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Legal integrity corrections:
 *
 *   A. After a withdrawn article 9 consent, consent-scoped content written up
 *      to the withdrawal is restricted (not used by Carolina, AI or any app
 *      function — the client keeps access), the client can request erasure,
 *      Carolina carries it out, and the consent audit survives. Re-granting
 *      resumes normal processing.
 *   B. The general terms version is pinned to the contract when sent,
 *      confirmed at client signing, and the confirmation renders exactly
 *      that version even if "current" has moved on.
 *
 * The restriction is exercised through the real read path
 * (fetchPortalRepositoryData) against an in-memory Supabase double; the SQL
 * predicates are asserted against the migration so the two cannot drift.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
  usePathname: () => "/klient/profil",
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));
vi.mock("@/components/animations/HeroReveal", () => ({
  default: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

// "Current" terms move to a newer version in some tests; the registry itself is real.
const termsState = { current: "2026-10-01" };
vi.mock("@/lib/legal/terms-versions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/legal/terms-versions")>();
  return {
    ...actual,
    get CURRENT_GENERAL_TERMS_VERSION() {
      return termsState.current;
    },
  };
});

type Row = Record<string, unknown>;
const db: { tables: Record<string, Row[]>; rpc: Array<{ name: string; args: Row }> } = { tables: {}, rpc: [] };

function query(table: string) {
  const filters: Array<(row: Row) => boolean> = [];
  const result = () => (db.tables[table] ?? []).filter((row) => filters.every((f) => f(row)));
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
    order: () => builder,
    maybeSingle: async () => ({ data: result()[0] ?? null, error: null }),
    single: async () => ({ data: result()[0] ?? null, error: null }),
    then(resolve: (value: { data: Row[]; error: null }) => unknown) {
      return Promise.resolve({ data: result(), error: null }).then(resolve);
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: (table: string) => query(table),
    rpc: async (name: string, args: Row = {}) => {
      db.rpc.push({ name, args });
      if (name === "read_session_preparations") return { data: db.tables.session_preparations ?? [], error: null };
      if (name === "read_commitment_client_notes") {
        const rows = (db.tables.commitments ?? []).filter((c) => c.client_note);
        return { data: rows.map((c) => ({ commitment_id: c.id, client_note: c.client_note })), error: null };
      }
      if (name === "record_contract_confirmation_result") {
        const row = db.tables.contract_confirmation_notifications?.[0];
        if (row && row.status !== "sent") {
          row.status = args.p_status;
          row.rendered_subject ??= args.p_rendered_subject ?? null;
          row.rendered_body ??= args.p_rendered_body ?? null;
          row.terms_version ??= args.p_terms_version ?? null;
        }
      }
      return { data: null, error: null };
    },
  })),
}));

vi.mock("@/lib/portal/session", () => ({
  readSession: vi.fn(),
  readCoachSession: vi.fn(),
  readClientSession: vi.fn(),
}));

import { readClientSession, readCoachSession, readSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import { buildClientContext } from "@/lib/ai/context";
import {
  canRequestErasure,
  consentState,
  restrictionCutoff,
} from "@/lib/portal/special-category-consent-rules";
import SpecialCategoryConsentCard from "@/components/klient/special-category-consent-card";
import { POST as consentPost } from "@/app/api/klient/samtycke/route";
import { POST as erasePost } from "@/app/api/portal/klienter/[clientId]/kansliga-uppgifter/radera/route";
import { generalTermsDocument, termsDocument } from "@/lib/legal/content/terms";
import { GENERAL_TERMS_VERSIONS } from "@/lib/legal/terms-versions";
import { sendContractForSignature } from "@/lib/portal/contracts";
import { dispatchContractConfirmation } from "@/lib/portal/contract-confirmation";
import { POST as signPost } from "@/app/api/portal/avtal/[contractId]/signera/route";
import VersionedTermsPage, {
  generateMetadata as versionedTermsMetadata,
  generateStaticParams as versionedTermsParams,
} from "@/app/villkor/[version]/page";

const postWithdrawalSql = readFileSync(
  new URL("../supabase/migrations/20261001100000_cvb_base_special_category_post_withdrawal.sql", import.meta.url),
  "utf-8",
);
const termsSql = readFileSync(
  new URL("../supabase/migrations/20261001100100_cvb_base_contract_terms_version.sql", import.meta.url),
  "utf-8",
);
const repositorySource = readFileSync(new URL("../src/lib/portal/repository.ts", import.meta.url), "utf-8");
const cardSource = readFileSync(
  new URL("../src/components/klient/special-category-consent-card.tsx", import.meta.url),
  "utf-8",
);

const COACH = "coach-1";
const CLIENT = "client-1";
const SESSION = "session-1";
const T = "2026-09-30T12:00:00.000Z";
const BEFORE = "2026-09-20T10:00:00.000Z";
const AFTER = "2026-10-01T10:00:00.000Z";

const json = (body: unknown) =>
  new Request("http://localhost/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/** A minimal but complete CVB Base snapshot for one private client. */
function seedPortal(consents: Row[]) {
  db.tables = {
    coaches: [{ id: COACH, name: "Carolina von Braun", title: "Coach", initials: "CvB", email: "c@example.test", credential: "ICF", focus: "" }],
    organisations: [],
    engagements: [{
      id: "eng-1", organisation_id: null, coach_id: COACH, title: "Individuell coaching", kind: "individuell",
      kind_label: "Individuell", purpose: "", scope_note: "", period_label: "", start_date: "2026-09-01",
      end_date: "2026-12-01", status: "pagaende", sponsor_reporting: "", next_review_label: null, next_review_date: null,
    }],
    milestones: [],
    clients: [{
      id: CLIENT, engagement_id: "eng-1", organisation_id: null, name: "Klara", initials: "K", role: "Privatperson",
      email: "k@example.test", phone: "", headline: "", started_at: "2026-09-01", depth: "full",
      recurring_themes: ["THEME"], status: "aktiv",
    }],
    coaching_agreements: [{ client_id: CLIENT, agreed_at: "2026-09-01", purpose: "AGREEMENT", scope: "", cadence: "", confidentiality: "", sponsor_sharing: "", ethics: "", client_responsibility: "" }],
    development_goals: [{ client_id: CLIENT, headline: "GOAL-HEADLINE", client_wording: "WORDING", baseline: "BASELINE", success_criteria: [], horizon: "" }],
    sessions: [{
      id: SESSION, client_id: CLIENT, number: 1, date: "2026-09-20", time: "10:00", duration_minutes: 60,
      status: "genomford", client_focus: "FOCUS", desired_outcome: "OUTCOME", location: "", created_at: BEFORE, updated_at: AFTER, focus_written_at: BEFORE,
    }],
    session_summaries: [{ session_id: SESSION, focus: "SUMMARY", insights: [], awareness: "", new_perspectives: [], commitments: [], follow_up: [], possible_next_focus: "", approved: true, approved_at: BEFORE }],
    session_coach_notes: [{ session_id: SESSION, coach_id: COACH, notes: "COACH-NOTE", created_at: BEFORE, updated_at: AFTER }],
    session_preparations: [{ id: "prep-1", client_id: CLIENT, session_id: null, focus: "PREP", desired_outcome: "", changed: "", follow_up: "COACH-FOLLOW-UP-AFTER", updated_at: AFTER, client_saved_at: BEFORE, follow_up_author: "klient", follow_up_saved_at: BEFORE }],
    reflections: [
      { id: "r-before", client_id: CLIENT, session_id: null, date: "2026-09-20", prompt: "", text: "REFLECTION-BEFORE", created_at: BEFORE },
      { id: "r-after", client_id: CLIENT, session_id: null, date: "2026-10-01", prompt: "", text: "REFLECTION-AFTER", created_at: AFTER },
    ],
    insights: [{ id: "i-1", client_id: CLIENT, session_id: SESSION, date: "2026-09-20", text: "INSIGHT", created_at: BEFORE }],
    commitments: [{ id: "c-1", client_id: CLIENT, session_id: SESSION, date: "2026-09-20", text: "COMMITMENT", due_label: "", status: "oppet", client_note: "CLIENT-NOTE", completed_at: null, created_at: BEFORE, updated_at: AFTER }],
    documents: [],
    materials: [],
    special_category_consents: consents,
  };
}

const GRANTED = "2026-09-01T08:00:00.000Z";
const REGRANTED = "2026-09-30T18:00:00.000Z";
const withdrawn = [{ client_id: CLIENT, granted_at: GRANTED, withdrawn_at: T }];
const regranted = [
  { client_id: CLIENT, granted_at: GRANTED, withdrawn_at: T },
  { client_id: CLIENT, granted_at: REGRANTED, withdrawn_at: null },
];
const activeOnly = [{ client_id: CLIENT, granted_at: GRANTED, withdrawn_at: null }];

function textOf(data: Awaited<ReturnType<typeof fetchPortalRepositoryData>>): string {
  return JSON.stringify(data);
}

const RESTRICTED_SOURCES = [
  "REFLECTION-BEFORE",
  "INSIGHT",
  "COMMITMENT",
  "CLIENT-NOTE",
  "PREP",
  "COACH-NOTE",
  "SUMMARY",
  "FOCUS",
  "OUTCOME",
  "WORDING",
  "BASELINE",
  "THEME",
];

beforeEach(() => {
  db.tables = {};
  db.rpc = [];
  termsState.current = "2026-10-01";
  vi.mocked(readClientSession).mockReset();
  vi.mocked(readCoachSession).mockReset();
  vi.mocked(readSession).mockReset();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ================================================================== A. ARTICLE 9

describe("samtyckesläge", () => {
  it("none / active / withdrawn och cutoff = senaste återkallelse", () => {
    expect(consentState([])).toBe("none");
    expect(consentState([{ withdrawnAt: null }])).toBe("active");
    expect(consentState([{ withdrawnAt: T }])).toBe("withdrawn");
    expect(restrictionCutoff([{ withdrawnAt: BEFORE }, { withdrawnAt: T }])).toBe(T);
    expect(restrictionCutoff([{ withdrawnAt: T }, { withdrawnAt: null }])).toBeNull();
  });

  it("radering kan begäras först efter återkallelse, en gång per återkallelse", () => {
    expect(canRequestErasure([{ withdrawnAt: null }], [])).toBe(false);
    expect(canRequestErasure([{ withdrawnAt: T }], [])).toBe(true);
    expect(canRequestErasure([{ withdrawnAt: T }], [{ id: "e", cutoff: T, requestedAt: AFTER, completedAt: null }])).toBe(false);
    expect(canRequestErasure([{ withdrawnAt: T }], [{ id: "e", cutoff: T, requestedAt: AFTER, completedAt: AFTER }])).toBe(false);
  });
});

describe("begränsning efter återkallat samtycke — den gemensamma läsvägen", () => {
  it("aktivt samtycke → normal behandling, inget begränsas", async () => {
    seedPortal(activeOnly);
    const text = textOf(await fetchPortalRepositoryData());
    for (const source of RESTRICTED_SOURCES) expect(text, source).toContain(source);
  });

  it("återkallat → innehåll fram till återkallelsen används inte av coach, AI eller appens funktioner", async () => {
    seedPortal(withdrawn);
    const data = await fetchPortalRepositoryData();
    const text = textOf(data);
    for (const source of RESTRICTED_SOURCES) expect(text, source).not.toContain(source);
    // Client content written after the withdrawal stays private (no consent window);
    // the session itself stays as an appointment.
    expect(text).not.toContain("REFLECTION-AFTER");
    expect(data.sessions.find((s) => s.id === SESSION)).toBeDefined();
    // Framework that is not consent-scoped stays.
    expect(text).toContain("GOAL-HEADLINE");
    expect(text).toContain("AGREEMENT");
  });

  it("coachens senare ändring i förberedelsen gör inte gammalt klientinnehåll synligt igen", async () => {
    seedPortal(withdrawn);
    const data = await fetchPortalRepositoryData();
    expect(textOf(data)).not.toContain("COACH-FOLLOW-UP-AFTER");
    expect(textOf(data)).not.toContain("PREP");
  });

  it("klienten behåller tillgång till sitt eget innehåll (rätt till tillgång)", async () => {
    seedPortal(withdrawn);
    const text = textOf(await fetchPortalRepositoryData({ viewer: "klient" }));
    expect(text).toContain("REFLECTION-BEFORE");
    expect(text).toContain("PREP");
  });

  it("standard är begränsad vy — bara klientportalen anger viewer: klient", () => {
    expect(repositorySource).toContain('if (options.viewer !== "klient") {');
    for (const page of ["page", "profil/page", "sessioner/page", "infor-nasta-samtal/page", "reflektioner/page", "material/page"]) {
      const src = readFileSync(new URL(`../src/app/klient/${page}.tsx`, import.meta.url), "utf-8");
      expect(src, page).toContain('fetchPortalRepositoryData({ viewer: "klient" })');
    }
  });

  it("AI förblir blockerad efter återkallelse — även för nytt innehåll", async () => {
    seedPortal(withdrawn);
    const data = await fetchPortalRepositoryData();
    const context = buildClientContext(COACH, CLIENT, undefined, { includeCoachNotes: true, specialCategoryConsent: false }, data)!;
    expect(context.text).not.toContain("REFLECTION-BEFORE");
    expect(context.text).not.toContain("REFLECTION-AFTER");
    expect(context.text).not.toContain("COACH-NOTE");
  });

  it("nytt samtycke efter återkallelse → behandlingen återupptas", async () => {
    seedPortal(regranted);
    const text = textOf(await fetchPortalRepositoryData());
    for (const source of RESTRICTED_SOURCES) expect(text, source).toContain(source);
  });

  it("predikaten i läsvägen är desamma som i raderingsfunktionen", () => {
    const pairs: Array<[string, string]> = [
      ["delete from public.reflections where client_id = p_client_id and created_at <= v_cutoff;", "!restricted(row.client_id, row.created_at) && clientShared(row.client_id, row.created_at)"],
      ["delete from public.insights where client_id = p_client_id and created_at <= v_cutoff;", "!restricted(row.client_id, row.created_at) && aiAllowed(row.client_id, row.created_at)"],
      ["delete from public.commitments where client_id = p_client_id and created_at <= v_cutoff;", ".filter((row) => !restricted(row.client_id, row.created_at) && aiAllowed(row.client_id, row.created_at))"],
      ["coalesce(client_saved_at, '-infinity'::timestamptz) <= v_cutoff", "!restricted(row.client_id, row.client_saved_at) && clientShared(row.client_id, row.client_saved_at);"],
      ["n.created_at <= v_cutoff", "return !restricted(clientId, row.created_at) && aiAllowed(clientId, row.created_at);"],
      ["(m.approved_at is null or m.approved_at <= v_cutoff)", "return !restricted(clientId, row.approved_at) && aiAllowed(clientId, row.approved_at);"],
      ["where client_id = p_client_id and created_at <= v_cutoff;\n\n  update public.development_goals", "restricted(row.client_id, row.created_at) || !aiAllowed(row.client_id, row.focus_written_at)"],
      ["set client_wording = '', baseline = ''", "{ ...row, client_wording: \"\", baseline: \"\" }"],
      ["set recurring_themes = '{}'", "{ ...row, recurring_themes: [] }"],
    ];
    for (const [sql, ts] of pairs) {
      expect(postWithdrawalSql, sql).toContain(sql);
      expect(repositorySource, ts).toContain(ts);
    }
  });
});

describe("radering — begäran och genomförande", () => {
  it("klienten begär radering via sin egen session", async () => {
    vi.mocked(readClientSession).mockResolvedValue({ userId: "u", name: "Klara", clientId: CLIENT });
    db.tables = { special_category_consents: [], special_category_erasure_requests: [] };
    const response = await consentPost(json({ action: "request_erasure" }));
    expect(response.status).toBe(200);
    expect(db.rpc.map((c) => c.name)).toContain("request_special_category_erasure");
  });

  it("coach kan inte begära åt klienten och klient kan inte genomföra", async () => {
    vi.mocked(readClientSession).mockResolvedValue(null);
    expect((await consentPost(json({ action: "request_erasure" }))).status).toBe(401);
    vi.mocked(readCoachSession).mockResolvedValue(null);
    expect((await erasePost(json({}), { params: Promise.resolve({ clientId: CLIENT }) })).status).toBe(401);
    expect(db.rpc).toHaveLength(0);
  });

  it("coach genomför raderingen via RPC för rätt klient", async () => {
    vi.mocked(readCoachSession).mockResolvedValue({ userId: "c", name: "Carolina", coachId: COACH });
    const response = await erasePost(json({}), { params: Promise.resolve({ clientId: CLIENT }) });
    expect(response.status).toBe(200);
    expect(db.rpc).toEqual([{ name: "erase_special_category_content", args: { p_client_id: CLIENT } }]);
  });

  it("radering rör aldrig avtal, signaturer, ångerposter, bekräftelser eller samtyckeshistoriken", () => {
    const body = postWithdrawalSql.slice(postWithdrawalSql.indexOf("function public.erase_special_category_content"));
    for (const protectedTable of ["contracts", "contract_signatures", "contract_withdrawals", "contract_confirmation_notifications", "special_category_consents"]) {
      expect(body).not.toMatch(new RegExp(`(delete from|update) public\\.${protectedTable}\\b`));
    }
    expect(body).toContain("raise exception 'NO_OPEN_ERASURE_REQUEST'");
    expect(postWithdrawalSql).toContain("raise exception 'CONSENT_NOT_WITHDRAWN'");
    expect(postWithdrawalSql).toContain("only completion of an open request is allowed");
  });
});

describe("samtyckeskortet efter återkallelse", () => {
  const withdrawnHistory = [{ id: "c1", version: "2026-10-01", grantedAt: BEFORE, withdrawnAt: T }];

  it("visar begränsningen och erbjuder radering", () => {
    const html = renderToStaticMarkup(createElement(SpecialCategoryConsentCard, { initialHistory: withdrawnHistory, initialErasureRequests: [] }));
    expect(html).toContain("Innehåll du lämnat fram till dess är begränsat");
    expect(html).toContain("Begär radering av begränsat innehåll");
    expect(html).toContain("Lämna samtycke");
  });

  it("öppen begäran → ingen ny knapp; genomförd → visar datum", () => {
    const open = renderToStaticMarkup(createElement(SpecialCategoryConsentCard, {
      initialHistory: withdrawnHistory,
      initialErasureRequests: [{ id: "e", cutoff: T, requestedAt: AFTER, completedAt: null }],
    }));
    expect(open).toContain("Carolina genomför raderingen");
    expect(open).not.toContain("Begär radering av begränsat innehåll");
    const done = renderToStaticMarkup(createElement(SpecialCategoryConsentCard, {
      initialHistory: withdrawnHistory,
      initialErasureRequests: [{ id: "e", cutoff: T, requestedAt: AFTER, completedAt: AFTER }],
    }));
    expect(done).toContain("Det begränsade innehållet raderades");
  });

  it("återkallelsetexten säger det som krävs, enkelt", () => {
    for (const phrase of [
      "slutar CVB Coaching från och med nu att behandla känsliga personuppgifter med stöd",
      "AI-stödet använder inte längre samtalsinnehåll",
      "Behandling som skett innan påverkas inte",
      "Du kan begära att",
      "kan behöva\n            sparas om lag kräver det",
    ]) {
      expect(cardSource, phrase).toContain(phrase);
    }
  });
});

// ================================================================== B. TERMS VERSION

describe("villkorsversioner", () => {
  it("nuvarande version backas av den nuvarande texten; okänd version finns inte", () => {
    expect(GENERAL_TERMS_VERSIONS).toContain("2026-10-01");
    expect(generalTermsDocument("2026-10-01", "sv")).toEqual(termsDocument("sv"));
    expect(generalTermsDocument("2099-01-01", "sv")).toBeNull();
    expect(generalTermsDocument(null, "sv")).toBeNull();
  });

  it("sändning låser den version som är aktuell just då", async () => {
    await sendContractForSignature("contract-1");
    expect(db.rpc.at(-1)).toEqual({
      name: "send_contract_for_signature",
      args: { p_contract_id: "contract-1", p_general_terms_version: "2026-10-01" },
    });
  });

  function seedSignedConsumerContract(pinned: string | null) {
    db.tables = {
      contracts: [{
        id: "contract-1", coach_id: COACH, client_id: CLIENT, engagement_id: null, template_id: null,
        title: "Individuell coaching", content: { sections: [], fields: [] }, price_amount: 1000, currency: "SEK",
        payment_terms: null, status: "signerat", version_id: "v1", sent_at: BEFORE, client_signed_at: BEFORE,
        coach_signed_at: T, locked_at: T, counterparty_type: "consumer", withdrawal_deadline: "2026-10-15T22:00:00Z",
        early_performance_requested_at: null, general_terms_version: pinned, created_at: BEFORE, updated_at: T,
        clients: { name: "Klara", email: "k@example.test" }, contract_withdrawals: null,
      }],
      contract_signatures: [
        { id: "s1", contract_id: "contract-1", signer_role: "klient", signer_name: "Klara", signer_email: "k@example.test", contract_version_id: "v1", signed_at: BEFORE },
        { id: "s2", contract_id: "contract-1", signer_role: "coach", signer_name: "Carolina von Braun", signer_email: "c@example.test", contract_version_id: "v1", signed_at: T },
      ],
      contract_confirmation_notifications: [{
        contract_id: "contract-1", status: "pending", recipient_email: "k@example.test",
        idempotency_key: "cvb-contract-confirmation/contract-1/v1", rendered_subject: null, rendered_body: null,
        terms_version: null, last_attempt_at: null, provider_accepted_at: null,
      }],
    };
  }

  it("version A låst, aktuell version blir B → bekräftelsen innehåller fortfarande A", async () => {
    seedSignedConsumerContract("2026-10-01");
    termsState.current = "2099-01-01";
    const outcome = await dispatchContractConfirmation("contract-1");
    expect(outcome.status).toBe("sent");
    const row = db.tables.contract_confirmation_notifications[0];
    expect(row.terms_version).toBe("2026-10-01");
    expect(String(row.rendered_body)).toContain("ALLMÄNNA VILLKOR FÖR COACHING (version 2026-10-01)");
    expect(String(row.rendered_body)).not.toContain("2099-01-01");
  });

  it("utan bevisbar version renderas ingen bekräftelse med gissade villkor", async () => {
    seedSignedConsumerContract(null);
    const outcome = await dispatchContractConfirmation("contract-1");
    expect(outcome).toEqual({ status: "failed", errorCode: "contract_not_renderable" });
    expect(db.tables.contract_confirmation_notifications[0].rendered_body).toBeNull();
  });

  it("klientens signering bekräftar avtalets låsta version, inte en senare aktuell", async () => {
    seedSignedConsumerContract("2026-10-01");
    Object.assign(db.tables.contracts[0], { status: "skickat", coach_signed_at: null });
    termsState.current = "2099-01-01";
    vi.mocked(readSession).mockResolvedValue({ userId: "u", name: "Klara", role: "klient" });
    await signPost(json({}), { params: Promise.resolve({ contractId: "contract-1" }) });
    const call = db.rpc.find((c) => c.name === "sign_contract_as_client")!;
    expect(call.args.p_general_terms_version).toBe("2026-10-01");
  });

  it("äldre skickat avtal utan version: klienten bekräftar den version som visas", async () => {
    seedSignedConsumerContract(null);
    Object.assign(db.tables.contracts[0], { status: "skickat", coach_signed_at: null });
    vi.mocked(readSession).mockResolvedValue({ userId: "u", name: "Klara", role: "klient" });
    await signPost(json({ generalTermsVersion: "2026-10-01" }), { params: Promise.resolve({ contractId: "contract-1" }) });
    expect(db.rpc.find((c) => c.name === "sign_contract_as_client")!.args.p_general_terms_version).toBe("2026-10-01");
  });

  it("versionssidan visar exakt den versionen, ej indexerad, endast kända versioner", async () => {
    expect(versionedTermsParams()).toEqual([{ version: "2026-10-01" }]);
    const meta = await versionedTermsMetadata({ params: Promise.resolve({ version: "2026-10-01" }) });
    expect(meta.robots).toEqual({ index: false, follow: true });
    const html = renderToStaticMarkup(await VersionedTermsPage({ params: Promise.resolve({ version: "2026-10-01" }) }));
    expect(html).toContain("Allmänna villkor för coaching");
    expect(html).toContain("Version 2026-10-01");
    await expect(VersionedTermsPage({ params: Promise.resolve({ version: "2099-01-01" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("SQL: låses vid sändning, oföränderlig efter, ingen backfill av äldre avtal", () => {
    expect(termsSql).toContain("general_terms_version = p_general_terms_version,");
    expect(termsSql).toContain("general_terms_version is immutable once set");
    expect(termsSql).toContain("raise exception 'TERMS_VERSION_MISMATCH'");
    expect(termsSql).toContain("general_terms_version = coalesce(v_row.general_terms_version, p_general_terms_version)");
    expect(termsSql).not.toMatch(/update public\.contracts\s+set general_terms_version/);
    expect(termsSql).toContain(`not in ('${GENERAL_TERMS_VERSIONS.join("', '")}')`);
  });
});
