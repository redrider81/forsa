import { describe, expect, it } from "vitest";
import { buildClientContext, buildEngagementContext } from "@/lib/ai/context";
import { buildClientDossier, buildClientPerspective } from "@/lib/portal/repository";
import {
  canClientDelete,
  canClientEdit,
  canCoachDelete,
  countMaterialsLinkedToNextSession,
  getClientMaterial,
  listClientMaterials,
} from "@/lib/portal/materials-repository";
import {
  encodeDemoMaterialsState,
  decodeDemoMaterialsState,
} from "@/lib/portal/store/demo-materials-store";
import {
  EMPTY_DEMO_MATERIALS_STATE,
  fitMaterialsWithinCookie,
  normaliseDemoMaterialsState,
} from "@/lib/portal/store/demo-materials-state";
import { validateMaterialFile, MAX_MATERIAL_FILE_BYTES } from "@/lib/portal/material-validation";
import type { CoachingMaterial } from "@/lib/portal/types";

const coachId = "coach-cvb";
const emma = "klient-emma-lind";
const johan = "klient-johan-bergstrom";

describe("material — klientisolering", () => {
  it("håller Emma och Johan separata", () => {
    const emmaMaterials = listClientMaterials(emma, "klient");
    const johanMaterials = listClientMaterials(johan, "klient");
    expect(emmaMaterials.length).toBeGreaterThan(0);
    expect(johanMaterials.every((item) => item.ownerClientId === johan)).toBe(true);
    expect(
      emmaMaterials.every((item) => !johanMaterials.some((other) => other.id === item.id)),
    ).toBe(true);
  });

  it("nekar läsning av annan klient via getClientMaterial", () => {
    const emmaItem = listClientMaterials(emma, "klient")[0]!;
    expect(getClientMaterial(johan, emmaItem.id, "klient")).toBeNull();
  });
});

describe("material — delningsregler", () => {
  it("döljer privata klientmaterial för coachen", () => {
    const coachView = listClientMaterials(emma, "coach");
    const privateNote = coachView.find((item) => item.id === "mat-seed-emma-2");
    expect(privateNote).toBeUndefined();
    expect(coachView.some((item) => item.title === "Frågor jag vill ta upp")).toBe(false);
  });

  it("visar klientdelat material för coachen", () => {
    const coachView = listClientMaterials(emma, "coach");
    expect(coachView.some((item) => item.id === "mat-seed-emma-1")).toBe(true);
    expect(coachView.some((item) => item.sharingLevel === "shared_coach")).toBe(true);
  });

  it("visar coach-delat material endast för rätt klient", () => {
    const emmaView = listClientMaterials(emma, "klient");
    const johanView = listClientMaterials(johan, "klient");
    expect(emmaView.some((item) => item.id === "mat-seed-emma-3")).toBe(true);
    expect(johanView.some((item) => item.id === "mat-seed-emma-3")).toBe(false);
  });
});

describe("material — organisationskontext", () => {
  it("inkluderar inte klientmaterial i organisations-AI-kontext", () => {
    const context = buildEngagementContext(coachId, "eng-bergstrom");
    expect(context).not.toBeNull();
    expect(context!.text).not.toContain("Styrelsepresentation Q3");
    expect(context!.text).not.toContain("Frågor jag vill ta upp");
    expect(context!.text).not.toContain("Reflektionsövning – strategiskt ledarskap");
  });
});

describe("material — AI-kontext", () => {
  it("inkluderar inte privata klientmaterial i klient-AI-kontext", () => {
    const context = buildClientContext(coachId, emma);
    expect(context).not.toBeNull();
    expect(context!.text).not.toContain("Frågor jag vill ta upp");
    expect(context!.text).not.toContain("går tillbaka till detaljer");
  });
});

describe("material — ägarskap", () => {
  const sharedFile = listClientMaterials(emma, "klient").find(
    (item) => item.id === "mat-seed-emma-1",
  )!;
  const coachShared = listClientMaterials(emma, "klient").find(
    (item) => item.id === "mat-seed-emma-3",
  )!;

  it("låter klienten redigera eget material", () => {
    expect(canClientEdit(sharedFile)).toBe(true);
    expect(canClientDelete(sharedFile)).toBe(true);
  });

  it("låter inte klienten ta bort coach-delat material", () => {
    expect(canClientDelete(coachShared)).toBe(false);
    expect(canClientEdit(coachShared)).toBe(false);
  });

  it("låter coachen ta bort eget delat material", () => {
    expect(canCoachDelete(coachShared)).toBe(true);
    expect(canCoachDelete(sharedFile)).toBe(false);
  });
});

describe("material — filvalidering", () => {
  it("tillåter PDF och bilder", () => {
    expect(validateMaterialFile("rapport.pdf", "application/pdf", 1000).ok).toBe(true);
    expect(validateMaterialFile("bild.png", "image/png", 1000).ok).toBe(true);
  });

  it("avvisar otillåten filtyp", () => {
    const result = validateMaterialFile("script.js", "application/javascript", 100);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("stöds inte");
  });

  it("avvisar för stor fil", () => {
    const result = validateMaterialFile("stor.pdf", "application/pdf", MAX_MATERIAL_FILE_BYTES + 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("för stor");
  });
});

describe("material — demo persistence", () => {
  const added: CoachingMaterial = {
    id: "mat-test-1",
    ownerClientId: emma,
    createdByRole: "klient",
    createdById: emma,
    title: "Testanteckning",
    category: "anteckning",
    noteText: "En privat anteckning för persistens.",
    createdAt: "2026-08-20",
    updatedAt: "2026-08-20T10:00:00.000Z",
    sharingLevel: "private",
    source: "client_note",
    linkType: "none",
  };

  it("serialiserar och deserialiserar demo-materialstate", () => {
    const state = {
      ...EMPTY_DEMO_MATERIALS_STATE,
      added: [added],
      updated: {
        "mat-seed-emma-1": { sharingLevel: "private" as const, updatedAt: "2026-08-20T11:00:00.000Z" },
      },
    };
    const token = encodeDemoMaterialsState(state);
    const decoded = decodeDemoMaterialsState(token);
    expect(decoded.added).toHaveLength(1);
    expect(decoded.added[0]?.title).toBe("Testanteckning");
    expect(decoded.updated["mat-seed-emma-1"]?.sharingLevel).toBe("private");
  });

  it("behåller delningsstatus efter merge", () => {
    const state = {
      ...EMPTY_DEMO_MATERIALS_STATE,
      updated: {
        "mat-seed-emma-1": { sharingLevel: "private" as const, updatedAt: "2026-08-20T11:00:00.000Z" },
      },
    };
    const coachView = listClientMaterials(emma, "coach", state);
    expect(coachView.some((item) => item.id === "mat-seed-emma-1")).toBe(false);
  });

  it("krymper tillstånd så att det får plats i cookie", () => {
    const big = {
      ...EMPTY_DEMO_MATERIALS_STATE,
      added: Array.from({ length: 20 }, (_, index) => ({
        ...added,
        id: `mat-test-${index}`,
        title: `Anteckning ${index}`,
        noteText: "x".repeat(200),
      })),
    };
    const fitted = fitMaterialsWithinCookie(big);
    expect(fitted.added.length).toBeLessThan(big.added.length);
  });

  it("sanerar okänd indata", () => {
    const state = normaliseDemoMaterialsState({ added: [{ id: 1 }, added], deletedIds: ["x"] });
    expect(state.added).toHaveLength(1);
    expect(state.deletedIds).toEqual(["x"]);
  });
});

describe("material — klientvy och dossier", () => {
  it("exponerar material i klientperspektiv", () => {
    const view = buildClientPerspective(coachId, emma);
    expect(view!.materials.length).toBeGreaterThanOrEqual(3);
    expect(view!.nextSessionMaterialCount).toBeGreaterThanOrEqual(2);
  });

  it("räknar material kopplade till nästa session", () => {
    expect(countMaterialsLinkedToNextSession(emma)).toBeGreaterThanOrEqual(2);
  });

  it("filtrerar privat material i coach-dossier", () => {
    const dossier = buildClientDossier(coachId, emma);
    expect(dossier!.materials.some((item) => item.id === "mat-seed-emma-2")).toBe(false);
    expect(dossier!.materials.some((item) => item.id === "mat-seed-emma-1")).toBe(true);
  });
});
