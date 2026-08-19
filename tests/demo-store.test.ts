import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decodeDemoState, encodeDemoState } from "@/lib/portal/store/demo-store";
import { EMPTY_DEMO_STATE, type DemoState } from "@/lib/portal/store/demo-state";

const state: DemoState = {
  v: 1,
  reflections: [
    { id: "r1", clientId: "klient-emma-lind", date: "2026-08-19", prompt: "Egen reflektion", text: "Hej" },
  ],
  prep: {},
  commitments: {},
};

beforeEach(() => {
  process.env.PORTAL_SESSION_SECRET = "test-hemlighet-som-ar-lang-nog";
});

afterEach(() => {
  delete process.env.PORTAL_SESSION_SECRET;
});

describe("demo-state i cookie", () => {
  it("kodar och avkodar", () => {
    const decoded = decodeDemoState(encodeDemoState(state));
    expect(decoded.reflections[0].text).toBe("Hej");
  });

  it("avvisar manipulerat innehåll", () => {
    const token = encodeDemoState(state);
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...state, reflections: [{ ...state.reflections[0], text: "Injicerad" }] }),
    ).toString("base64url");
    expect(decodeDemoState(`${forged}.${signature}`)).toEqual(EMPTY_DEMO_STATE);
  });

  it("avvisar token signerad med annan hemlighet", () => {
    const token = encodeDemoState(state);
    process.env.PORTAL_SESSION_SECRET = "en-helt-annan-hemlighet-har";
    expect(decodeDemoState(token)).toEqual(EMPTY_DEMO_STATE);
  });

  it("ger tomt tillstånd för saknat eller trasigt värde", () => {
    expect(decodeDemoState(undefined)).toEqual(EMPTY_DEMO_STATE);
    expect(decodeDemoState("skräp")).toEqual(EMPTY_DEMO_STATE);
  });
});
