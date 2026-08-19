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
import {
  EMPTY_DEMO_STATE,
  type DemoSessionPrep,
  type DemoState,
} from "@/lib/portal/store/demo-state";
import { readDemoState } from "@/lib/portal/store/demo-store";

/**
 * Accesslager. All läsning av klient- och uppdragsdata går via detta lager och
 * kräver ett coachId. Ingen vy och inget AI-anrop får läsa datafilerna direkt —
 * det är här kontextisoleringen upprätthålls.
 *
 * Lagret slår ihop två källor:
 *   1. deterministisk seed-data (statisk, återställningsbar)
 *   2. demo-state som klienten själv har skapat (se store/demo-state.ts)
 *
 * Funktionerna finns i två former: rena `build*`/`list*` som tar ett DemoState
 * och kan enhetstestas, och tunna `get*`-omslag som läser tillståndet själva.
 * När demolagret byts mot en riktig databas är det bara omslagen som ändras.
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

/* ------------------------------------------------- repositories (seed + demo) */

/** Sessioner. Klientens förberedelse skriver över fokus på kommande session. */
export function listSessions(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
): CoachingSession[] {
  if (!getClient(coachId, clientId)) return [];
  const prep = state.prep[clientId];
  return sortByDate(
    sessions
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
): CoachingSession | null {
  return listSessions(coachId, clientId, state).find((item) => item.id === sessionId) ?? null;
}

/** Reflektioner. Seed + de reflektioner klienten själv har skrivit. */
export function listReflections(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
): Reflection[] {
  if (!getClient(coachId, clientId)) return [];
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
  return sortByDate([...reflections.filter((item) => item.clientId === clientId), ...own], "desc");
}

export function listInsights(coachId: string, clientId: string): Insight[] {
  if (!getClient(coachId, clientId)) return [];
  return sortByDate(insights.filter((item) => item.clientId === clientId), "desc");
}

/** Åtaganden. Klientens statusändringar läggs ovanpå seed-datan. */
export function listCommitments(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
): Commitment[] {
  if (!getClient(coachId, clientId)) return [];
  return sortByDate(
    commitments
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
): DemoSessionPrep | null {
  if (!getClient(coachId, clientId)) return null;
  return state.prep[clientId] ?? null;
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
): ClientDossier | null {
  const client = getClient(coachId, clientId);
  if (!client) return null;

  const engagement = getEngagement(coachId, client.engagementId);
  const organisation = getOrganisation(coachId, client.organisationId);
  if (!engagement || !organisation) return null;

  const clientSessions = listSessions(coachId, clientId, state);
  const completed = clientSessions.filter((item) => item.status === "genomford");
  const upcoming = clientSessions.filter((item) => item.status === "kommande");
  const clientCommitments = listCommitments(coachId, clientId, state);

  return {
    client,
    engagement,
    organisation,
    sessions: clientSessions,
    completedSessions: completed,
    upcomingSession: upcoming[0] ?? null,
    lastSession: completed[completed.length - 1] ?? null,
    reflections: listReflections(coachId, clientId, state),
    insights: listInsights(coachId, clientId),
    commitments: clientCommitments,
    openCommitments: clientCommitments.filter((item) => item.status !== "genomfort"),
    documents: listClientDocuments(coachId, clientId),
    prep: getSessionPrep(coachId, clientId, state),
    clientWrittenReflectionIds: state.reflections
      .filter((item) => item.clientId === clientId)
      .map((item) => item.id),
  };
}

export async function getClientDossier(
  coachId: string,
  clientId: string,
): Promise<ClientDossier | null> {
  return buildClientDossier(coachId, clientId, await readDemoState());
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
): EngagementOverview | null {
  const engagement = getEngagement(coachId, engagementId);
  if (!engagement) return null;
  const organisation = getOrganisation(coachId, engagement.organisationId);
  if (!organisation) return null;

  const participants = listClientsForEngagement(coachId, engagementId).map((client) => {
    const clientSessions = listSessions(coachId, client.id, state);
    return {
      client,
      completedSessions: clientSessions.filter((item) => item.status === "genomford").length,
      upcomingSession: clientSessions.find((item) => item.status === "kommande") ?? null,
      openCommitments: listCommitments(coachId, client.id, state).filter(
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

export async function getEngagementOverview(
  coachId: string,
  engagementId: string,
): Promise<EngagementOverview | null> {
  return buildEngagementOverview(coachId, engagementId, await readDemoState());
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
  prep: DemoSessionPrep | null;
};

export function buildClientPerspective(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
): ClientPerspective | null {
  const client = getClient(coachId, clientId);
  if (!client) return null;
  const engagement = getEngagement(coachId, client.engagementId);
  const organisation = getOrganisation(coachId, client.organisationId);
  if (!engagement || !organisation) return null;

  const stripped = listSessions(coachId, clientId, state).map((session) => {
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

  const clientCommitments = listCommitments(coachId, clientId, state);

  return {
    client,
    engagement,
    organisation,
    goal: client.goal,
    sessions: stripped,
    completedSessions: stripped.filter((item) => item.status === "genomford"),
    upcomingSession: stripped.find((item) => item.status === "kommande") ?? null,
    reflections: listReflections(coachId, clientId, state),
    commitments: clientCommitments,
    openCommitments: clientCommitments.filter((item) => item.status !== "genomfort"),
    documents: listClientDocuments(coachId, clientId, "klient"),
    prep: getSessionPrep(coachId, clientId, state),
  };
}

export async function getClientPerspective(
  coachId: string,
  clientId: string,
): Promise<ClientPerspective | null> {
  return buildClientPerspective(coachId, clientId, await readDemoState());
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
export function buildClientActivity(coachId: string, state: DemoState): ClientActivity[] {
  const byId = new Map(listClients(coachId).map((item) => [item.id, item]));
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
    const seed = commitments.find((item) => item.id === commitmentId);
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
): DashboardData {
  if (!coachHasAccess(coachId)) {
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

  const allClients = listClients(coachId);
  const clientById = new Map(allClients.map((item) => [item.id, item]));
  const engagementById = new Map(listEngagements(coachId).map((item) => [item.id, item]));

  const upcoming = allClients
    .flatMap((client) =>
      listSessions(coachId, client.id, state).filter((session) => session.status === "kommande"),
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
      listReflections(coachId, client.id, state).map((reflection) => ({ reflection, client })),
    )
    .sort((a, b) => b.reflection.date.localeCompare(a.reflection.date))
    .slice(0, 4);

  const openCommitments = allClients
    .flatMap((client) =>
      listCommitments(coachId, client.id, state)
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
    engagements: listEngagements(coachId),
    clientCount: allClients.length,
    clientActivity: buildClientActivity(coachId, state),
  };
}

export async function getDashboardData(
  coachId: string,
  todayIso: string,
): Promise<DashboardData> {
  return buildDashboardData(coachId, todayIso, await readDemoState());
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
  if (!coachHasAccess(coachId)) return empty;

  const allClients = listClients(coachId);
  const allEngagements = listEngagements(coachId);
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
    const organisation = getOrganisation(coachId, client.organisationId);

    const clientSessions = listSessions(coachId, client.id, state);
    completed += clientSessions.filter((item) => item.status === "genomford").length;

    const prep = state.prep[client.id];
    if (prep) preparationsReceived += 1;

    for (const session of clientSessions) {
      if (session.status !== "kommande") continue;
      const item: OperationsItem = {
        id: `op-${session.id}`,
        date: session.date,
        time: session.time,
        subject: client.name,
        subjectHref: `/portal/klienter/${client.id}`,
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

    const openCommitments = listCommitments(coachId, client.id, state).filter(
      (commitment) => commitment.status === "oppet",
    );
    followUpsRequired += openCommitments.length;
    for (const commitment of openCommitments) {
      actionItems.push({
        id: `op-${commitment.id}`,
        date: commitment.date,
        time: "",
        subject: client.name,
        subjectHref: `/portal/klienter/${client.id}`,
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
        subjectHref: `/portal/uppdrag/${engagement.id}`,
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
      activeClients: allClients.length,
    },
  };
}

export async function getOperationsOverview(
  coachId: string,
  todayIso: string,
  horizonDays = 21,
): Promise<OperationsOverview> {
  return buildOperationsOverview(coachId, todayIso, await readDemoState(), horizonDays);
}
