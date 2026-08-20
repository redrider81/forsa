import { describe, expect, it } from "vitest";
import type { OperationsStatus } from "@/lib/portal/repository";
import {
  getOperationsStatusPresentation,
  operationsStatusVisualState,
} from "@/lib/portal/status-tones";

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
      "Förberedelse saknas": "action",
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

  it("maps visual states to canonical tone classes", () => {
    const samples: Array<[OperationsStatus, string, string]> = [
      ["Uppföljning krävs", "action", "border-orange-400 bg-orange-400 text-white"],
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
