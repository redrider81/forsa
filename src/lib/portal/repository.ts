import "server-only";

import {
  clients as seedClients,
  coach as seedCoach,
  commitments as seedCommitments,
  documents as seedDocuments,
  engagements as seedEngagements,
  insights as seedInsights,
  organisations as seedOrganisations,
  reflections as seedReflections,
  sessions as seedSessions,
} from "@/lib/portal/data";
import { seedMaterials } from "@/lib/portal/data/materials";
import type {
  Client,
  CoachingAgreement,
  CoachingSession,
  CoachProfile,
  Commitment,
  DevelopmentGoal,
  Engagement,
  Insight,
  Milestone,
  Organisation,
  PortalDocument,
  Reflection,
} from "@/lib/portal/types";
import {
  EMPTY_DEMO_STATE,
  type DemoSessionPrep,
  type DemoState,
} from "@/lib/portal/store/demo-state";
import { EMPTY_DEMO_MATERIALS_STATE, type DemoMaterialsState } from "@/lib/portal/store/demo-materials-state";
import {
  countMaterialsLinkedToNextSession,
  listClientMaterials,
} from "@/lib/portal/materials-repository";
import type { CoachingMaterial } from "@/lib/portal/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Accesslager. All läsning av klient- och uppdragsdata går via detta lager och
 * kräver ett coachId. Ingen vy och inget AI-anrop får läsa datafilerna direkt —
 * det är här kontextisoleringen upprätthålls.
 *
 * Alla rena `build*`/`list*`-funktioner tar emot en enda `PortalRepositoryData`
 * -ögonblicksbild med samtliga entiteter. Samma ögonblicksbild används genom
 * en hel operation — Supabase-data och seed-data kan därför aldrig blandas
 * inom ett och samma anrop. De tunna `get*`-omslagen hämtar ögonblicksbilden
 * från Supabase; testerna och seed-datan använder SEED_REPOSITORY_DATA, exakt
 * samma statiska fixtures appen alltid har haft.
 */

export type PortalRepositoryData = {
  coach: CoachProfile;
  organisations: Organisation[];
  engagements: Engagement[];
  clients: Client[];
  sessions: CoachingSession[];
  reflections: Reflection[];
  insights: Insight[];
  commitments: Commitment[];
  documents: PortalDocument[];
  materials: CoachingMaterial[];
  /** Klientens förberedelse inför nästa session, per klient. Motsvarigheten
   * till DemoState.prep men källad från session_preparations i produktion. */
  sessionPreparations: Record<string, DemoSessionPrep>;
};

export const SEED_REPOSITORY_DATA: PortalRepositoryData = {
  coach: seedCoach,
  organisations: seedOrganisations,
  engagements: seedEngagements,
  clients: seedClients,
  sessions: seedSessions,
  reflections: seedReflections,
  insights: seedInsights,
  commitments: seedCommitments,
  documents: seedDocuments,
  materials: seedMaterials,
  sessionPreparations: {},
};

export function getCoach(data: PortalRepositoryData = SEED_REPOSITORY_DATA): CoachProfile {
  return data.coach;
}

function coachHasAccess(coachId: string, data: PortalRepositoryData): boolean {
  // Demon har en coach. Strukturen är förberedd för fler coacher och fler
  // organisationer utan att anropsställena behöver ändras.
  return coachId === data.coach.id;
}

export function listEngagements(
  coachId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Engagement[] {
  if (!coachHasAccess(coachId, data)) return [];
  return [...data.engagements];
}

export function getEngagement(
  coachId: string,
  engagementId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Engagement | null {
  if (!coachHasAccess(coachId, data)) return null;
  return data.engagements.find((item) => item.id === engagementId) ?? null;
}

export function listOrganisations(
  coachId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Organisation[] {
  if (!coachHasAccess(coachId, data)) return [];
  return [...data.organisations];
}

export function getOrganisation(
  coachId: string,
  organisationId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Organisation | null {
  if (!coachHasAccess(coachId, data)) return null;
  return data.organisations.find((item) => item.id === organisationId) ?? null;
}

export function getClient(
  coachId: string,
  clientId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Client | null {
  if (!coachHasAccess(coachId, data)) return null;
  return data.clients.find((item) => item.id === clientId) ?? null;
}

/** Klientens egna profiluppdateringar läggs ovanpå seed-datan. */
export function deriveClientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export function resolveClient(client: Client, state: DemoState = EMPTY_DEMO_STATE): Client {
  const profile = state.profile[client.id];
  if (!profile) return client;

  const name = profile.name.trim() || client.name;
  const role = profile.role.trim() || client.role;
  const email = profile.email !== undefined ? profile.email.trim() : client.email;
  const phone = profile.phone !== undefined ? profile.phone.trim() : client.phone;

  return {
    ...client,
    name,
    role,
    email,
    phone,
    initials: deriveClientInitials(name),
  };
}

export function listClients(
  coachId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Client[] {
  if (!coachHasAccess(coachId, data)) return [];
  return data.clients.map((client) => resolveClient(client, state));
}

export function listClientsForEngagement(
  coachId: string,
  engagementId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Client[] {
  if (!getEngagement(coachId, engagementId, data)) return [];
  return data.clients
    .filter((item) => item.engagementId === engagementId)
    .map((client) => resolveClient(client, state));
}

function sortByDate<T extends { date: string }>(items: T[], direction: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) =>
    direction === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
  );
}

/* ------------------------------------------------- repositories (seed + demo) */

/** Sessioner. Klientens förberedelse skriver över fokus på kommande session. */
export function listSessions(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): CoachingSession[] {
  if (!getClient(coachId, clientId, data)) return [];
  const prep = state.prep[clientId] ?? data.sessionPreparations[clientId];
  return sortByDate(
    data.sessions
      .filter((item) => item.clientId === clientId)
      .map((session) => {
        if (session.status !== "kommande" || !prep) return session;
        return {
          ...session,
          clientFocus: prep.focus.trim() ? prep.focus : session.clientFocus,
          desiredOutcome: prep.desiredOutcome.trim()
            ? prep.desiredOutcome
            : session.desiredOutcome,
        };
      }),
  );
}

export function getSession(
  coachId: string,
  clientId: string,
  sessionId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): CoachingSession | null {
  return listSessions(coachId, clientId, state, data).find((item) => item.id === sessionId) ?? null;
}

/** Reflektioner. Seed + de reflektioner klienten själv har skrivit. */
export function listReflections(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Reflection[] {
  if (!getClient(coachId, clientId, data)) return [];
  const own = state.reflections
    .filter((item) => item.clientId === clientId)
    .map<Reflection>((item) => ({
      id: item.id,
      clientId: item.clientId,
      date: item.date,
      prompt: item.prompt,
      text: item.text,
      visibility: "coach_klient",
    }));
  return sortByDate(
    [...data.reflections.filter((item) => item.clientId === clientId), ...own],
    "desc",
  );
}

export function listInsights(
  coachId: string,
  clientId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Insight[] {
  if (!getClient(coachId, clientId, data)) return [];
  return sortByDate(data.insights.filter((item) => item.clientId === clientId), "desc");
}

/** Åtaganden. Klientens statusändringar läggs ovanpå seed-datan. */
export function listCommitments(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): Commitment[] {
  if (!getClient(coachId, clientId, data)) return [];
  return sortByDate(
    data.commitments
      .filter((item) => item.clientId === clientId)
      .map((commitment) => {
        const update = state.commitments[commitment.id];
        if (!update) return commitment;
        return {
          ...commitment,
          status: update.status,
          clientNote: update.clientNote ?? commitment.clientNote,
          completedAt:
            update.status === "genomfort"
              ? update.updatedAt.slice(0, 10) || commitment.completedAt
              : undefined,
        };
      }),
    "desc",
  );
}

/** Klientens förberedelse inför nästa session, om hon har lämnat någon. */
export function getSessionPrep(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): DemoSessionPrep | null {
  if (!getClient(coachId, clientId, data)) return null;
  return state.prep[clientId] ?? data.sessionPreparations[clientId] ?? null;
}

export function listClientDocuments(
  coachId: string,
  clientId: string,
  audience: "coach" | "klient" = "coach",
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): PortalDocument[] {
  if (!getClient(coachId, clientId, data)) return [];
  return data.documents.filter((item) => {
    if (item.ownerType !== "klient" || item.ownerId !== clientId) return false;
    if (audience === "klient") return item.visibility !== "coach";
    return true;
  });
}

export function listEngagementDocuments(
  coachId: string,
  engagementId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): PortalDocument[] {
  if (!getEngagement(coachId, engagementId, data)) return [];
  return data.documents.filter((item) => item.ownerType === "uppdrag" && item.ownerId === engagementId);
}

/** Carolinas interna dokumentarkiv — kräver varken klient eller uppdrag. */
export function listInternalDocuments(
  coachId: string,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): PortalDocument[] {
  if (!coachHasAccess(coachId, data)) return [];
  return data.documents.filter((item) => item.ownerType === "coach" && item.ownerId === coachId);
}

/* ------------------------------------------------------------------ vyer */

export type ClientDossier = {
  client: Client;
  engagement: Engagement;
  organisation: Organisation;
  sessions: CoachingSession[];
  completedSessions: CoachingSession[];
  upcomingSession: CoachingSession | null;
  lastSession: CoachingSession | null;
  reflections: Reflection[];
  insights: Insight[];
  commitments: Commitment[];
  openCommitments: Commitment[];
  documents: PortalDocument[];
  /** Coachingmaterial — filer, anteckningar, coach-delat. */
  materials: CoachingMaterial[];
  /** Antal material kopplade till nästa session. */
  nextSessionMaterialCount: number;
  /** Klientens egen förberedelse inför nästa samtal, om den finns. */
  prep: DemoSessionPrep | null;
  /** Reflektioner klienten själv har skrivit i portalen. */
  clientWrittenReflectionIds: string[];
};

/** Samlad klientvy för coachen. Innehåller privata coachanteckningar. */
export function buildClientDossier(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  materialsState: DemoMaterialsState = EMPTY_DEMO_MATERIALS_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): ClientDossier | null {
  const seed = getClient(coachId, clientId, data);
  if (!seed) return null;
  const client = resolveClient(seed, state);

  const engagement = getEngagement(coachId, client.engagementId, data);
  if (!engagement) return null;
  const organisation = client.organisationId
    ? getOrganisation(coachId, client.organisationId, data)
    : null;

  const clientSessions = listSessions(coachId, clientId, state, data);
  const completed = clientSessions.filter((item) => item.status === "genomford");
  const upcoming = clientSessions.filter((item) => item.status === "kommande");
  const clientCommitments = listCommitments(coachId, clientId, state, data);

  return {
    client,
    engagement,
    organisation: organisation ?? EMPTY_ORGANISATION,
    sessions: clientSessions,
    completedSessions: completed,
    upcomingSession: upcoming[0] ?? null,
    lastSession: completed[completed.length - 1] ?? null,
    reflections: listReflections(coachId, clientId, state, data),
    insights: listInsights(coachId, clientId, data),
    commitments: clientCommitments,
    openCommitments: clientCommitments.filter((item) => item.status !== "genomfort"),
    documents: listClientDocuments(coachId, clientId, "coach", data),
    materials: listClientMaterials(clientId, "coach", materialsState, data.materials),
    nextSessionMaterialCount: countMaterialsLinkedToNextSession(clientId, materialsState, data.materials),
    prep: getSessionPrep(coachId, clientId, state, data),
    clientWrittenReflectionIds: state.reflections
      .filter((item) => item.clientId === clientId)
      .map((item) => item.id),
  };
}

export async function getClientDossier(
  coachId: string,
  clientId: string,
): Promise<ClientDossier | null> {
  return buildClientDossier(
    coachId,
    clientId,
    EMPTY_DEMO_STATE,
    EMPTY_DEMO_MATERIALS_STATE,
    await fetchPortalRepositoryData(),
  );
}

export type EngagementOverview = {
  engagement: Engagement;
  organisation: Organisation;
  participants: Array<{
    client: Client;
    completedSessions: number;
    upcomingSession: CoachingSession | null;
    openCommitments: number;
  }>;
  totalCompletedSessions: number;
  totalUpcomingSessions: number;
  documents: PortalDocument[];
};

/**
 * Uppdragsvy på organisationsnivå. Innehåller aldrig privata coachanteckningar,
 * reflektioner, insikter eller sessionsinnehåll — endast tillåten aggregerad data.
 */
export function buildEngagementOverview(
  coachId: string,
  engagementId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): EngagementOverview | null {
  const engagement = getEngagement(coachId, engagementId, data);
  if (!engagement) return null;
  const organisation = engagement.organisationId
    ? getOrganisation(coachId, engagement.organisationId, data)
    : null;
  if (!organisation) return null;

  const participants = listClientsForEngagement(coachId, engagementId, state, data).map((client) => {
    const clientSessions = listSessions(coachId, client.id, state, data);
    return {
      client,
      completedSessions: clientSessions.filter((item) => item.status === "genomford").length,
      upcomingSession: clientSessions.find((item) => item.status === "kommande") ?? null,
      openCommitments: listCommitments(coachId, client.id, state, data).filter(
        (item) => item.status !== "genomfort",
      ).length,
    };
  });

  return {
    engagement,
    organisation,
    participants,
    totalCompletedSessions: participants.reduce((sum, p) => sum + p.completedSessions, 0),
    totalUpcomingSessions: participants.filter((p) => p.upcomingSession).length,
    documents: listEngagementDocuments(coachId, engagementId, data),
  };
}

export async function getEngagementOverview(
  coachId: string,
  engagementId: string,
): Promise<EngagementOverview | null> {
  return buildEngagementOverview(coachId, engagementId, EMPTY_DEMO_STATE, await fetchPortalRepositoryData());
}

/** Klientens eget perspektiv. Privata coachanteckningar filtreras bort. */
export type ClientPerspective = {
  client: Client;
  engagement: Engagement;
  organisation: Organisation;
  goal: Client["goal"];
  sessions: Array<Omit<CoachingSession, "coachNotes">>;
  completedSessions: Array<Omit<CoachingSession, "coachNotes">>;
  upcomingSession: Omit<CoachingSession, "coachNotes"> | null;
  reflections: Reflection[];
  commitments: Commitment[];
  openCommitments: Commitment[];
  documents: PortalDocument[];
  materials: CoachingMaterial[];
  nextSessionMaterialCount: number;
  prep: DemoSessionPrep | null;
};

export function buildClientPerspective(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  materialsState: DemoMaterialsState = EMPTY_DEMO_MATERIALS_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): ClientPerspective | null {
  const seed = getClient(coachId, clientId, data);
  if (!seed) return null;
  const client = resolveClient(seed, state);
  const engagement = getEngagement(coachId, client.engagementId, data);
  const organisation = client.organisationId
    ? getOrganisation(coachId, client.organisationId, data)
    : null;
  if (!engagement || !organisation) return null;

  const stripped = listSessions(coachId, clientId, state, data).map((session) => {
    const shared: Omit<CoachingSession, "coachNotes"> = {
      id: session.id,
      clientId: session.clientId,
      number: session.number,
      date: session.date,
      time: session.time,
      durationMinutes: session.durationMinutes,
      status: session.status,
      clientFocus: session.clientFocus,
      desiredOutcome: session.desiredOutcome,
      location: session.location,
      // Endast godkända sammanfattningar delas med klienten.
      summary: session.summary?.approved ? session.summary : undefined,
    };
    return shared;
  });

  const clientCommitments = listCommitments(coachId, clientId, state, data);

  return {
    client,
    engagement,
    organisation,
    goal: client.goal,
    sessions: stripped,
    completedSessions: stripped.filter((item) => item.status === "genomford"),
    upcomingSession: stripped.find((item) => item.status === "kommande") ?? null,
    reflections: listReflections(coachId, clientId, state, data),
    commitments: clientCommitments,
    openCommitments: clientCommitments.filter((item) => item.status !== "genomfort"),
    documents: listClientDocuments(coachId, clientId, "klient", data),
    materials: listClientMaterials(clientId, "klient", materialsState, data.materials),
    nextSessionMaterialCount: countMaterialsLinkedToNextSession(clientId, materialsState, data.materials),
    prep: getSessionPrep(coachId, clientId, state, data),
  };
}

export async function getClientPerspective(
  coachId: string,
  clientId: string,
): Promise<ClientPerspective | null> {
  return buildClientPerspective(
    coachId,
    clientId,
    EMPTY_DEMO_STATE,
    EMPTY_DEMO_MATERIALS_STATE,
    await fetchPortalRepositoryData(),
  );
}

/* ---------------------------------------------------------------- översikt */

export type ClientActivity = {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  type: "reflektion" | "forberedelse" | "atagande";
  label: string;
  detail: string;
  at: string;
};

/** Vad klienten har lämnat sedan seed-läget. Driver coachens aviseringar. */
export function buildClientActivity(
  coachId: string,
  state: DemoState,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): ClientActivity[] {
  const byId = new Map(listClients(coachId, state, data).map((item) => [item.id, item]));
  const items: ClientActivity[] = [];

  for (const reflection of state.reflections) {
    const client = byId.get(reflection.clientId);
    if (!client) continue;
    items.push({
      id: `akt-${reflection.id}`,
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      type: "reflektion",
      label: `${client.name} — ny reflektion`,
      detail: reflection.text,
      at: reflection.date,
    });
  }

  for (const [clientId, prep] of Object.entries(state.prep)) {
    const client = byId.get(clientId);
    if (!client) continue;
    items.push({
      id: `akt-prep-${clientId}`,
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      type: "forberedelse",
      label: `${client.name} — förberedelse mottagen`,
      detail: prep.focus,
      at: prep.updatedAt.slice(0, 10),
    });
  }

  for (const [commitmentId, update] of Object.entries(state.commitments)) {
    const seed = data.commitments.find((item) => item.id === commitmentId);
    const client = seed ? byId.get(seed.clientId) : undefined;
    if (!seed || !client) continue;
    items.push({
      id: `akt-${commitmentId}`,
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      type: "atagande",
      label: `${client.name} — åtagande uppdaterat`,
      detail: seed.text,
      at: update.updatedAt.slice(0, 10),
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at));
}

export type DashboardData = {
  upcomingSessions: Array<{ session: CoachingSession; client: Client; engagement: Engagement }>;
  sessionsWithinWeek: number;
  nextSession: { session: CoachingSession; client: Client; engagement: Engagement } | null;
  recentReflections: Array<{ reflection: Reflection; client: Client }>;
  openCommitments: Array<{ commitment: Commitment; client: Client }>;
  engagements: Engagement[];
  clientCount: number;
  clientActivity: ClientActivity[];
};

export function buildDashboardData(
  coachId: string,
  todayIso: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): DashboardData {
  if (!coachHasAccess(coachId, data)) {
    return {
      upcomingSessions: [],
      sessionsWithinWeek: 0,
      nextSession: null,
      recentReflections: [],
      openCommitments: [],
      engagements: [],
      clientCount: 0,
      clientActivity: [],
    };
  }

  const allClients = listClients(coachId, state, data);
  const clientById = new Map(allClients.map((item) => [item.id, item]));
  const engagementById = new Map(listEngagements(coachId, data).map((item) => [item.id, item]));

  const upcoming = allClients
    .flatMap((client) =>
      listSessions(coachId, client.id, state, data).filter((session) => session.status === "kommande"),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .map((session) => {
      const client = clientById.get(session.clientId);
      const engagement = client ? engagementById.get(client.engagementId) : undefined;
      return client && engagement ? { session, client, engagement } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Kommande sessioner räknat från dagens datum; faller tillbaka på hela listan
  // så att demon aldrig står tom om datumen har passerats.
  const fromToday = upcoming.filter((item) => item.session.date >= todayIso);
  const relevant = fromToday.length > 0 ? fromToday : upcoming;

  const recentReflections = allClients
    .flatMap((client) =>
      listReflections(coachId, client.id, state, data).map((reflection) => ({ reflection, client })),
    )
    .sort((a, b) => b.reflection.date.localeCompare(a.reflection.date))
    .slice(0, 4);

  const openCommitments = allClients
    .flatMap((client) =>
      listCommitments(coachId, client.id, state, data)
        .filter((item) => item.status === "oppet")
        .map((commitment) => ({ commitment, client })),
    )
    .sort((a, b) => a.commitment.date.localeCompare(b.commitment.date));

  const weekAhead = new Date(`${todayIso}T00:00:00Z`);
  weekAhead.setUTCDate(weekAhead.getUTCDate() + 7);
  const weekLimit = weekAhead.toISOString().slice(0, 10);

  return {
    upcomingSessions: relevant,
    sessionsWithinWeek: relevant.filter(
      (item) => item.session.date >= todayIso && item.session.date <= weekLimit,
    ).length,
    nextSession: relevant[0] ?? null,
    recentReflections,
    openCommitments,
    engagements: listEngagements(coachId, data),
    clientCount: allClients.length,
    clientActivity: buildClientActivity(coachId, state, data),
  };
}

export async function getDashboardData(
  coachId: string,
  todayIso: string,
): Promise<DashboardData> {
  return buildDashboardData(coachId, todayIso, EMPTY_DEMO_STATE, await fetchPortalRepositoryData());
}

/* --------------------------------------------------- operativ översikt */

/** Operativa statusar. Beskriver arbetsflödet, aldrig klientens prestation. */
export type OperationsStatus =
  | "Förberedelse mottagen"
  | "Förberedelse saknas"
  | "Session planerad"
  | "Session idag"
  | "Session genomförd"
  | "Uppföljning krävs"
  | "Underlag mottaget"
  | "Underlag saknas"
  | "Programgenomgång"
  | "Sammanfattning för granskning"
  | "Åtagande uppdaterat"
  | "Ny reflektion";

export type OperationsItem = {
  id: string;
  date: string;
  time: string;
  /** Klient eller uppdrag som insatsen gäller. */
  subject: string;
  subjectHref: string;
  context: string;
  /** Typ av insats. */
  kind: "Coachingsamtal" | "Programgenomgång" | "Uppföljning" | "Sessionsunderlag";
  status: OperationsStatus;
};

export type OperationsOverview = {
  today: OperationsItem[];
  requiresAction: OperationsItem[];
  calendar: OperationsItem[];
  week: {
    sessions: number;
    preparationsReceived: number;
    followUpsRequired: number;
    programmeReviews: number;
    completedThisPeriod: number;
    activeEngagements: number;
    activeClients: number;
  };
};

/**
 * Carolinas operativa lägesbild. Rent härledd från sessioner, milstolpar,
 * åtaganden och klientens inlämnade förberedelser — ingen egen lagring.
 */
export function buildOperationsOverview(
  coachId: string,
  todayIso: string,
  state: DemoState = EMPTY_DEMO_STATE,
  horizonDays = 21,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): OperationsOverview {
  const empty: OperationsOverview = {
    today: [],
    requiresAction: [],
    calendar: [],
    week: {
      sessions: 0,
      preparationsReceived: 0,
      followUpsRequired: 0,
      programmeReviews: 0,
      completedThisPeriod: 0,
      activeEngagements: 0,
      activeClients: 0,
    },
  };
  if (!coachHasAccess(coachId, data)) return empty;

  const allClients = listClients(coachId, state, data);
  const allEngagements = listEngagements(coachId, data);
  const engagementById = new Map(allEngagements.map((item) => [item.id, item]));

  const horizon = new Date(`${todayIso}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + horizonDays);
  const horizonIso = horizon.toISOString().slice(0, 10);

  const weekEnd = new Date(`${todayIso}T00:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const weekEndIso = weekEnd.toISOString().slice(0, 10);

  const sessionItems: OperationsItem[] = [];
  const actionItems: OperationsItem[] = [];
  let preparationsReceived = 0;
  let followUpsRequired = 0;
  let completed = 0;

  for (const client of allClients) {
    const engagement = engagementById.get(client.engagementId);
    if (!engagement) continue;
    const organisation = client.organisationId
      ? getOrganisation(coachId, client.organisationId, data)
      : null;

    const clientSessions = listSessions(coachId, client.id, state, data);
    completed += clientSessions.filter((item) => item.status === "genomford").length;

    const prep = state.prep[client.id] ?? data.sessionPreparations[client.id];
    if (prep) preparationsReceived += 1;

    for (const session of clientSessions) {
      if (session.status !== "kommande") continue;
      const item: OperationsItem = {
        id: `op-${session.id}`,
        date: session.date,
        time: session.time,
        subject: client.name,
        subjectHref: `/cvb-base/klienter/${client.id}`,
        context: `Session ${session.number} · ${organisation?.name ?? engagement.title}`,
        kind: "Coachingsamtal",
        status: prep
          ? "Förberedelse mottagen"
          : session.date === todayIso
            ? "Session idag"
            : "Förberedelse saknas",
      };
      sessionItems.push(item);

      // Kräver åtgärd: samtal inom en vecka utan inlämnad förberedelse.
      if (!prep && session.date >= todayIso && session.date <= weekEndIso) {
        actionItems.push({ ...item, id: `${item.id}-atgard` });
      }
      // Kräver åtgärd: inlämnad förberedelse som ännu inte är genomgången.
      if (prep && session.date >= todayIso) {
        actionItems.push({
          ...item,
          id: `${item.id}-prep`,
          kind: "Sessionsunderlag",
          status: "Underlag mottaget",
        });
      }
    }

    const openCommitments = listCommitments(coachId, client.id, state, data).filter(
      (commitment) => commitment.status === "oppet",
    );
    followUpsRequired += openCommitments.length;
    for (const commitment of openCommitments) {
      actionItems.push({
        id: `op-${commitment.id}`,
        date: commitment.date,
        time: "",
        subject: client.name,
        subjectHref: `/cvb-base/klienter/${client.id}`,
        context: commitment.text,
        kind: "Uppföljning",
        status: "Uppföljning krävs",
      });
    }
  }

  const milestoneItems: OperationsItem[] = [];
  for (const engagement of allEngagements) {
    for (const milestone of engagement.milestones) {
      if (milestone.status === "genomford") continue;
      const item: OperationsItem = {
        id: `op-${milestone.id}`,
        date: milestone.date,
        time: "",
        subject: engagement.title,
        subjectHref: `/cvb-base/uppdrag/${engagement.id}`,
        context: milestone.label,
        kind: "Programgenomgång",
        status: "Programgenomgång",
      };
      milestoneItems.push(item);
      if (milestone.date >= todayIso && milestone.date <= horizonIso) {
        actionItems.push({ ...item, id: `${item.id}-atgard` });
      }
    }
  }

  const byDateTime = (a: OperationsItem, b: OperationsItem) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);

  const scheduled = [...sessionItems, ...milestoneItems].sort(byDateTime);

  const calendar = scheduled.filter(
    (item) => item.date >= todayIso && item.date <= horizonIso,
  );

  return {
    today: scheduled.filter((item) => item.date === todayIso),
    requiresAction: actionItems.sort(byDateTime),
    // Faller tillbaka på hela listan så att demon aldrig står tom.
    calendar: calendar.length > 0 ? calendar : scheduled.slice(0, 8),
    week: {
      sessions: sessionItems.filter(
        (item) => item.date >= todayIso && item.date <= weekEndIso,
      ).length,
      preparationsReceived,
      followUpsRequired,
      programmeReviews: milestoneItems.filter(
        (item) => item.date >= todayIso && item.date <= horizonIso,
      ).length,
      completedThisPeriod: completed,
      activeEngagements: allEngagements.length,
      activeClients: allClients.filter((client) => (client.status ?? "aktiv") === "aktiv").length,
    },
  };
}

export async function getOperationsOverview(
  coachId: string,
  todayIso: string,
  horizonDays = 21,
): Promise<OperationsOverview> {
  return buildOperationsOverview(
    coachId,
    todayIso,
    EMPTY_DEMO_STATE,
    horizonDays,
    await fetchPortalRepositoryData(),
  );
}

/* ------------------------------------------------------- Supabase-hämtning */

/** Fallback för privata klienter/uppdrag utan organisation. */
const EMPTY_ORGANISATION: Organisation = {
  id: "",
  name: "",
  sizeLabel: "",
  industry: "",
  location: "",
};

const EMPTY_AGREEMENT: CoachingAgreement = {
  agreedAt: "",
  purpose: "",
  scope: "",
  cadence: "",
  confidentiality: "",
  sponsorSharing: "",
  ethics: "",
  clientResponsibility: "",
};

const EMPTY_GOAL: DevelopmentGoal = {
  headline: "",
  clientWording: "",
  baseline: "",
  successCriteria: [],
  horizon: "",
};

function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return map;
}

/**
 * Hämtar hela den ögonblicksbild av data som den inloggade sessionen (coach
 * eller klient) har rätt att se, via RLS. Anropas oavsett roll — för en
 * klient returnerar t.ex. session_coach_notes helt enkelt en tom lista, eftersom
 * ingen policy alls finns för klienter på den tabellen. Kontextisoleringen
 * upprätthålls därmed på databasnivå, inte bara i applikationskoden.
 */
async function fetchPortalRepositoryData(): Promise<PortalRepositoryData> {
  const supabase = await createSupabaseServerClient();

  const [
    { data: coachRows },
    { data: organisationRows },
    { data: engagementRows },
    { data: milestoneRows },
    { data: clientRows },
    { data: agreementRows },
    { data: goalRows },
    { data: sessionRows },
    { data: summaryRows },
    { data: coachNoteRows },
    { data: prepRows },
    { data: reflectionRows },
    { data: insightRows },
    { data: commitmentRows },
    { data: documentRows },
    { data: materialRows },
  ] = await Promise.all([
    supabase.from("coaches").select("*"),
    supabase.from("organisations").select("*"),
    supabase.from("engagements").select("*"),
    supabase.from("milestones").select("*"),
    supabase.from("clients").select("*"),
    supabase.from("coaching_agreements").select("*"),
    supabase.from("development_goals").select("*"),
    supabase.from("sessions").select("*"),
    supabase.from("session_summaries").select("*"),
    supabase.from("session_coach_notes").select("*"),
    supabase.from("session_preparations").select("*"),
    supabase.from("reflections").select("*"),
    supabase.from("insights").select("*"),
    supabase.from("commitments").select("*"),
    supabase.from("documents").select("*"),
    supabase.from("materials").select("*"),
  ]);

  const coachRow = coachRows?.[0];
  const coach: CoachProfile = coachRow
    ? {
        id: coachRow.id,
        name: coachRow.name,
        title: coachRow.title,
        initials: coachRow.initials,
        email: coachRow.email,
        credential: coachRow.credential,
        focus: coachRow.focus,
      }
    : { id: "", name: "", title: "", initials: "", email: "", credential: "", focus: "" };

  const milestonesByEngagement = groupBy(milestoneRows ?? [], (row) => row.engagement_id);
  const clientsByEngagement = groupBy(clientRows ?? [], (row) => row.engagement_id);

  const organisations: Organisation[] = (organisationRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sizeLabel: row.size_label,
    industry: row.industry,
    location: row.location,
    sponsor: row.sponsor_name ? { name: row.sponsor_name, role: row.sponsor_role ?? "" } : undefined,
  }));

  const engagements: Engagement[] = (engagementRows ?? []).map((row) => {
    const milestones: Milestone[] = (milestonesByEngagement.get(row.id) ?? []).map((m) => ({
      id: m.id,
      label: m.label,
      date: m.date,
      status: m.status,
    }));
    return {
      id: row.id,
      organisationId: row.organisation_id ?? undefined,
      title: row.title,
      kind: row.kind,
      kindLabel: row.kind_label,
      purpose: row.purpose,
      scopeNote: row.scope_note,
      periodLabel: row.period_label,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      participantIds: (clientsByEngagement.get(row.id) ?? []).map((c) => c.id),
      milestones,
      nextReview:
        row.next_review_label && row.next_review_date
          ? { label: row.next_review_label, date: row.next_review_date }
          : undefined,
      sponsorReporting: row.sponsor_reporting,
    };
  });

  const agreementByClient = new Map((agreementRows ?? []).map((row) => [row.client_id, row]));
  const goalByClient = new Map((goalRows ?? []).map((row) => [row.client_id, row]));

  const clients: Client[] = (clientRows ?? []).map((row) => {
    const agreement = agreementByClient.get(row.id);
    const goal = goalByClient.get(row.id);
    return {
      id: row.id,
      engagementId: row.engagement_id,
      organisationId: row.organisation_id ?? undefined,
      name: row.name,
      initials: row.initials,
      role: row.role,
      email: row.email,
      phone: row.phone,
      headline: row.headline,
      startedAt: row.started_at,
      depth: row.depth,
      agreement: agreement
        ? {
            agreedAt: agreement.agreed_at,
            purpose: agreement.purpose,
            scope: agreement.scope,
            cadence: agreement.cadence,
            confidentiality: agreement.confidentiality,
            sponsorSharing: agreement.sponsor_sharing,
            ethics: agreement.ethics,
            clientResponsibility: agreement.client_responsibility,
          }
        : EMPTY_AGREEMENT,
      goal: goal
        ? {
            headline: goal.headline,
            clientWording: goal.client_wording,
            baseline: goal.baseline,
            successCriteria: goal.success_criteria,
            horizon: goal.horizon,
          }
        : EMPTY_GOAL,
      recurringThemes: row.recurring_themes,
      status: row.status,
      endedAt: row.ended_at ?? null,
      reactivatedAt: row.reactivated_at ?? null,
    };
  });

  const summaryBySession = new Map((summaryRows ?? []).map((row) => [row.session_id, row]));
  const coachNotesBySession = new Map((coachNoteRows ?? []).map((row) => [row.session_id, row]));

  const sessions: CoachingSession[] = (sessionRows ?? []).map((row) => {
    const summary = summaryBySession.get(row.id);
    const coachNote = coachNotesBySession.get(row.id);
    return {
      id: row.id,
      clientId: row.client_id,
      number: row.number,
      date: row.date,
      time: row.time,
      durationMinutes: row.duration_minutes,
      status: row.status,
      clientFocus: row.client_focus,
      desiredOutcome: row.desired_outcome,
      coachNotes: coachNote?.notes,
      summary: summary
        ? {
            focus: summary.focus,
            insights: summary.insights,
            awareness: summary.awareness,
            newPerspectives: summary.new_perspectives,
            commitments: summary.commitments,
            followUp: summary.follow_up,
            possibleNextFocus: summary.possible_next_focus,
            approved: summary.approved,
            approvedAt: summary.approved_at ?? undefined,
          }
        : undefined,
      location: row.location,
    };
  });

  const sessionPreparations: Record<string, DemoSessionPrep> = {};
  for (const row of prepRows ?? []) {
    sessionPreparations[row.client_id] = {
      clientId: row.client_id,
      focus: row.focus,
      desiredOutcome: row.desired_outcome,
      changed: row.changed,
      followUp: row.follow_up,
      updatedAt: row.updated_at,
    };
  }

  const reflections: Reflection[] = (reflectionRows ?? []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    sessionId: row.session_id ?? undefined,
    date: row.date,
    prompt: row.prompt,
    text: row.text,
    visibility: "coach_klient",
  }));

  const insights: Insight[] = (insightRows ?? []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    sessionId: row.session_id,
    date: row.date,
    text: row.text,
    visibility: "coach_klient",
  }));

  const commitments: Commitment[] = (commitmentRows ?? []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    sessionId: row.session_id,
    date: row.date,
    text: row.text,
    dueLabel: row.due_label,
    status: row.status,
    clientNote: row.client_note ?? undefined,
    completedAt: row.completed_at ?? undefined,
    visibility: "coach_klient",
  }));

  const documents: PortalDocument[] = (documentRows ?? []).map((row) => ({
    id: row.id,
    ownerType: row.owner_type,
    ownerId: row.owner_id,
    title: row.title,
    kind: row.kind,
    date: row.date,
    description: row.description,
    visibility: row.visibility,
    storagePath: row.storage_path ?? undefined,
    fileName: row.file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    uploadedByCoachId: row.uploaded_by_coach_id ?? undefined,
    status: row.status,
    signedAt: row.signed_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const materials: CoachingMaterial[] = (materialRows ?? []).map((row) => ({
    id: row.id,
    ownerClientId: row.owner_client_id,
    createdByRole: row.created_by_role,
    createdById: row.created_by_id,
    title: row.title,
    fileName: row.file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    category: row.category,
    noteText: row.note_text ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sharingLevel: row.sharing_level,
    source: row.source,
    linkType: row.link_type,
    linkedSessionId: row.linked_session_id ?? undefined,
    linkedCommitmentId: row.linked_commitment_id ?? undefined,
    comment: row.comment ?? undefined,
    hasFilePayload: Boolean(row.storage_path),
  }));

  return {
    coach,
    organisations,
    engagements,
    clients,
    sessions,
    reflections,
    insights,
    commitments,
    documents,
    materials,
    sessionPreparations,
  };
}

export { fetchPortalRepositoryData };
