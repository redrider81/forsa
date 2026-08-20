import { describe, expect, it } from "vitest";
import { buildOperationsOverview, type OperationsStatus } from "@/lib/portal/repository";
import {
  getOperationsStatusPresentation,
  operationsStatusVisualState,
} from "@/lib/portal/status-tones";
import { EMPTY_DEMO_STATE } from "@/lib/portal/store/demo-state";

describe("operations status presentation", () => {
  it("maps Förberedelse mottagen to completed tone, not action", () => {
    const presentation = getOperationsStatusPresentation("Förberedelse mottagen");

    expect(presentation.label).toBe("Förberedd");
    expect(presentation.visualState).toBe("completed");
    expect(presentation.toneClass).toContain("emerald-700/20");
    expect(presentation.toneClass).not.toContain("orange");
  });

  it("locks full OperationsStatus → visual state mapping", () => {
    const expected: Record<OperationsStatus, string> = {
      "Uppföljning krävs": "action",
      "Förberedelse saknas": "prep",
      "Sammanfattning för granskning": "action",
      "Underlag saknas": "neutral",
      Programgenomgång: "active",
      "Session idag": "active",
      "Förberedelse mottagen": "completed",
      "Session genomförd": "completed",
      "Underlag mottaget": "completed",
      "Session planerad": "neutral",
      "Ny reflektion": "neutral",
      "Åtagande uppdaterat": "neutral",
    };

    for (const [status, visualState] of Object.entries(expected)) {
      expect(operationsStatusVisualState[status as OperationsStatus]).toBe(visualState);
    }
  });

  it("derives Förberedd from Johan prep in operations overview", () => {
    const state = {
      ...EMPTY_DEMO_STATE,
      prep: {
        "klient-johan-bergstrom": {
          clientId: "klient-johan-bergstrom",
          focus: "Test",
          desiredOutcome: "Test",
          changed: "",
          followUp: "",
          updatedAt: "2026-08-20T08:00:00.000Z",
        },
      },
    };
    const ops = buildOperationsOverview("coach-cvb", "2026-08-20", state, 21);
    const johan = ops.calendar.find((item) => item.subject.includes("Johan"));
    expect(johan?.status).toBe("Förberedelse mottagen");

    const presentation = getOperationsStatusPresentation(johan!.status);
    expect(presentation.label).toBe("Förberedd");
    expect(presentation.visualState).toBe("completed");
    expect(presentation.toneClass).toBe("border-emerald-700/20 bg-emerald-700/6 text-emerald-900");
  });

  it("derives Förbered yellow prep tone when prep is missing", () => {
    const ops = buildOperationsOverview("coach-cvb", "2026-08-20", EMPTY_DEMO_STATE, 21);
    const johan = ops.calendar.find((item) => item.subject.includes("Johan"));
    expect(johan?.status).toBe("Förberedelse saknas");

    const presentation = getOperationsStatusPresentation(johan!.status);
    expect(presentation.label).toBe("Förbered");
    expect(presentation.visualState).toBe("prep");
    expect(presentation.toneClass).toBe("border-yellow-400 bg-yellow-400 text-white");
  });

  it("maps visual states to canonical tone classes", () => {
    const samples: Array<[OperationsStatus, string, string]> = [
      ["Uppföljning krävs", "action", "border-orange-400 bg-orange-400 text-white"],
      ["Förberedelse saknas", "prep", "border-yellow-400 bg-yellow-400 text-white"],
      ["Programgenomgång", "active", "border-emerald-500 bg-emerald-500 text-white"],
      ["Förberedelse mottagen", "completed", "border-emerald-700/20 bg-emerald-700/6 text-emerald-900"],
      ["Session planerad", "neutral", "border-zinc-300/80 bg-zinc-50 text-zinc-700"],
    ];

    for (const [status, visualState, toneClass] of samples) {
      const presentation = getOperationsStatusPresentation(status);
      expect(presentation.visualState).toBe(visualState);
      expect(presentation.toneClass).toBe(toneClass);
    }
  });
});
