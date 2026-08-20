/**
 * Demo-state för coachingmaterial.
 *
 * Metadata (titlar, kopplingar, delningsstatus) lagras i en separat signerad
 * httpOnly-cookie — inte i huvud-demostate — för att undvika att reflektioner
 * och prep trängs ut.
 *
 * Faktiska filbytes lagras INTE här. Uppladdade filer sparas i webbläsarens
 * localStorage (enhet lokalt) med material-id som nyckel. Se
 * client-material-files.ts.
 */

export const DEMO_MATERIALS_VERSION = 1;

/** Max storlek på serialiserat tillstånd per cookie. */
export const MAX_MATERIALS_STATE_BYTES = 3800;

export type DemoMaterialsState = {
  v: number;
  /** Nya material skapade i demoläget. */
  added: import("@/lib/portal/types").CoachingMaterial[];
  /** Metadata-uppdateringar på befintliga (seed eller added). */
  updated: Record<string, Partial<import("@/lib/portal/types").CoachingMaterial>>;
  /** Borttagna material-id (seed eller added). */
  deletedIds: string[];
};

export const EMPTY_DEMO_MATERIALS_STATE: DemoMaterialsState = {
  v: DEMO_MATERIALS_VERSION,
  added: [],
  updated: {},
  deletedIds: [],
};

export function isEmptyDemoMaterialsState(state: DemoMaterialsState): boolean {
  return (
    state.added.length === 0 &&
    Object.keys(state.updated).length === 0 &&
    state.deletedIds.length === 0
  );
}

export function normaliseDemoMaterialsState(input: unknown): DemoMaterialsState {
  if (!input || typeof input !== "object") return EMPTY_DEMO_MATERIALS_STATE;
  const raw = input as Partial<DemoMaterialsState>;

  const added = Array.isArray(raw.added)
    ? raw.added.filter(
        (item): item is import("@/lib/portal/types").CoachingMaterial =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { ownerClientId?: unknown }).ownerClientId === "string" &&
          typeof (item as { title?: unknown }).title === "string",
      )
    : [];

  const updated: DemoMaterialsState["updated"] = {};
  if (raw.updated && typeof raw.updated === "object") {
    for (const [id, value] of Object.entries(raw.updated)) {
      if (value && typeof value === "object") {
        updated[id] = value as Partial<import("@/lib/portal/types").CoachingMaterial>;
      }
    }
  }

  const deletedIds = Array.isArray(raw.deletedIds)
    ? raw.deletedIds.filter((id): id is string => typeof id === "string")
    : [];

  return { v: DEMO_MATERIALS_VERSION, added, updated, deletedIds };
}

export function fitMaterialsWithinCookie(state: DemoMaterialsState): DemoMaterialsState {
  let candidate = state;
  while (
    Buffer.byteLength(JSON.stringify(candidate), "utf8") > MAX_MATERIALS_STATE_BYTES &&
    candidate.added.length > 0
  ) {
    candidate = { ...candidate, added: candidate.added.slice(1) };
  }
  return candidate;
}
