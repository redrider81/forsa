import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/portal/token";

const secret = "test-secret-som-är-tillräckligt-långt";
const session = {
  userId: "user-carolina",
  coachId: "coach-cvb",
  name: "Carolina von Braun",
  role: "coach",
} as const;

describe("sessionstoken", () => {
  it("signerar och verifierar", () => {
    const token = createSessionToken(session, secret);
    expect(verifySessionToken(token, secret)?.coachId).toBe("coach-cvb");
  });

  it("avvisar manipulerad payload", () => {
    const token = createSessionToken(session, secret);
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...session, coachId: "coach-annan", issuedAt: Date.now() }),
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

  it("avvisar tomt eller trasigt värde", () => {
    expect(verifySessionToken(undefined, secret)).toBeNull();
    expect(verifySessionToken("inte-en-token", secret)).toBeNull();
  });
});
