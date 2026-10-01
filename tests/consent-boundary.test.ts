import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Consent boundary (non-retroactive consent windows).
 *
 * Client-authored, special-category-capable content reaches Carolina and AI
 * only if it was written inside a consent window [granted_at, withdrawn_at).
 * Content written with no active consent — never consented, or between a
 * withdrawal and a new consent — stays private to the client, and a later
 * consent never opens it. AI additionally requires a window for every
 * consent-scoped source, also Carolina's own notes.
 *
 * Exercised through the real read path (fetchPortalRepositoryData) against
 * an in-memory Supabase double, with the timeline
 *   grant T1 -> A -> withdraw T2 -> B -> grant T3 -> C
 */

type Row = Record<string, unknown>;
const db: { tables: Record<string, Row[]>; selects: Array<{ table: string; columns: string }> } = { tables: {}, selects: [] };

function query(table: string) {
  const filters: Array<(row: Row) => boolean> = [];
  const result = () => (db.tables[table] ?? []).filter((row) => filters.every((f) => f(row)));
  const builder = {
    select: (columns = "*") => {
      db.selects.push({ table, columns });
      return builder;
    },
    eq: (column: string, value: unknown) => {
      filters.push((row) => row[column] === value);
      return builder;
    },
    not: (column: string, op: string, value: unknown) => {
      if (op === "is" && value === null) filters.push((row) => row[column] !== null && row[column] !== undefined);
      return builder;
    },
    in: (column: string, values: unknown[]) => {
      filters.push((row) => values.includes(row[column]));
      return builder;
    },
    order: () => builder,
    maybeSingle: async () => ({ data: result()[0] ?? null, error: null }),
    then(resolve: (value: { data: Row[]; error: null }) => unknown) {
      return Promise.resolve({ data: result(), error: null }).then(resolve);
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: (table: string) => query(table),
    rpc: async (name: string) => {
      // The read RPCs of 20261001110000. The double returns the stored rows;
      // the database-side masking is covered by the SQL suite, so these tests
      // exercise the application's own filter on top.
      if (name === "read_session_preparations") return { data: db.tables.session_preparations ?? [], error: null };
      if (name === "read_commitment_client_notes") {
        const rows = (db.tables.commitments ?? []).filter((c) => c.client_note);
        return { data: rows.map((c) => ({ commitment_id: c.id, client_note: c.client_note })), error: null };
      }
      if (name === "count_client_private_content") return { data: 3, error: null };
      return { data: null, error: null };
    },
  })),
}));

import { fetchPortalRepositoryData } from "@/lib/portal/repository";
import { buildClientContext, buildEngagementContext } from "@/lib/ai/context";
import { countClientPrivateContent } from "@/lib/portal/special-category-consent";
import { isInsideConsentWindow } from "@/lib/portal/special-category-consent-rules";

const COACH = "coach-1";
const CLIENT = "client-1";
const ENGAGEMENT = "eng-1";
const SESSION_A = "session-a";
const SESSION_B = "session-b";
const SESSION_C = "session-c";

const T1 = "2026-10-01T08:00:00.000Z"; // grant
const A_AT = "2026-10-01T09:00:00.000Z";
const T2 = "2026-10-01T10:00:00.000Z"; // withdraw
const B_AT = "2026-10-01T12:00:00.000Z";
const T3 = "2026-10-02T09:00:00.000Z"; // grant again
const C_AT = "2026-10-02T10:00:00.000Z";

const CONSENTS = {
  never: [] as Row[],
  active: [{ client_id: CLIENT, granted_at: T1, withdrawn_at: null }],
  withdrawn: [{ client_id: CLIENT, granted_at: T1, withdrawn_at: T2 }],
  reconsented: [
    { client_id: CLIENT, granted_at: T1, withdrawn_at: T2 },
    { client_id: CLIENT, granted_at: T3, withdrawn_at: null },
  ],
};

function session(id: string, number: number, createdAt: string, focus: string): Row {
  return {
    id, client_id: CLIENT, number, date: createdAt.slice(0, 10), time: "10:00", duration_minutes: 60,
    status: "genomford", client_focus: focus, desired_outcome: `${focus}-OUTCOME`, location: "", created_at: createdAt, updated_at: C_AT,
    // Written at the same time in this fixture; see the focus timestamp test for the difference.
    focus_written_at: createdAt,
  };
}

/** One business client in an organisation engagement, with content A/B/C. */
function seed(consents: Row[]) {
  db.selects = [];
  db.tables = {
    coaches: [{ id: COACH, name: "Carolina von Braun", title: "Coach", initials: "CvB", email: "c@example.test", credential: "ICF", focus: "" }],
    organisations: [{ id: "org-1", name: "Org AB", size_label: "10", industry: "IT", location: "Göteborg", sponsor_name: null, sponsor_role: null }],
    engagements: [{
      id: ENGAGEMENT, organisation_id: "org-1", coach_id: COACH, title: "Program", kind: "program", kind_label: "Program",
      purpose: "", scope_note: "", period_label: "", start_date: "2026-09-01", end_date: "2026-12-01", status: "pagaende",
      sponsor_reporting: "Aggregerat.", next_review_label: null, next_review_date: null,
    }],
    milestones: [],
    clients: [{
      id: CLIENT, engagement_id: ENGAGEMENT, organisation_id: "org-1", name: "Klara", initials: "K", role: "Chef",
      email: "k@example.test", phone: "", headline: "", started_at: "2026-09-01", depth: "full", recurring_themes: ["THEME"], status: "aktiv",
    }],
    coaching_agreements: [{ client_id: CLIENT, agreed_at: "2026-09-01", purpose: "AGREEMENT", scope: "", cadence: "", confidentiality: "", sponsor_sharing: "", ethics: "", client_responsibility: "" }],
    development_goals: [{ client_id: CLIENT, headline: "GOAL", client_wording: "WORDING", baseline: "BASELINE", success_criteria: [], horizon: "" }],
    sessions: [session(SESSION_A, 1, A_AT, "FOCUS-A"), session(SESSION_B, 2, B_AT, "FOCUS-B"), session(SESSION_C, 3, C_AT, "FOCUS-C")],
    session_summaries: [
      { session_id: SESSION_A, focus: "SUMMARY-A", insights: [], awareness: "", new_perspectives: [], commitments: [], follow_up: [], possible_next_focus: "", approved: true, approved_at: A_AT },
      { session_id: SESSION_B, focus: "SUMMARY-B", insights: [], awareness: "", new_perspectives: [], commitments: [], follow_up: [], possible_next_focus: "", approved: true, approved_at: B_AT },
    ],
    session_coach_notes: [
      { session_id: SESSION_A, coach_id: COACH, notes: "NOTE-A", created_at: A_AT, updated_at: C_AT },
      { session_id: SESSION_B, coach_id: COACH, notes: "NOTE-B", created_at: B_AT, updated_at: C_AT },
    ],
    // Saved by the client in the gap; a later coach edit moved updated_at into a window.
    session_preparations: [{ id: "prep", client_id: CLIENT, session_id: null, focus: "PREP-B", desired_outcome: "", changed: "", follow_up: "COACH-EDIT", updated_at: C_AT, client_saved_at: B_AT, follow_up_author: "coach", follow_up_saved_at: C_AT }],
    reflections: [
      { id: "r-a", client_id: CLIENT, session_id: null, date: A_AT.slice(0, 10), prompt: "", text: "REFLECTION-A", created_at: A_AT },
      { id: "r-b", client_id: CLIENT, session_id: null, date: B_AT.slice(0, 10), prompt: "", text: "REFLECTION-B", created_at: B_AT },
      { id: "r-c", client_id: CLIENT, session_id: null, date: C_AT.slice(0, 10), prompt: "", text: "REFLECTION-C", created_at: C_AT },
    ],
    insights: [{ id: "i-b", client_id: CLIENT, session_id: SESSION_B, date: B_AT.slice(0, 10), text: "INSIGHT-B", created_at: B_AT }],
    commitments: [
      { id: "c-a", client_id: CLIENT, session_id: SESSION_A, date: A_AT.slice(0, 10), text: "COMMIT-A", due_label: "", status: "oppet", client_note: "CLIENTNOTE-B", completed_at: null, created_at: A_AT, updated_at: B_AT },
      { id: "c-c", client_id: CLIENT, session_id: SESSION_C, date: C_AT.slice(0, 10), text: "COMMIT-C", due_label: "", status: "oppet", client_note: "CLIENTNOTE-C", completed_at: null, created_at: C_AT, updated_at: C_AT },
    ],
    documents: [],
    materials: [],
    special_category_consents: consents,
  };
}

const json = (value: unknown) => JSON.stringify(value);

beforeEach(() => {
  db.tables = {};
  db.selects = [];
});

describe("consent windows", () => {
  it("[granted_at, withdrawn_at) — inclusive start, exclusive end, open while active", () => {
    const windows = [{ grantedAt: T1, withdrawnAt: T2 }, { grantedAt: T3, withdrawnAt: null }];
    expect(isInsideConsentWindow(T1, windows)).toBe(true);
    expect(isInsideConsentWindow(A_AT, windows)).toBe(true);
    expect(isInsideConsentWindow(T2, windows)).toBe(false);
    expect(isInsideConsentWindow(B_AT, windows)).toBe(false);
    expect(isInsideConsentWindow(C_AT, windows)).toBe(true);
    expect(isInsideConsentWindow(null, windows)).toBe(false);
    expect(isInsideConsentWindow(A_AT, [])).toBe(false);
  });
});

describe("scenario 1 — never consented", () => {
  it("client sees own reflection; Carolina and AI do not", async () => {
    seed(CONSENTS.never);
    expect(json(await fetchPortalRepositoryData({ viewer: "klient" }))).toContain("REFLECTION-A");
    const coach = json(await fetchPortalRepositoryData());
    const ai = json(await fetchPortalRepositoryData({ purpose: "ai" }));
    for (const text of ["REFLECTION-A", "REFLECTION-B", "REFLECTION-C", "PREP-B", "CLIENTNOTE-B", "CLIENTNOTE-C"]) {
      expect(coach, text).not.toContain(text);
      expect(ai, text).not.toContain(text);
    }
  });
});

describe("scenario 2 — active consent", () => {
  it("A written under consent: client, Carolina and AI", async () => {
    seed(CONSENTS.active);
    const coach = await fetchPortalRepositoryData();
    expect(json(coach)).toContain("REFLECTION-A");
    const ai = await fetchPortalRepositoryData({ purpose: "ai" });
    const context = buildClientContext(COACH, CLIENT, undefined, { specialCategoryConsent: true, includeCoachNotes: true }, ai)!;
    expect(context.text).toContain("REFLECTION-A");
    expect(context.text).toContain("NOTE-A");
  });
});

describe("scenario 3 — withdrawal", () => {
  it("B written after withdrawal: client only", async () => {
    seed(CONSENTS.withdrawn);
    expect(json(await fetchPortalRepositoryData({ viewer: "klient" }))).toContain("REFLECTION-B");
    expect(json(await fetchPortalRepositoryData())).not.toContain("REFLECTION-B");
    expect(json(await fetchPortalRepositoryData({ purpose: "ai" }))).not.toContain("REFLECTION-B");
  });

  it("existing historical restriction unchanged: A is hidden while withdrawn", async () => {
    seed(CONSENTS.withdrawn);
    expect(json(await fetchPortalRepositoryData())).not.toContain("REFLECTION-A");
  });
});

describe("scenario 4 — re-consent is not retroactive", () => {
  it("Carolina: A + C, never B", async () => {
    seed(CONSENTS.reconsented);
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).toContain("REFLECTION-A");
    expect(coach).toContain("REFLECTION-C");
    expect(coach).not.toContain("REFLECTION-B");
  });

  it("client: A + B + C", async () => {
    seed(CONSENTS.reconsented);
    const client = json(await fetchPortalRepositoryData({ viewer: "klient" }));
    for (const text of ["REFLECTION-A", "REFLECTION-B", "REFLECTION-C"]) expect(client).toContain(text);
  });

  it("AI: A + C, never B — new consent does not expose B", async () => {
    seed(CONSENTS.reconsented);
    const ai = await fetchPortalRepositoryData({ purpose: "ai" });
    const context = buildClientContext(COACH, CLIENT, undefined, { specialCategoryConsent: true, includeCoachNotes: true }, ai)!;
    expect(context.text).toContain("REFLECTION-A");
    expect(context.text).toContain("REFLECTION-C");
    for (const text of ["REFLECTION-B", "PREP-B", "CLIENTNOTE-B", "INSIGHT-B", "SUMMARY-B", "NOTE-B", "FOCUS-B"]) {
      expect(context.text, text).not.toContain(text);
    }
  });

  it("client note saved in the gap stays private; a note saved under consent is shared", async () => {
    seed(CONSENTS.reconsented);
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).toContain("COMMIT-A");
    expect(coach).not.toContain("CLIENTNOTE-B");
    expect(coach).toContain("CLIENTNOTE-C");
  });
});

describe("scenario 5 — Carolina's notes and other coach-authored sources", () => {
  it("a coach note written outside a window never enters AI input", async () => {
    seed(CONSENTS.reconsented);
    const ai = json(await fetchPortalRepositoryData({ purpose: "ai" }));
    expect(ai).toContain("NOTE-A");
    for (const text of ["NOTE-B", "INSIGHT-B", "SUMMARY-B", "FOCUS-B"]) expect(ai, text).not.toContain(text);
  });

  it("fields without a stable timestamp (goal wording, baseline, themes) never enter AI input", async () => {
    seed(CONSENTS.reconsented);
    const ai = json(await fetchPortalRepositoryData({ purpose: "ai" }));
    for (const text of ["WORDING", "BASELINE", "THEME"]) expect(ai, text).not.toContain(text);
    expect(ai).toContain("GOAL");
  });

  it("Carolina still sees what she wrote herself outside a window (not client content)", async () => {
    seed(CONSENTS.reconsented);
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).toContain("NOTE-B");
    expect(coach).toContain("WORDING");
  });
});

describe("scenario 6 — preparation", () => {
  it("a coach edit after re-consent does not move gap-written client content into a window", async () => {
    seed(CONSENTS.reconsented);
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).not.toContain("PREP-B");
    expect(json(await fetchPortalRepositoryData({ viewer: "klient" }))).toContain("PREP-B");
  });

  it("Carolina always sees her own follow-up text, also when the client's fields are private", async () => {
    seed(CONSENTS.withdrawn);
    const coach = json(await fetchPortalRepositoryData());
    expect(coach).toContain("COACH-EDIT");
    expect(coach).not.toContain("PREP-B");
  });

  it("Carolina's own text is visible even if the client never saved and never consented", async () => {
    seed(CONSENTS.never);
    db.tables.session_preparations = [{
      id: "prep", client_id: CLIENT, session_id: null, focus: "", desired_outcome: "", changed: "",
      follow_up: "VAD BEHÖVER UTFORSKAS", updated_at: C_AT, client_saved_at: null, follow_up_author: "coach", follow_up_saved_at: C_AT,
    }];
    expect(json(await fetchPortalRepositoryData())).toContain("VAD BEHÖVER UTFORSKAS");
  });

  it("a client-authored follow-up is gated like the client's other fields", async () => {
    seed(CONSENTS.reconsented);
    db.tables.session_preparations = [{
      id: "prep", client_id: CLIENT, session_id: null, focus: "", desired_outcome: "", changed: "",
      follow_up: "CLIENT-FOLLOWUP-GAP", updated_at: C_AT, client_saved_at: B_AT, follow_up_author: "klient", follow_up_saved_at: B_AT,
    }];
    expect(json(await fetchPortalRepositoryData())).not.toContain("CLIENT-FOLLOWUP-GAP");
  });

  it("AI receives Carolina's follow-up only if written inside a window", async () => {
    seed(CONSENTS.reconsented);
    db.tables.session_preparations[0].follow_up_saved_at = B_AT;
    expect(json(await fetchPortalRepositoryData({ purpose: "ai" }))).not.toContain("COACH-EDIT");
  });
});

describe("session focus — AI eligibility uses the text's write time", () => {
  it("session booked before consent, focus written inside a window -> eligible", async () => {
    seed(CONSENTS.reconsented);
    Object.assign(db.tables.sessions[0], { created_at: "2026-09-01T08:00:00.000Z", focus_written_at: A_AT });
    expect(json(await fetchPortalRepositoryData({ purpose: "ai" }))).toContain("FOCUS-A");
  });

  it("session booked during consent, focus written after withdrawal -> not eligible", async () => {
    seed(CONSENTS.reconsented);
    Object.assign(db.tables.sessions[0], { created_at: A_AT, focus_written_at: B_AT });
    expect(json(await fetchPortalRepositoryData({ purpose: "ai" }))).not.toContain("FOCUS-A");
  });

  it("legacy session without a write time -> excluded from AI", async () => {
    seed(CONSENTS.reconsented);
    Object.assign(db.tables.sessions[0], { focus_written_at: null });
    expect(json(await fetchPortalRepositoryData({ purpose: "ai" }))).not.toContain("FOCUS-A");
  });
});

describe("scenario 7 — erasure flow unchanged", () => {
  it("the post-withdrawal migration and its predicates are untouched", () => {
    const sql = readFileSync(
      new URL("../supabase/migrations/20261001100000_cvb_base_special_category_post_withdrawal.sql", import.meta.url),
      "utf-8",
    );
    expect(sql).toContain("delete from public.reflections where client_id = p_client_id and created_at <= v_cutoff;");
    expect(sql).toContain("raise exception 'NO_OPEN_ERASURE_REQUEST'");
  });
});

describe("scenario 8 — organisation never receives individual content", () => {
  for (const [state, consents] of Object.entries(CONSENTS)) {
    it(`state: ${state}`, async () => {
      seed(consents);
      for (const data of [await fetchPortalRepositoryData(), await fetchPortalRepositoryData({ purpose: "ai" })]) {
        const context = buildEngagementContext(COACH, ENGAGEMENT, undefined, data)!;
        expect(context).not.toBeNull();
        for (const text of [
          "REFLECTION-A", "REFLECTION-B", "REFLECTION-C", "PREP-B", "NOTE-A", "NOTE-B", "SUMMARY-A", "SUMMARY-B",
          "INSIGHT-B", "CLIENTNOTE-B", "CLIENTNOTE-C", "WORDING", "BASELINE",
        ]) {
          expect(context.text, `${state}: ${text}`).not.toContain(text);
        }
      }
    });
  }
});

describe("coach indicator", () => {
  it("is a number computed in the database; no table is read from the app", async () => {
    seed(CONSENTS.reconsented);
    expect(await countClientPrivateContent(CLIENT)).toBe(3);
    expect(db.selects).toHaveLength(0);
  });

  it("the database function returns a count only — never text", () => {
    const sql = readFileSync(
      new URL("../supabase/migrations/20261001110000_cvb_base_consent_database_enforcement.sql", import.meta.url),
      "utf-8",
    );
    const fn = sql.slice(sql.indexOf("function public.count_client_private_content"), sql.indexOf("-- ------------------------------------------------- 7."));
    expect(fn).toContain("returns integer");
    expect(fn).not.toMatch(/select\s+(r|p|c)\.(text|focus|follow_up|client_note)/);
  });
});

describe("database enforcement — SQL contract (20261001110000)", () => {
  const sql = readFileSync(
    new URL("../supabase/migrations/20261001110000_cvb_base_consent_database_enforcement.sql", import.meta.url),
    "utf-8",
  );

  it("reflections: restrictive RLS — own rows, or coach with active consent and a covering window", () => {
    expect(sql).toContain("create policy reflections_special_category_boundary on public.reflections\n  as restrictive");
    expect(sql).toContain("or public.special_category_coach_may_read(client_id, created_at)");
  });

  it("commitment notes and preparation text are not directly selectable; read RPCs apply the boundary", () => {
    expect(sql).toContain("revoke select on table public.commitments from authenticated;");
    expect(sql).toMatch(/grant select \(\s*id, client_id, session_id, date, text, due_label, status, completed_at, created_at, updated_at\s*\) on table public\.commitments/);
    expect(sql).toContain("revoke select on table public.session_preparations from authenticated;");
    expect(sql).not.toMatch(/grant select \([^)]*\b(focus|follow_up|client_note)\b[^)]*\) on table/);
    expect(sql).toContain("or (w.coach and p.follow_up_author = 'coach')");
  });

  it("write times are set by triggers, never backfilled", () => {
    expect(sql).toContain("new.focus_written_at := old.focus_written_at;");
    expect(sql).toContain("new.follow_up_author := case when v_is_client then 'klient' else 'coach' end;");
    expect(sql).not.toMatch(/update public\.(sessions|session_preparations)\s+set\s+(focus_written_at|follow_up_author|follow_up_saved_at)/);
  });

  it("helpers cannot be used to probe other clients; anon has no access", () => {
    const mayRead = sql.slice(sql.indexOf("function public.special_category_coach_may_read"));
    expect(mayRead).toContain("select public.client_owned_by_current_coach(p_client_id)");
    expect(sql).not.toMatch(/to anon/);
    for (const fn of ["read_commitment_client_notes()", "read_session_preparations()", "count_client_private_content(uuid)"]) {
      expect(sql).toContain(`revoke execute on function public.${fn} from public, anon;`);
    }
  });
});
