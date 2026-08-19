import { describe, expect, it } from "vitest";
import {
  EMPTY_DEMO_STATE,
  MAX_STATE_BYTES,
  fitWithinCookie,
  isEmptyDemoState,
  normaliseDemoState,
  type DemoState,
} from "@/lib/portal/store/demo-state";
import {
  buildClientActivity,
  buildClientDossier,
  buildClientPerspective,
  buildDashboardData,
  listCommitments,
  listReflections,
  listSessions,
} from "@/lib/portal/repository";
import { buildClientContext } from "@/lib/ai/context";

const coachId = "coach-cvb";
const emma = "klient-emma-lind";

const stateWithInput: DemoState = {
  v: 1,
  reflections: [
    {
      id: "refl-egen-1",
      clientId: emma,
      date: "2026-08-19",
      prompt: "Egen reflektion",
      text: "Jag märker att jag inte längre går in i alla operativa frågor, men när en viktig kund är involverad tar jag fortfarande ofta tillbaka beslutet.",
    },
  ],
  prep: {
    [emma]: {
      clientId: emma,
      focus: "Jag vill prata om hur jag kan skapa tydligare mandat för ledningsgruppen.",
      desiredOutcome: "Att veta vad jag ska äga och vad jag ska släppa.",
      changed: "Jag går inte in lika snabbt längre.",
      followUp: "Hur jag arbetar med gruppen som grupp.",
      updatedAt: "2026-08-19T08:00:00.000Z",
    },
  },
  commitments: {
    "ata-emma-5": { status: "genomfort", clientNote: "Bokade samtalet till sist.", updatedAt: "2026-08-19T08:05:00.000Z" },
  },
};

describe("demo-state", () => {
  it("saneras från okänd indata", () => {
    const state = normaliseDemoState({
      reflections: [{ id: 1 }, { id: "a", clientId: emma, date: "2026-01-01", text: "hej" }],
      prep: { [emma]: { focus: "x" } },
      commitments: { a: { status: "ogiltig" }, b: { status: "pagar", updatedAt: "2026-01-01" } },
    });
    expect(state.reflections).toHaveLength(1);
    expect(state.prep[emma].desiredOutcome).toBe("");
    expect(Object.keys(state.commitments)).toEqual(["b"]);
  });

  it("känner igen tomt tillstånd", () => {
    expect(isEmptyDemoState(EMPTY_DEMO_STATE)).toBe(true);
    expect(isEmptyDemoState(stateWithInput)).toBe(false);
  });

  it("krymper tillståndet så att det får plats i en cookie", () => {
    const big: DemoState = {
      ...EMPTY_DEMO_STATE,
      reflections: Array.from({ length: 30 }, (_, index) => ({
        id: `r${index}`,
        clientId: emma,
        date: "2026-08-19",
        prompt: "Egen reflektion",
        text: "x".repeat(400),
      })),
    };
    const fitted = fitWithinCookie(big);
    expect(Buffer.byteLength(JSON.stringify(fitted), "utf8")).toBeLessThanOrEqual(MAX_STATE_BYTES);
    // Nyaste reflektionen behålls.
    expect(fitted.reflections.at(-1)?.id).toBe("r29");
  });
});

describe("klientinput syns för coachen", () => {
  it("lägger klientens reflektion överst", () => {
    const before = listReflections(coachId, emma, EMPTY_DEMO_STATE);
    const after = listReflections(coachId, emma, stateWithInput);
    expect(after.length).toBe(before.length + 1);
    expect(after[0].text).toContain("viktig kund");
  });

  it("skriver över fokus på kommande session", () => {
    const upcoming = listSessions(coachId, emma, stateWithInput).find(
      (item) => item.status === "kommande",
    );
    expect(upcoming?.clientFocus).toContain("tydligare mandat");
  });

  it("uppdaterar åtagandets status", () => {
    const commitment = listCommitments(coachId, emma, stateWithInput).find(
      (item) => item.id === "ata-emma-5",
    );
    expect(commitment?.status).toBe("genomfort");
    expect(commitment?.clientNote).toContain("Bokade samtalet");
  });

  it("visar aktivitet i coachens översikt", () => {
    const activity = buildClientActivity(coachId, stateWithInput);
    const labels = activity.map((item) => item.label);
    expect(labels).toContain("Emma Lind — ny reflektion");
    expect(labels).toContain("Emma Lind — förberedelse mottagen");
    expect(labels).toContain("Emma Lind — åtagande uppdaterat");

    const dashboard = buildDashboardData(coachId, "2026-08-19", stateWithInput);
    expect(dashboard.clientActivity.length).toBe(3);
  });

  it("påverkar aldrig en annan klient", () => {
    const other = listReflections(coachId, "klient-johan-bergstrom", stateWithInput);
    const baseline = listReflections(coachId, "klient-johan-bergstrom", EMPTY_DEMO_STATE);
    expect(other).toEqual(baseline);
  });
});

describe("AI-underlaget använder klientens nya information", () => {
  const context = buildClientContext(coachId, emma, stateWithInput);

  it("innehåller klientens förberedelse", () => {
    expect(context).not.toBeNull();
    expect(context!.text).toContain("KLIENTENS EGEN FÖRBEREDELSE INFÖR NÄSTA SAMTAL");
    expect(context!.text).toContain("tydligare mandat");
  });

  it("innehåller den nya reflektionen", () => {
    expect(context!.text).toContain("viktig kund är involverad");
  });

  it("redovisar underlaget för coachen", () => {
    const sources = context!.sources.join(" ");
    expect(sources).toContain("Förberedelse inför nästa session");
    expect(sources).toContain("Session");
    expect(sources).toContain("Reflektion");
  });

  it("läcker fortfarande inte coachens privata anteckningar", () => {
    expect(context!.text).not.toContain("Hon undvek styrelsefrågan tre gånger");
  });
});

describe("klientens eget perspektiv", () => {
  const view = buildClientPerspective(coachId, emma, stateWithInput);

  it("visar hennes egen förberedelse och reflektion", () => {
    expect(view!.prep?.focus).toContain("tydligare mandat");
    expect(view!.reflections[0].text).toContain("viktig kund");
  });

  it("innehåller aldrig coachanteckningar", () => {
    expect(JSON.stringify(view)).not.toContain("Hon undvek styrelsefrågan tre gånger");
    expect(JSON.stringify(view)).not.toContain("coachNotes");
  });

  it("dossier och klientvy ser samma klientinput", () => {
    const dossier = buildClientDossier(coachId, emma, stateWithInput);
    expect(dossier!.prep?.focus).toBe(view!.prep?.focus);
    expect(dossier!.clientWrittenReflectionIds).toEqual(["refl-egen-1"]);
  });
});
