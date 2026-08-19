/**
 * Demo-state för CVB Coaching.
 *
 * VIKTIGT — DETTA ÄR INTE EN DATABAS.
 *
 * Klientens egna tillägg (reflektioner, förberedelse inför nästa session och
 * statusuppdateringar på åtaganden) lagras som ett signerat lager ovanpå den
 * deterministiska seed-datan. Lagret färdas med varje request i en httpOnly-
 * cookie och är HMAC-signerat, så det kan varken läsas eller ändras från
 * klientkoden.
 *
 * Varför cookie och inte filsystem eller processminne:
 * på Vercel är filsystemet skrivskyddat, /tmp är instansbundet och
 * processminnet försvinner mellan anrop. Ett tillstånd som färdas med requesten
 * fungerar däremot identiskt på varje serverless-instans.
 *
 * Vad detta ger:
 *   - överlever refresh, utloggning, ny inloggning och omstart av webbläsaren
 *   - fungerar på alla serverless-instanser
 *   - samma webbläsare delar demoläge mellan klient- och coachinloggning,
 *     vilket är precis vad demoflödet Emma → Carolina behöver
 *
 * Vad detta INTE ger:
 *   - synkronisering mellan olika enheter eller webbläsare
 *
 * Den begränsningen är medveten och dokumenterad i README. Produktionsversionen
 * ersätter detta lager med ett riktigt datalager bakom samma repository-API.
 */

export const DEMO_STATE_VERSION = 1;

/** Max storlek på serialiserat tillstånd. Cookies är begränsade till ~4 kB. */
export const MAX_STATE_BYTES = 3200;

export type DemoReflection = {
  id: string;
  clientId: string;
  date: string;
  prompt: string;
  text: string;
};

export type DemoSessionPrep = {
  clientId: string;
  focus: string;
  desiredOutcome: string;
  changed: string;
  followUp: string;
  updatedAt: string;
};

export type DemoCommitmentUpdate = {
  status: "oppet" | "pagar" | "genomfort";
  clientNote?: string;
  updatedAt: string;
};

export type DemoState = {
  v: number;
  /** Reflektioner som klienten själv har skrivit i portalen. */
  reflections: DemoReflection[];
  /** Förberedelse inför nästa session, per klient. */
  prep: Record<string, DemoSessionPrep>;
  /** Statusändringar på åtaganden, per åtagande-id. */
  commitments: Record<string, DemoCommitmentUpdate>;
};

export const EMPTY_DEMO_STATE: DemoState = {
  v: DEMO_STATE_VERSION,
  reflections: [],
  prep: {},
  commitments: {},
};

export function isEmptyDemoState(state: DemoState): boolean {
  return (
    state.reflections.length === 0 &&
    Object.keys(state.prep).length === 0 &&
    Object.keys(state.commitments).length === 0
  );
}

/** Sanerar okänt inkommande tillstånd till en giltig struktur. */
export function normaliseDemoState(input: unknown): DemoState {
  if (!input || typeof input !== "object") return EMPTY_DEMO_STATE;
  const raw = input as Partial<DemoState>;

  const reflections = Array.isArray(raw.reflections)
    ? raw.reflections
        .filter(
          (item): item is DemoReflection =>
            Boolean(item) &&
            typeof item.id === "string" &&
            typeof item.clientId === "string" &&
            typeof item.date === "string" &&
            typeof item.text === "string",
        )
        .map((item) => ({
          id: item.id,
          clientId: item.clientId,
          date: item.date,
          prompt: typeof item.prompt === "string" ? item.prompt : "Egen reflektion",
          text: item.text,
        }))
    : [];

  const prep: Record<string, DemoSessionPrep> = {};
  if (raw.prep && typeof raw.prep === "object") {
    for (const [clientId, value] of Object.entries(raw.prep)) {
      if (!value || typeof value !== "object") continue;
      const entry = value as Partial<DemoSessionPrep>;
      prep[clientId] = {
        clientId,
        focus: typeof entry.focus === "string" ? entry.focus : "",
        desiredOutcome: typeof entry.desiredOutcome === "string" ? entry.desiredOutcome : "",
        changed: typeof entry.changed === "string" ? entry.changed : "",
        followUp: typeof entry.followUp === "string" ? entry.followUp : "",
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
      };
    }
  }

  const commitments: Record<string, DemoCommitmentUpdate> = {};
  if (raw.commitments && typeof raw.commitments === "object") {
    for (const [id, value] of Object.entries(raw.commitments)) {
      if (!value || typeof value !== "object") continue;
      const entry = value as Partial<DemoCommitmentUpdate>;
      if (entry.status !== "oppet" && entry.status !== "pagar" && entry.status !== "genomfort") {
        continue;
      }
      commitments[id] = {
        status: entry.status,
        clientNote: typeof entry.clientNote === "string" ? entry.clientNote : undefined,
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
      };
    }
  }

  return { v: DEMO_STATE_VERSION, reflections, prep, commitments };
}

/**
 * Krymper tillståndet tills det får plats i en cookie. Äldsta reflektionen
 * släpps först — demoläget ska aldrig gå sönder för att någon skrivit mycket.
 */
export function fitWithinCookie(state: DemoState): DemoState {
  let candidate = state;
  while (
    Buffer.byteLength(JSON.stringify(candidate), "utf8") > MAX_STATE_BYTES &&
    candidate.reflections.length > 1
  ) {
    candidate = { ...candidate, reflections: candidate.reflections.slice(1) };
  }
  return candidate;
}
