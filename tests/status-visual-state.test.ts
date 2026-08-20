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

  it("keeps semantic action/active/completed/neutral mapping", () => {
    const expected: Partial<Record<OperationsStatus, string>> = {
      "Uppföljning krävs": "action",
      "Förberedelse saknas": "action",
      "Förberedelse mottagen": "completed",
      "Session idag": "active",
      Programgenomgång: "active",
      "Session planerad": "neutral",
    };

    for (const [status, visualState] of Object.entries(expected)) {
      expect(operationsStatusVisualState[status as OperationsStatus]).toBe(visualState);
    }
  });
});
