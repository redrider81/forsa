import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiError, PRIMARY_MODEL, generate, hasApiKey, modelCandidates } from "@/lib/ai/openai";

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const okPayload = {
  output: [{ type: "message", content: [{ type: "output_text", text: "Sammanfattning\nAllt väl." }] }],
};

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-key";
  delete process.env.OPENAI_MODEL;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  vi.restoreAllMocks();
});

describe("OpenAI-integration", () => {
  it("känner av att nyckeln saknas", async () => {
    delete process.env.OPENAI_API_KEY;
    expect(hasApiKey()).toBe(false);
    await expect(generate({ system: "s", user: "u" })).rejects.toBeInstanceOf(AiError);
  });

  it("använder GPT-5.6 som primär modell", () => {
    expect(PRIMARY_MODEL).toBe("gpt-5.6");
    expect(modelCandidates()[0]).toBe("gpt-5.6");
  });

  it("låter OPENAI_MODEL gå före den primära modellen", () => {
    process.env.OPENAI_MODEL = "gpt-5.6-sol";
    expect(modelCandidates()[0]).toBe("gpt-5.6-sol");
  });

  it("anropar Responses API med rätt struktur", async () => {
    const calls: Array<{ url: string; body: Record<string, unknown>; auth: string | null }> = [];
    globalThis.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(url),
        body: JSON.parse(String(init?.body)),
        auth: new Headers(init?.headers).get("Authorization"),
      });
      return jsonResponse(okPayload);
    }) as unknown as typeof fetch;

    const result = await generate({ system: "systeminstruktion", user: "underlag", effort: "high" });

    expect(result.text).toContain("Sammanfattning");
    expect(calls[0].url).toBe("https://api.openai.com/v1/responses");
    expect(calls[0].auth).toBe("Bearer test-key");
    expect(calls[0].body.input).toEqual([
      { role: "developer", content: "systeminstruktion" },
      { role: "user", content: "underlag" },
    ]);
    expect(calls[0].body.reasoning).toEqual({ effort: "high" });
    expect(calls[0].body.model).toBe("gpt-5.6");
  });

  it("byter aldrig modell vid serverfel — reserven är bara för saknad modell", async () => {
    const used: string[] = [];
    globalThis.fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      used.push((JSON.parse(String(init?.body)) as { model: string }).model);
      return new Response("internal error", { status: 500 });
    }) as unknown as typeof fetch;

    await expect(generate({ system: "s", user: "u" })).rejects.toBeInstanceOf(AiError);
    expect(new Set(used)).toEqual(new Set(["gpt-5.6"]));
  });

  it("byter aldrig modell vid timeout", async () => {
    const used: string[] = [];
    globalThis.fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      used.push((JSON.parse(String(init?.body)) as { model: string }).model);
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      throw abortError;
    }) as unknown as typeof fetch;

    await expect(generate({ system: "s", user: "u" })).rejects.toMatchObject({ code: "timeout" });
    expect(new Set(used)).toEqual(new Set(["gpt-5.6"]));
  });

  it("faller tillbaka till nästa modell när modellen inte finns", async () => {
    const used: string[] = [];
    globalThis.fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      used.push(body.model);
      if (used.length === 1) {
        return new Response(
          JSON.stringify({ error: { message: "The model `gpt-5.6` does not exist." } }),
          { status: 404 },
        );
      }
      return jsonResponse(okPayload);
    }) as unknown as typeof fetch;

    const result = await generate({ system: "s", user: "u" });
    expect(used[0]).toBe("gpt-5.6");
    expect(used.length).toBe(2);
    expect(result.model).toBe(used[1]);
  });

  it("gör om anropet vid tillfälligt fel", async () => {
    let attempts = 0;
    globalThis.fetch = vi.fn(async () => {
      attempts += 1;
      if (attempts === 1) return new Response("rate limited", { status: 429 });
      return jsonResponse(okPayload);
    }) as unknown as typeof fetch;

    const result = await generate({ system: "s", user: "u" });
    expect(attempts).toBe(2);
    expect(result.text).toContain("Allt väl");
  });

  it("ger ett svenskt felmeddelande när tjänsten inte svarar", async () => {
    globalThis.fetch = vi.fn(async () => new Response("boom", { status: 500 })) as unknown as typeof fetch;

    await expect(generate({ system: "s", user: "u" })).rejects.toMatchObject({
      userMessage: "Det gick inte att skapa sammanställningen just nu. Försök igen.",
    });
  });

  it("utelämnar reasoning för modeller som inte stödjer det", async () => {
    process.env.OPENAI_MODEL = "gpt-4.1";
    let body: Record<string, unknown> = {};
    globalThis.fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      body = JSON.parse(String(init?.body));
      return jsonResponse(okPayload);
    }) as unknown as typeof fetch;

    await generate({ system: "s", user: "u" });
    expect(body.model).toBe("gpt-4.1");
    expect(body.reasoning).toBeUndefined();
  });
});
