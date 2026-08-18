import { describe, expect, it } from "vitest";
import { parseAiText } from "@/lib/ai/format";

describe("parseAiText", () => {
  it("tolkar rubriker, brödtext och punktlistor", () => {
    const blocks = parseAiText(
      [
        "Sammanfattning",
        "Emma har flyttat fokus från leverans till riktning.",
        "Möjligt att utforska",
        "- Vad gör styrelsesamtalet svårt?",
        "- Vad skulle behöva vara sant för att boka det?",
      ].join("\n"),
    );

    expect(blocks[0]).toEqual({ type: "heading", text: "Sammanfattning" });
    expect(blocks[1].type).toBe("paragraph");
    expect(blocks[2]).toEqual({ type: "heading", text: "Möjligt att utforska" });
    expect(blocks[3]).toEqual({ type: "bullet", text: "Vad gör styrelsesamtalet svårt?" });
  });

  it("rensar markdown som modellen råkar skicka", () => {
    const blocks = parseAiText("## Osäkerheter\n**Underlaget räcker inte för att uttala sig.**");
    expect(blocks[0]).toEqual({ type: "heading", text: "Osäkerheter" });
    expect(blocks[1]).toEqual({
      type: "paragraph",
      text: "Underlaget räcker inte för att uttala sig.",
    });
  });

  it("hoppar över tomma rader", () => {
    expect(parseAiText("\n\n  \n")).toEqual([]);
  });
});
