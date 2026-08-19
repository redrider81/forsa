import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/portal/token";

const secret = "test-secret-som-är-tillräckligt-långt";
const session = {
  userId: "user-carolina",
  subjectId: "coach-cvb",
  name: "Carolina von Braun",
  role: "coach",
} as const;

describe("sessionstoken", () => {
  it("signerar och verifierar", () => {
    const token = createSessionToken(session, secret);
    expect(verifySessionToken(token, secret)?.subjectId).toBe("coach-cvb");
  });

  it("avvisar manipulerad payload", () => {
    const token = createSessionToken(session, secret);
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...session, subjectId: "coach-annan", issuedAt: Date.now() }),
    ).toString("base64url");
    expect(verifySessionToken(`${forged}.${signature}`, secret)).toBeNull();
  });

  it("avvisar token signerad med annan hemlighet", () => {
    const token = createSessionToken(session, "en-helt-annan-hemlighet-här");
    expect(verifySessionToken(token, secret)).toBeNull();
  });

  it("avvisar utgången session", () => {
    const issuedAt = 1_000_000;
    const token = createSessionToken(session, secret, issuedAt);
    const later = issuedAt + SESSION_MAX_AGE_SECONDS * 1000 + 1;
    expect(verifySessionToken(token, secret, later)).toBeNull();
  });

  it("avvisar token med okänd roll", () => {
    const forged = Buffer.from(
      JSON.stringify({ ...session, role: "admin", issuedAt: Date.now() }),
    ).toString("base64url");
    expect(verifySessionToken(`${forged}.signatur`, secret)).toBeNull();
  });

  it("skiljer coach- och klientsession åt", () => {
    const clientToken = createSessionToken(
      { userId: "user-emma", subjectId: "klient-emma-lind", name: "Emma Lind", role: "klient" },
      secret,
    );
    const parsed = verifySessionToken(clientToken, secret);
    expect(parsed?.role).toBe("klient");
    expect(parsed?.subjectId).toBe("klient-emma-lind");
  });

  it("avvisar tomt eller trasigt värde", () => {
    expect(verifySessionToken(undefined, secret)).toBeNull();
    expect(verifySessionToken("inte-en-token", secret)).toBeNull();
  });
});
