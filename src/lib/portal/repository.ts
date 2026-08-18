import "server-only";

import {
  clients,
  coach,
  commitments,
  documents,
  engagements,
  insights,
  organisations,
  reflections,
  sessions,
} from "@/lib/portal/data";
import type {
  Client,
  CoachingSession,
  Commitment,
  Engagement,
  Insight,
  Organisation,
  PortalDocument,
  Reflection,
} from "@/lib/portal/types";

/**
 * Accesslager. All läsning av klient- och uppdragsdata går via detta lager och
 * kräver ett coachId. Ingen vy och inget AI-anrop får läsa datafilerna direkt —
 * det är här kontextisoleringen upprätthålls.
 */

export function getCoach() {
  return coach;
}

function coachHasAccess(coachId: string): boolean {
  // Demon har en coach. Strukturen är förberedd för fler coacher och fler
  // organisationer utan att anropsställena behöver ändras.
  return coachId === coach.id;
}

export function listEngagements(coachId: string): Engagement[] {
  if (!coachHasAccess(coachId)) return [];
  return [...engagements];
}

export function getEngagement(coachId: string, engagementId: string): Engagement | null {
  if (!coachHasAccess(coachId)) return null;
  return engagements.find((item) => item.id === engagementId) ?? null;
}

export function getOrganisation(coachId: string, organisationId: string): Organisation | null {
  if (!coachHasAccess(coachId)) return null;
  return organisations.find((item) => item.id === organisationId) ?? null;
}

export function listClients(coachId: string): Client[] {
  if (!coachHasAccess(coachId)) return [];
  return [...clients];
}

export function getClient(coachId: string, clientId: string): Client | null {
  if (!coachHasAccess(coachId)) return null;
  return clients.find((item) => item.id === clientId) ?? null;
}

export function listClientsForEngagement(coachId: string, engagementId: string): Client[] {
  if (!getEngagement(coachId, engagementId)) return [];
  return clients.filter((item) => item.engagementId === engagementId);
}

function sortByDate<T extends { date: string }>(items: T[], direction: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) =>
    direction === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
  );
}

export function listSessions(coachId: string, clientId: string): CoachingSession[] {
  if (!getClient(coachId, clientId)) return [];
  return sortByDate(sessions.filter((item) => item.clientId === clientId));
}

export function getSession(
  coachId: string,
  clientId: string,
  sessionId: string,
): CoachingSession | null {
  return listSessions(coachId, clientId).find((item) => item.id === sessionId) ?? null;
}

export function listReflections(coachId: string, clientId: string): Reflection[] {
  if (!getClient(coachId, clientId)) return [];
  return sortByDate(reflections.filter((item) => item.clientId === clientId), "desc");
}

export function listInsights(coachId: string, clientId: string): Insight[] {
  if (!getClient(coachId, clientId)) return [];
  return sortByDate(insights.filter((item) => item.clientId === clientId), "desc");
}

export function listCommitments(coachId: string, clientId: string): Commitment[] {
  if (!getClient(coachId, clientId)) return [];
  return sortByDate(commitments.filter((item) => item.clientId === clientId), "desc");
}

export function listClientDocuments(
  coachId: string,
  clientId: string,
  audience: "coach" | "klient" = "coach",
): PortalDocument[] {
  if (!getClient(coachId, clientId)) return [];
  return documents.filter((item) => {
    if (item.ownerType !== "klient" || item.ownerId !== clientId) return false;
    if (audience === "klient") return item.visibility !== "coach";
    return true;
  });
}

export function listEngagementDocuments(coachId: string, engagementId: string): PortalDocument[] {
  if (!getEngagement(coachId, engagementId)) return [];
  return documents.filter((item) => item.ownerType === "uppdrag" && item.ownerId === engagementId);
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
};

/** Samlad klientvy för coachen. Innehåller privata coachanteckningar. */
export function getClientDossier(coachId: string, clientId: string): ClientDossier | null {
  const client = getClient(coachId, clientId);
  if (!client) return null;

  const engagement = getEngagement(coachId, client.engagementId);
  const organisation = getOrganisation(coachId, client.organisationId);
  if (!engagement || !organisation) return null;

  const clientSessions = listSessions(coachId, clientId);
  const completed = clientSessions.filter((item) => item.status === "genomford");
  const upcoming = clientSessions.filter((item) => item.status === "kommande");
  const clientCommitments = listCommitments(coachId, clientId);

  return {
    client,
    engagement,
    organisation,
    sessions: clientSessions,
    completedSessions: completed,
    upcomingSession: upcoming[0] ?? null,
    lastSession: completed[completed.length - 1] ?? null,
    reflections: listReflections(coachId, clientId),
    insights: listInsights(coachId, clientId),
    commitments: clientCommitments,
    openCommitments: clientCommitments.filter((item) => item.status !== "genomfort"),
    documents: listClientDocuments(coachId, clientId),
  };
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
export function getEngagementOverview(
  coachId: string,
  engagementId: string,
): EngagementOverview | null {
  const engagement = getEngagement(coachId, engagementId);
  if (!engagement) return null;
  const organisation = getOrganisation(coachId, engagement.organisationId);
  if (!organisation) return null;

  const participants = listClientsForEngagement(coachId, engagementId).map((client) => {
    const clientSessions = listSessions(coachId, client.id);
    return {
      client,
      completedSessions: clientSessions.filter((item) => item.status === "genomford").length,
      upcomingSession: clientSessions.find((item) => item.status === "kommande") ?? null,
      openCommitments: listCommitments(coachId, client.id).filter(
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
    documents: listEngagementDocuments(coachId, engagementId),
  };
}

/** Klientens eget perspektiv. Privata coachanteckningar filtreras bort. */
export type ClientPerspective = {
  client: Client;
  goal: Client["goal"];
  sessions: Array<Omit<CoachingSession, "coachNotes">>;
  upcomingSession: Omit<CoachingSession, "coachNotes"> | null;
  reflections: Reflection[];
  commitments: Commitment[];
  documents: PortalDocument[];
};

export function getClientPerspective(coachId: string, clientId: string): ClientPerspective | null {
  const client = getClient(coachId, clientId);
  if (!client) return null;

  const stripped = listSessions(coachId, clientId).map((session) => {
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

  return {
    client,
    goal: client.goal,
    sessions: stripped,
    upcomingSession: stripped.find((item) => item.status === "kommande") ?? null,
    reflections: listReflections(coachId, clientId),
    commitments: listCommitments(coachId, clientId),
    documents: listClientDocuments(coachId, clientId, "klient"),
  };
}

/* -------------------------------------------------------------- översikt */

export type DashboardData = {
  upcomingSessions: Array<{ session: CoachingSession; client: Client; engagement: Engagement }>;
  /** Sessioner inom sju dagar — underlag för "Idag"-raden i översikten. */
  sessionsWithinWeek: number;
  nextSession: { session: CoachingSession; client: Client; engagement: Engagement } | null;
  recentReflections: Array<{ reflection: Reflection; client: Client }>;
  openCommitments: Array<{ commitment: Commitment; client: Client }>;
  engagements: Engagement[];
  clientCount: number;
};

export function getDashboardData(coachId: string, todayIso: string): DashboardData {
  if (!coachHasAccess(coachId)) {
    return {
      upcomingSessions: [],
      sessionsWithinWeek: 0,
      nextSession: null,
      recentReflections: [],
      openCommitments: [],
      engagements: [],
      clientCount: 0,
    };
  }

  const allClients = listClients(coachId);
  const clientById = new Map(allClients.map((item) => [item.id, item]));
  const engagementById = new Map(listEngagements(coachId).map((item) => [item.id, item]));

  const upcoming = sessions
    .filter((session) => session.status === "kommande")
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

  const recentReflections = [...reflections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)
    .map((reflection) => {
      const client = clientById.get(reflection.clientId);
      return client ? { reflection, client } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const openCommitments = commitments
    .filter((item) => item.status === "oppet")
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((commitment) => {
      const client = clientById.get(commitment.clientId);
      return client ? { commitment, client } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

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
    engagements: listEngagements(coachId),
    clientCount: allClients.length,
  };
}
