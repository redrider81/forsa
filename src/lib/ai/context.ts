import "server-only";

import {
  buildClientDossier,
  buildEngagementOverview,
  SEED_REPOSITORY_DATA,
  type PortalRepositoryData,
} from "@/lib/portal/repository";
import { EMPTY_DEMO_STATE, type DemoState } from "@/lib/portal/store/demo-state";
import { commitmentStatusLabel, formatDate, milestoneStatusLabel } from "@/lib/portal/format";

/**
 * Deterministisk kontextkonstruktion.
 *
 * Servern — inte modellen och inte frontend — avgör vilken data som ingår.
 * Frontend skickar endast ett context-ID, en context-typ och coachens fråga.
 * Coachens privata anteckningar ingår aldrig i AI-underlaget.
 */

export type BuiltContext = {
  /** Text som skickas till modellen. */
  text: string;
  /** Vad underlaget bygger på — visas för coachen i gränssnittet. */
  sources: string[];
  /** Namn som används i systeminstruktionen. */
  subject: string;
  secondarySubject?: string;
};

function block(title: string, lines: Array<string | null | undefined>): string {
  const content = lines.filter((line): line is string => Boolean(line && line.trim()));
  if (content.length === 0) return "";
  return `${title}\n${content.join("\n")}\n`;
}

/**
 * Coachens privata anteckningar får ingå — men endast här, i coachens arbete
 * med den aktuella klienten. De når aldrig klientvyn, organisationsnivån eller
 * någon annan klients kontext.
 */
export function buildClientContext(
  coachId: string,
  clientId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  options: { includeCoachNotes?: boolean } = {},
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): BuiltContext | null {
  const dossier = buildClientDossier(coachId, clientId, state, undefined, data);
  if (!dossier) return null;

  const { client, engagement, organisation } = dossier;

  const sections: string[] = [];

  sections.push(
    block("KLIENT", [
      `Namn: ${client.name}`,
      `Roll: ${client.role}`,
      `Organisation: ${organisation.name} (${organisation.sizeLabel}, ${organisation.industry})`,
      `Uppdrag: ${engagement.title} (${engagement.kindLabel}, ${engagement.periodLabel})`,
      `Coachingrelationen inledd: ${formatDate(client.startedAt)}`,
    ]),
  );

  sections.push(
    block("COACHNINGSÖVERENSKOMMELSE", [
      `Ingången: ${formatDate(client.agreement.agreedAt)}`,
      `Syfte: ${client.agreement.purpose}`,
      `Omfattning: ${client.agreement.scope}`,
      `Form: ${client.agreement.cadence}`,
      `Sekretess: ${client.agreement.confidentiality}`,
      `Delning med uppdragsgivare: ${client.agreement.sponsorSharing}`,
      `Etisk ram: ${client.agreement.ethics}`,
      `Klientens ansvar: ${client.agreement.clientResponsibility}`,
    ]),
  );

  sections.push(
    block("UTVECKLINGSMÅL", [
      `Mål: ${client.goal.headline}`,
      `Klientens egna ord: "${client.goal.clientWording}"`,
      `Utgångsläge: ${client.goal.baseline}`,
      `Framgångskriterier: ${client.goal.successCriteria.join("; ")}`,
      `Tidshorisont: ${client.goal.horizon}`,
    ]),
  );

  if (client.recurringThemes.length > 0) {
    sections.push(
      block(
        "ÅTERKOMMANDE TEMAN I KLIENTENS EGNA FORMULERINGAR",
        client.recurringThemes.map((theme) => `- ${theme}`),
      ),
    );
  }

  const sessionLines: string[] = [];
  for (const session of dossier.completedSessions) {
    sessionLines.push(
      `Session ${session.number} — ${formatDate(session.date)} (${session.location})`,
      `  Klientens fokus: ${session.clientFocus}`,
      `  Klientens önskade resultat: ${session.desiredOutcome}`,
    );
    if (session.summary) {
      const s = session.summary;
      sessionLines.push(`  Fokus enligt godkänd sammanfattning: ${s.focus}`);
      if (s.insights.length) sessionLines.push(`  Klientens insikter: ${s.insights.join(" | ")}`);
      if (s.awareness) sessionLines.push(`  Ökad medvetenhet: ${s.awareness}`);
      if (s.newPerspectives.length)
        sessionLines.push(`  Nya perspektiv: ${s.newPerspectives.join(" | ")}`);
      if (s.commitments.length)
        sessionLines.push(`  Åtaganden från sessionen: ${s.commitments.join(" | ")}`);
      if (s.followUp.length) sessionLines.push(`  Att följa upp: ${s.followUp.join(" | ")}`);
      if (s.possibleNextFocus)
        sessionLines.push(`  Möjligt nästa fokus: ${s.possibleNextFocus}`);
    } else {
      sessionLines.push("  Ingen godkänd sammanfattning finns för denna session.");
    }
    if (options.includeCoachNotes && session.coachNotes) {
      sessionLines.push(`  COACH PRIVAT — coachens egna arbetsanteckningar: ${session.coachNotes}`);
    }
    sessionLines.push("");
  }
  sections.push(block("GENOMFÖRDA SESSIONER", sessionLines));

  if (dossier.upcomingSession) {
    const next = dossier.upcomingSession;
    sections.push(
      block("NÄSTA SESSION", [
        `Session ${next.number} — ${formatDate(next.date)} kl. ${next.time} (${next.location})`,
        `Klientens fokus: ${next.clientFocus}`,
        `Klientens önskade resultat: ${next.desiredOutcome}`,
      ]),
    );
  }

  if (dossier.prep) {
    // Det klienten själv har lämnat inför nästa samtal. Väger tyngst eftersom
    // det är hennes senaste egna formuleringar.
    sections.push(
      block("KLIENTENS EGEN FÖRBEREDELSE INFÖR NÄSTA SAMTAL", [
        `Lämnad ${formatDate(dossier.prep.updatedAt.slice(0, 10))}`,
        dossier.prep.focus ? `Vad hon vill fokusera på: "${dossier.prep.focus}"` : null,
        dossier.prep.desiredOutcome
          ? `Vad som skulle göra samtalet värdefullt: "${dossier.prep.desiredOutcome}"`
          : null,
        dossier.prep.changed ? `Vad som förändrats sedan sist: "${dossier.prep.changed}"` : null,
        dossier.prep.followUp ? `Vad hon vill att coachen följer upp: "${dossier.prep.followUp}"` : null,
        "Detta är klientens senaste egna ord och ska väga tungt i sammanställningen.",
      ]),
    );
  }

  sections.push(
    block(
      "KLIENTENS EGNA REFLEKTIONER",
      dossier.reflections.map(
        (item) => `${formatDate(item.date)} — ${item.prompt}\n  "${item.text}"`,
      ),
    ),
  );

  sections.push(
    block(
      "INSIKTER (KLIENTENS EGNA FORMULERINGAR)",
      dossier.insights.map((item) => `${formatDate(item.date)}: "${item.text}"`),
    ),
  );

  sections.push(
    block(
      "KLIENTENS ÅTAGANDEN",
      dossier.commitments.map(
        (item) =>
          `${formatDate(item.date)} — ${item.text} [${commitmentStatusLabel[item.status]}${
            item.dueLabel ? `, ${item.dueLabel}` : ""
          }]${item.clientNote ? `\n  Klientens notering: "${item.clientNote}"` : ""}`,
      ),
    ),
  );

  sections.push(
    block(
      "DOKUMENT",
      dossier.documents
        .filter((item) => item.visibility !== "coach")
        .map((item) => `${item.title} (${item.kind}, ${formatDate(item.date)})`),
    ),
  );

  sections.push(
    block(
      "SEKRETESS",
      options.includeCoachNotes
        ? [
            "Detta underlag är coachens eget arbetsmaterial och innehåller rader märkta COACH PRIVAT.",
            "Sådant material får användas för att hjälpa coachen tänka, men får aldrig formuleras som något som kan delas med klienten eller uppdragsgivaren. Citera det aldrig ordagrant tillbaka som om klienten hade sagt det.",
            "Skilj tydligt på vad klienten själv har sagt och vad coachen har noterat.",
            "Underlaget rör endast denna klient. Ingen annan klient, organisation eller uppdrag finns tillgängligt.",
          ]
        : [
            "Coachens privata anteckningar ingår inte i detta underlag och får inte antas existera i sammanställningen.",
            "Underlaget rör endast denna klient. Ingen annan klient, organisation eller uppdrag finns tillgängligt.",
          ],
    ),
  );

  const text = `UNDERLAG\n\n${sections.filter(Boolean).join("\n")}`;

  const sources: string[] = [];
  for (const session of dossier.completedSessions.slice(-3)) {
    sources.push(`Session ${session.number}`);
  }
  for (const reflection of dossier.reflections.slice(0, 2)) {
    sources.push(`Reflektion ${formatDate(reflection.date, false)}`);
  }
  if (dossier.openCommitments[0]) {
    sources.push(`Åtagande från ${formatDate(dossier.openCommitments[0].date, false)}`);
  }
  if (dossier.prep) {
    sources.push("Förberedelse inför nästa session");
  }
  sources.push("Utvecklingsmål och coachningsöverenskommelse");
  if (options.includeCoachNotes) {
    const noteCount = dossier.completedSessions.filter((item) => item.coachNotes).length;
    if (noteCount > 0) {
      sources.push(`Egna arbetsanteckningar (${noteCount} sessioner)`);
    }
  }

  return { text, sources, subject: client.name };
}

export function buildEngagementContext(
  coachId: string,
  engagementId: string,
  state: DemoState = EMPTY_DEMO_STATE,
  data: PortalRepositoryData = SEED_REPOSITORY_DATA,
): BuiltContext | null {
  const overview = buildEngagementOverview(coachId, engagementId, state, data);
  if (!overview) return null;

  const { engagement, organisation, participants } = overview;
  const sections: string[] = [];

  sections.push(
    block("UPPDRAG", [
      `Organisation: ${organisation.name} (${organisation.sizeLabel}, ${organisation.industry}, ${organisation.location})`,
      organisation.sponsor
        ? `Uppdragsgivarens kontaktperson: ${organisation.sponsor.name}, ${organisation.sponsor.role}`
        : "Uppdraget saknar sponsor på organisationsnivå.",
      `Uppdrag: ${engagement.title}`,
      `Typ: ${engagement.kindLabel}`,
      `Syfte: ${engagement.purpose}`,
      `Omfattning: ${engagement.scopeNote}`,
      `Period: ${engagement.periodLabel}`,
      `Antal deltagare: ${participants.length}`,
      engagement.nextReview
        ? `Nästa programgenomgång: ${engagement.nextReview.label} (${formatDate(engagement.nextReview.date)})`
        : null,
    ]),
  );

  sections.push(
    block(
      "DELTAGARE OCH STATUS",
      participants.map(
        (item) =>
          `${item.client.name} — ${item.client.role}. Genomförda sessioner: ${item.completedSessions}. ` +
          (item.upcomingSession
            ? `Nästa session: ${formatDate(item.upcomingSession.date)} kl. ${item.upcomingSession.time}. `
            : "Ingen kommande session bokad. ") +
          `Öppna uppföljningar: ${item.openCommitments}.`,
      ),
    ),
  );

  sections.push(
    block(
      "MILSTOLPAR",
      engagement.milestones.map(
        (item) => `${formatDate(item.date)} — ${item.label} [${milestoneStatusLabel[item.status]}]`,
      ),
    ),
  );

  sections.push(
    block(
      "DOKUMENT PÅ UPPDRAGSNIVÅ",
      overview.documents.map((item) => `${item.title} (${item.kind}, ${formatDate(item.date)}) — ${item.description}`),
    ),
  );

  sections.push(
    block("SEKRETESS OCH RAPPORTERING", [
      engagement.sponsorReporting,
      "Detta underlag innehåller ingen individuell samtalsdata: inga reflektioner, inga insikter, inga sessionssammanfattningar och inga coachanteckningar.",
      "Underlaget rör endast detta uppdrag. Inga andra organisationer eller uppdrag finns tillgängliga.",
    ]),
  );

  const text = `UNDERLAG\n\n${sections.filter(Boolean).join("\n")}`;

  const sources = [
    `Deltagarförteckning (${participants.length})`,
    `Genomförda sessioner (${overview.totalCompletedSessions})`,
    `Bokade sessioner (${overview.totalUpcomingSessions})`,
    `Milstolpar (${engagement.milestones.length})`,
    `Dokument på uppdragsnivå (${overview.documents.length})`,
  ];

  return {
    text,
    sources,
    subject: organisation.name,
    secondarySubject: engagement.title,
  };
}
