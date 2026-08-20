import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/portal/session", () => ({
  readCoachSession: vi.fn(),
}));

vi.mock("@/lib/email/resend-provider", () => ({
  createResendProvider: vi.fn(() => {
    throw new Error("Resend ska inte anropas i simulerat läge.");
  }),
}));

import { readCoachSession } from "@/lib/portal/session";
import { createResendProvider } from "@/lib/email/resend-provider";
import { POST } from "@/app/api/portal/email-result/route";
import {
  RESULT_EMAIL_RECIPIENT,
  assertEmailProductionConfig,
  containsForbiddenAiWording,
  isEmailSendEnabled,
  sendResultEmail,
  validateResultEmailPayload,
  type EmailProvider,
} from "@/lib/email/result-email";

const originalEnv = { ...process.env };

function mockProvider(): EmailProvider & { send: ReturnType<typeof vi.fn> } {
  return {
    send: vi.fn(async () => ({ id: "mock-message-id" })),
  };
}

beforeEach(() => {
  delete process.env.EMAIL_SEND_ENABLED;
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  vi.mocked(readCoachSession).mockReset();
  vi.mocked(createResendProvider).mockClear();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("validateResultEmailPayload", () => {
  it("accepterar giltigt ämne och body", () => {
    const result = validateResultEmailPayload({
      subject: "CVB Coaching – Underlag för Emma Lindqvist",
      body: "Sammanfattning\n\nEmma har flyttat fokus.",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.subject).toContain("Emma Lindqvist");
      expect(result.payload.body).toContain("Sammanfattning");
    }
  });

  it("avvisar tomma fält", () => {
    expect(validateResultEmailPayload({ subject: "", body: "text" }).ok).toBe(false);
    expect(validateResultEmailPayload({ subject: "ämne", body: "" }).ok).toBe(false);
  });

  it("avvisar förbjudna AI-formuleringar", () => {
    expect(containsForbiddenAiWording("AI-underlag")).toBe(true);
    expect(containsForbiddenAiWording("AI-genererat")).toBe(true);
    expect(containsForbiddenAiWording("Detta är AI")).toBe(true);
    expect(containsForbiddenAiWording("artificiell intelligens")).toBe(true);

    const result = validateResultEmailPayload({
      subject: "CVB Coaching – Underlag",
      body: "AI-genererat svar",
    });
    expect(result.ok).toBe(false);
  });

  it("behåller hela body utan kapning", () => {
    const body = "Sammanfattning\n\n" + "Rad med innehåll.\n".repeat(500);
    const result = validateResultEmailPayload({
      subject: "CVB Coaching – Underlag för Emma Lind",
      body,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.body).toBe(body.trim());
      expect(result.payload.body.length).toBeGreaterThan(5000);
    }
  });
});

describe("sendResultEmail", () => {
  it("simulerar utan att anropa provider när EMAIL_SEND_ENABLED inte är true", async () => {
    const provider = mockProvider();
    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await sendResultEmail(
      {
        subject: "CVB Coaching – Underlag för Emma Lindqvist",
        body: "Sammanfattning\n\nEmma har flyttat fokus.",
      },
      { provider },
    );

    expect(result).toEqual({ simulated: true });
    expect(provider.send).not.toHaveBeenCalled();
    expect(createResendProvider).not.toHaveBeenCalled();
    expect(isEmailSendEnabled()).toBe(false);
    expect(logSpy).toHaveBeenCalledWith(
      "[CVB Coaching] E-post simulerad (EMAIL_SEND_ENABLED !== true)",
      expect.objectContaining({
        recipient: RESULT_EMAIL_RECIPIENT,
        subjectLength: expect.any(Number),
        bodyLength: expect.any(Number),
      }),
    );
  });

  it("skickar till låst recipient via mockad provider när EMAIL_SEND_ENABLED=true", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <underlag@cvbcoaching.se>";
    process.env.RESEND_API_KEY = "test-resend-key";

    const provider = mockProvider();
    const longBody = "Sammanfattning\n\n" + "• Punkt med innehåll\n".repeat(120);

    const result = await sendResultEmail(
      {
        subject: "CVB Coaching – Förberedelse inför samtal med Johan Berg",
        body: longBody,
      },
      { provider },
    );

    expect(result).toEqual({ simulated: false, id: "mock-message-id" });
    expect(provider.send).toHaveBeenCalledOnce();
    expect(provider.send).toHaveBeenCalledWith({
      from: "CVB Coaching <underlag@cvbcoaching.se>",
      to: RESULT_EMAIL_RECIPIENT,
      subject: "CVB Coaching – Förberedelse inför samtal med Johan Berg",
      body: longBody,
    });
    expect(RESULT_EMAIL_RECIPIENT).toBe("carolinavonbraun@gmail.com");
    expect(createResendProvider).not.toHaveBeenCalled();
  });

  it("kräver production config när live-sändning är aktiverad", () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    expect(() => assertEmailProductionConfig()).toThrow(
      "E-postfunktionen saknar API-nyckel i den här miljön.",
    );
  });

  it("propagerar providerfel utan att logga body", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <underlag@cvbcoaching.se>";
    process.env.RESEND_API_KEY = "test-resend-key";

    const provider: EmailProvider = {
      send: vi.fn(async () => {
        throw new Error("provider down");
      }),
    };

    await expect(
      sendResultEmail(
        { subject: "CVB Coaching – Underlag för Emma Lind", body: "Sammanfattning" },
        { provider },
      ),
    ).rejects.toThrow("provider down");
  });
});

describe("POST /api/portal/email-result", () => {
  it("returnerar 401 utan coachsession", async () => {
    vi.mocked(readCoachSession).mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/portal/email-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "CVB Coaching – Underlag för Emma Lindqvist",
          body: "Sammanfattning",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(createResendProvider).not.toHaveBeenCalled();
  });

  it("returnerar simulated success med coachsession utan Resend-anrop", async () => {
    vi.mocked(readCoachSession).mockResolvedValue({
      userId: "coach-user",
      name: "Carolina von Braun",
      coachId: "coach-cvb",
    });

    const response = await POST(
      new Request("http://localhost/api/portal/email-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "CVB Coaching – Underlag för Emma Lindqvist",
          body: "Sammanfattning\n\nEmma har flyttat fokus.",
        }),
      }),
    );

    const data = (await response.json()) as { ok: boolean; simulated?: boolean };
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true, simulated: true });
    expect(createResendProvider).not.toHaveBeenCalled();
  });

  it("avvisar försök att skicka recipient från frontend", async () => {
    vi.mocked(readCoachSession).mockResolvedValue({
      userId: "coach-user",
      name: "Carolina von Braun",
      coachId: "coach-cvb",
    });

    const response = await POST(
      new Request("http://localhost/api/portal/email-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "CVB Coaching – Underlag för Emma Lind",
          body: "Sammanfattning",
          recipient: "annan@example.com",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createResendProvider).not.toHaveBeenCalled();
  });

  it("returnerar simulated:false när live-sändning lyckas", async () => {
    process.env.EMAIL_SEND_ENABLED = "true";
    process.env.EMAIL_FROM = "CVB Coaching <underlag@cvbcoaching.se>";
    process.env.RESEND_API_KEY = "test-resend-key";

    vi.mocked(readCoachSession).mockResolvedValue({
      userId: "coach-user",
      name: "Carolina von Braun",
      coachId: "coach-cvb",
    });
    vi.mocked(createResendProvider).mockReturnValue(mockProvider());

    const response = await POST(
      new Request("http://localhost/api/portal/email-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "CVB Coaching – Underlag för Emma Lind",
          body: "Sammanfattning\n\nEmma har flyttat fokus.",
        }),
      }),
    );

    const data = (await response.json()) as { ok: boolean; simulated?: boolean };
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true, simulated: false });
    expect(createResendProvider).toHaveBeenCalledOnce();
  });
});
