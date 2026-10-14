import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Article 9 consent under database faults (P2-02, 2026-10-14).
 *
 * The restriction after a withdrawn consent is applied in the application
 * from the consent rows. Before the fix a failed read of
 * special_category_consents was returned as an empty list, which silently
 * lifted the restriction in Carolina's view. A read error must now fail
 * closed: nothing is shown, and AI never sees consent-scoped content.
 *
 * Valid, missing, withdrawn and renewed consent are covered in
 * consent-boundary.test.ts and legal-integrity.test.ts; the database side in
 * tests/db/70_consent.sql.
 */

type Row = Record<string, unknown>;
const db: { tables: Record<string, Row[]>; failing: Set<string> } = { tables: {}, failing: new Set() };

function result(source: string, rows: Row[]) {
  return db.failing.has(source)
    ? { data: null, error: { message: "permission denied", code: "42501" } }
    : { data: rows, error: null };
}

function query(table: string) {
  const filters: Array<(row: Row) => boolean> = [];
  const rows = () => (db.tables[table] ?? []).filter((row) => filters.every((f) => f(row)));
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters.push((row) => row[column] === value);
      return builder;
    },
    order: () => builder,
    then(resolve: (value: unknown) => unknown) {
      return Promise.resolve(result(table, rows())).then(resolve);
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: (table: string) => query(table),
    rpc: async (name: string) => {
      if (name === "read_session_preparations") return result(name, []);
      if (name === "read_commitment_client_notes") return result(name, []);
      if (name === "count_client_private_content") return db.failing.has(name) ? result(name, []) : { data: 0, error: null };
      return { data: null, error: null };
    },
  })),
}));

import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import { PortalDataError } from "@/lib/portal/data-errors";
import {
  countClientPrivateContent,
  hasActiveSpecialCategoryConsent,
  listSpecialCategoryConsents,
  listSpecialCategoryErasureRequests,
} from "@/lib/portal/special-category-consent";

const COACH = "coach-1";
const CLIENT = "client-1";
const GRANTED = "2026-09-01T08:00:00.000Z";
const WRITTEN = "2026-09-10T08:00:00.000Z";
const WITHDRAWN = "2026-09-20T08:00:00.000Z";

function seed(consents: Row[]) {
  db.failing = new Set();
  db.tables = {
    coaches: [{ id: COACH, name: "Coach", title: "", initials: "C", email: "c@example.test", credential: "", focus: "" }],
    organisations: [],
    engagements: [{
      id: "eng-1", organisation_id: null, coach_id: COACH, title: "Uppdrag", kind: "individuell", kind_label: "",
      purpose: "", scope_note: "", period_label: "", start_date: "2026-09-01", end_date: null, status: "pagaende",
      sponsor_reporting: "", next_review_label: null, next_review_date: null,
    }],
    milestones: [],
    clients: [{
      id: CLIENT, engagement_id: "eng-1", organisation_id: null, name: "Klara", initials: "K", role: "", email: "k@example.test",
      phone: "", headline: "", started_at: "2026-09-01", depth: "full", recurring_themes: ["THEME-SECRET"], status: "aktiv",
    }],
    coaching_agreements: [],
    development_goals: [],
    sessions: [],
    session_summaries: [],
    session_coach_notes: [],
    reflections: [{ id: "r", client_id: CLIENT, session_id: null, date: WRITTEN.slice(0, 10), prompt: "", text: "REFLECTION-SECRET", created_at: WRITTEN }],
    // Carolina's own insight, written while consent was active.
    insights: [{ id: "i", client_id: CLIENT, session_id: null, date: WRITTEN.slice(0, 10), text: "INSIGHT-SECRET", created_at: WRITTEN }],
    commitments: [],
    documents: [],
    materials: [],
    special_category_consents: consents,
    special_category_erasure_requests: [],
  };
}

const ACTIVE = [{ id: "s1", client_id: CLIENT, consent_version: "2026-10-01", granted_at: GRANTED, withdrawn_at: null }];
const WITHDRAWN_CONSENT = [{ id: "s1", client_id: CLIENT, consent_version: "2026-10-01", granted_at: GRANTED, withdrawn_at: WITHDRAWN }];
const json = (value: unknown) => JSON.stringify(value);

beforeEach(() => seed(ACTIVE));

describe("consent reads succeed", () => {
  it("valid consent: Carolina sees the insight and the client-authored reflection", async () => {
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).toContain("INSIGHT-SECRET");
    expect(coach).toContain("REFLECTION-SECRET");
    expect(await hasActiveSpecialCategoryConsent(CLIENT)).toBe(true);
  });

  it("no consent: client-authored content stays private, the AI gate is closed", async () => {
    seed([]);
    expect(json(await fetchPortalRepositoryData())).not.toContain("REFLECTION-SECRET");
    expect(await hasActiveSpecialCategoryConsent(CLIENT)).toBe(false);
  });

  it("withdrawn consent: the restriction hides Carolina's own earlier insight and the themes", async () => {
    seed(WITHDRAWN_CONSENT);
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).not.toContain("INSIGHT-SECRET");
    expect(coach).not.toContain("THEME-SECRET");
    expect(coach).not.toContain("REFLECTION-SECRET");
    expect(await hasActiveSpecialCategoryConsent(CLIENT)).toBe(false);
  });
});

describe("consent read fails (database error)", () => {
  it("the coach view fails closed instead of lifting the withdrawal restriction", async () => {
    seed(WITHDRAWN_CONSENT);
    db.failing.add("special_category_consents");
    // Before the fix this resolved with INSIGHT-SECRET and THEME-SECRET.
    await expect(fetchPortalRepositoryData()).rejects.toBeInstanceOf(PortalDataError);
  });

  it("AI input and the client's own view fail closed too", async () => {
    db.failing.add("special_category_consents");
    await expect(fetchPortalRepositoryData({ purpose: "ai" })).rejects.toBeInstanceOf(PortalDataError);
    await expect(fetchPortalRepositoryData({ viewer: "klient" })).rejects.toBeInstanceOf(PortalDataError);
  });

  it("the AI gate reads it as no consent", async () => {
    db.failing.add("special_category_consents");
    expect(await hasActiveSpecialCategoryConsent(CLIENT)).toBe(false);
  });

  it("consent history, erasure requests and the private-content count are errors, not empty", async () => {
    db.failing = new Set(["special_category_consents", "special_category_erasure_requests", "count_client_private_content"]);
    await expect(listSpecialCategoryConsents(CLIENT)).rejects.toBeInstanceOf(PortalDataError);
    await expect(listSpecialCategoryErasureRequests(CLIENT)).rejects.toBeInstanceOf(PortalDataError);
    await expect(countClientPrivateContent(CLIENT)).rejects.toBeInstanceOf(PortalDataError);
  });

  it("the consent-scoped read RPCs fail closed as well", async () => {
    for (const source of ["read_session_preparations", "read_commitment_client_notes", "reflections"]) {
      seed(ACTIVE);
      db.failing.add(source);
      await expect(fetchPortalRepositoryData(), source).rejects.toBeInstanceOf(PortalDataError);
    }
  });
});

describe("other portal reads", () => {
  it("any failed read is an error, never an empty portal", async () => {
    for (const source of ["clients", "sessions", "documents", "materials", "coaches"]) {
      seed(ACTIVE);
      db.failing.add(source);
      await expect(fetchPortalRepositoryData(), source).rejects.toBeInstanceOf(PortalDataError);
    }
  });

  it("an empty but successful read is still legitimate", async () => {
    seed(ACTIVE);
    db.tables.reflections = [];
    db.tables.insights = [];
    const data = await fetchPortalRepositoryData();
    expect(data.reflections).toEqual([]);
    expect(data.clients).toHaveLength(1);
  });
});
