import { describe, expect, it } from "vitest";
import type { OperationsItem } from "@/lib/portal/repository";
import {
  actionMetaLine,
  actionPriorityScore,
  sortActionItems,
} from "@/lib/portal/operations-priority";

const today = "2026-08-20";

function item(partial: Partial<OperationsItem> & Pick<OperationsItem, "id">): OperationsItem {
  return {
    date: "2026-08-25",
    time: "10:00",
    subject: "Test",
    subjectHref: "/portal/klienter/x",
    context: "Context",
    kind: "Coachingsamtal",
    status: "Förberedelse saknas",
    ...partial,
  };
}

describe("operations-priority", () => {
  it("prioriterar försenad uppföljning före kommande session", () => {
    const overdue = item({
      id: "a",
      date: "2026-08-10",
      kind: "Uppföljning",
      status: "Uppföljning krävs",
    });
    const prep = item({ id: "b", date: "2026-08-21", status: "Förberedelse saknas" });

    expect(actionPriorityScore(overdue, today)).toBeLessThan(actionPriorityScore(prep, today));
    expect(sortActionItems([prep, overdue], today)[0]?.id).toBe("a");
  });

  it("prioriterar session utan förberedelse före programgenomgång", () => {
    const prep = item({ id: "a", date: "2026-08-22", status: "Förberedelse saknas" });
    const programme = item({
      id: "b",
      date: "2026-08-24",
      kind: "Programgenomgång",
      status: "Programgenomgång",
    });

    expect(sortActionItems([programme, prep], today)[0]?.id).toBe("a");
  });

  it("beskriver försenad uppföljning i metadata", () => {
    const overdue = item({
      id: "a",
      date: "2026-05-21",
      kind: "Uppföljning",
      status: "Uppföljning krävs",
    });

    expect(actionMetaLine(overdue, today)).toContain("Försenad sedan");
    expect(actionMetaLine(overdue, today)).toContain("UPPFÖLJNING");
  });
});
