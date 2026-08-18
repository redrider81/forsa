import "server-only";

import { getClientDossier, getEngagementOverview } from "@/lib/portal/repository";
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

export function buildClientContext(coachId: string, clientId: string): BuiltContext | null {
  const dossier = getClientDossier(coachId, clientId);
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
    block("SEKRETESS", [
      "Coachens privata anteckningar ingår inte i detta underlag och får inte antas existera i sammanställningen.",
      "Underlaget rör endast denna klient. Ingen annan klient, organisation eller uppdrag finns tillgängligt.",
    ]),
  );

  const text = `UNDERLAG\n\n${sections.filter(Boolean).join("\n")}`;

  const sources = [
    `${dossier.completedSessions.length} genomförda sessioner`,
    `${dossier.reflections.length} klientreflektioner`,
    `${dossier.insights.length} registrerade insikter`,
    `${dossier.commitments.length} åtaganden (varav ${dossier.openCommitments.length} ej avslutade)`,
    "coachningsöverenskommelse och utvecklingsmål",
  ];

  return { text, sources, subject: client.name };
}

export function buildEngagementContext(coachId: string, engagementId: string): BuiltContext | null {
  const overview = getEngagementOverview(coachId, engagementId);
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
    `${participants.length} deltagare`,
    `${overview.totalCompletedSessions} genomförda sessioner totalt`,
    `${overview.totalUpcomingSessions} bokade kommande sessioner`,
    `${engagement.milestones.length} milstolpar`,
    `${overview.documents.length} dokument på uppdragsnivå`,
  ];

  return {
    text,
    sources,
    subject: organisation.name,
    secondarySubject: engagement.title,
  };
}
