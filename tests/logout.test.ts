import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { signOut } }),
}));

const { POST } = await import("@/app/api/portal/auth/logout/route");
const { logoutLabel, runLogout } = await import("@/components/portal/use-logout");

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("POST /api/portal/auth/logout", () => {
  beforeEach(() => signOut.mockReset());

  it("bekräftar en lyckad utloggning", async () => {
    signOut.mockResolvedValue({ error: null });
    const response = await POST();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("svarar med fel när Supabase inte kan logga ut, utan att exponera detaljer", async () => {
    signOut.mockResolvedValue({
      error: { name: "AuthApiError", status: 500, message: "internal token detail" },
    });
    const response = await POST();
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body).toEqual({ ok: false, error: "Utloggningen misslyckades." });
    expect(JSON.stringify(body)).not.toContain("token");
  });
});

describe("runLogout", () => {
  it.each(["/coach-login", "/klient-login"] as const)(
    "navigerar till %s först efter bekräftad utloggning",
    async (destination) => {
      const navigate = vi.fn();
      const request = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
      await expect(runLogout(destination, navigate, request)).resolves.toBe(true);
      expect(request).toHaveBeenCalledWith("/api/portal/auth/logout", { method: "POST" });
      expect(navigate).toHaveBeenCalledWith(destination);
    },
  );

  it("stannar kvar när servern rapporterar fel", async () => {
    const navigate = vi.fn();
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: false, error: "Utloggningen misslyckades." }, 502));
    await expect(runLogout("/klient-login", navigate, request)).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("stannar kvar vid serverfel utan JSON-svar", async () => {
    const navigate = vi.fn();
    const request = vi.fn().mockResolvedValue(new Response("Internal Server Error", { status: 500 }));
    await expect(runLogout("/coach-login", navigate, request)).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("kräver uttryckligt ok även vid status 200", async () => {
    const navigate = vi.fn();
    const request = vi.fn().mockResolvedValue(jsonResponse({}));
    await expect(runLogout("/klient-login", navigate, request)).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("stannar kvar vid nätverksfel", async () => {
    const navigate = vi.fn();
    const request = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(runLogout("/coach-login", navigate, request)).resolves.toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("logoutLabel", () => {
  it("visar läge, pågående och fel för användaren", () => {
    expect(logoutLabel(false, false)).toBe("Logga ut");
    expect(logoutLabel(true, false)).toBe("Loggar ut…");
    expect(logoutLabel(false, true)).toBe("Utloggningen misslyckades – försök igen");
    expect(logoutLabel(true, true)).toBe("Loggar ut…");
  });
});
