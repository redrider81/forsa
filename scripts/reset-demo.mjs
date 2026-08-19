/**
 * Återställer CVB Coachings demoläge mot en körande instans.
 *
 *   npm run dev            (i en terminal)
 *   npm run reset:demo     (i en annan)
 *
 * Demoläget lagras i en signerad cookie per webbläsare, så skriptet loggar in
 * som coach, anropar reset-endpointen och bekräftar att tillståndet är tomt.
 * Klienten kan aldrig anropa detta — endpointen kräver coachsession.
 */

const BASE = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.PORTAL_DEMO_COACH_EMAIL ?? "carolina@cvbcoaching.se";
const PASSWORD = process.env.PORTAL_DEMO_PASSWORD ?? "cvb-demo-2026";

let cookie = "";

async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers ?? {}),
    },
  });
  const raw = response.headers.getSetCookie?.() ?? [];
  for (const entry of raw) {
    const pair = entry.split(";")[0];
    const name = pair.split("=")[0];
    cookie = cookie
      .split("; ")
      .filter((item) => item && item.split("=")[0] !== name)
      .concat(pair)
      .join("; ");
  }
  return response;
}

async function main() {
  const login = await call("/api/portal/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, role: "coach" }),
  });
  if (!login.ok) {
    console.error(`Kunde inte logga in som coach (${login.status}). Kör servern igång först.`);
    process.exit(1);
  }

  const reset = await call("/api/portal/demo/reset", { method: "POST" });
  if (!reset.ok) {
    console.error(`Återställningen misslyckades (${reset.status}).`);
    process.exit(1);
  }

  console.log("Demoläget är återställt till seed-datan.");
  console.log("Klientens reflektioner, sessionsförberedelse och statusändringar är borta.");
  console.log("");
  console.log("Obs: demoläget lagras per webbläsare. Har du redan lagt in data i din egen");
  console.log("webbläsare återställer du den via Profil → Återställ demoläge i coachportalen.");
}

main().catch((error) => {
  console.error("Återställningen avbröts:", error.message ?? error);
  process.exit(1);
});
