/**
 * Domänmodell för CVB Coaching Portal.
 *
 * Informationskedjan följer professionell coachingpraktik:
 * Organisation → Uppdrag → Klient → Coachningsöverenskommelse → Utvecklingsmål →
 * Sessioner → Reflektioner → Insikter → Åtaganden → Uppföljning → Utvecklingsöversikt.
 */

/**
 * Sekretessnivå. Styr både datalogik och UI.
 * - `coach`: endast coachen (privata coachinganteckningar)
 * - `coach_klient`: delas mellan coach och klient
 * - `organisation`: får visas för sponsor/uppdragsgivare
 */
export type ConfidentialityLevel = "coach" | "coach_klient" | "organisation";

export type EngagementKind = "individuell" | "ledarutveckling" | "program";

export type EngagementStatus = "planering" | "pagaende" | "avslutat";

export type SessionStatus = "genomford" | "kommande";

export type CommitmentStatus = "oppet" | "pagar" | "genomfort";

export type MilestoneStatus = "genomford" | "pagaende" | "kommande";

export type Organisation = {
  id: string;
  name: string;
  sizeLabel: string;
  industry: string;
  location: string;
  sponsor?: { name: string; role: string };
};

export type Milestone = {
  id: string;
  label: string;
  date: string;
  status: MilestoneStatus;
};

export type Engagement = {
  id: string;
  organisationId: string;
  title: string;
  kind: EngagementKind;
  kindLabel: string;
  purpose: string;
  scopeNote: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  status: EngagementStatus;
  participantIds: string[];
  milestones: Milestone[];
  nextReview?: { label: string; date: string };
  /** Vad som är överenskommet att rapportera på organisationsnivå. */
  sponsorReporting: string;
};

export type CoachingAgreement = {
  agreedAt: string;
  purpose: string;
  scope: string;
  cadence: string;
  confidentiality: string;
  sponsorSharing: string;
  ethics: string;
  clientResponsibility: string;
};

export type DevelopmentGoal = {
  headline: string;
  clientWording: string;
  baseline: string;
  successCriteria: string[];
  horizon: string;
};

export type SessionSummary = {
  focus: string;
  insights: string[];
  awareness: string;
  newPerspectives: string[];
  commitments: string[];
  followUp: string[];
  possibleNextFocus: string;
  approved: boolean;
  approvedAt?: string;
};

export type CoachingSession = {
  id: string;
  clientId: string;
  number: number;
  date: string;
  time: string;
  durationMinutes: number;
  status: SessionStatus;
  /** Klientägt: vad klienten vill fokusera på. */
  clientFocus: string;
  /** Klientägt: vad som skulle göra samtalet värdefullt. */
  desiredOutcome: string;
  /** Privata coachinganteckningar — sekretessnivå `coach`. */
  coachNotes?: string;
  summary?: SessionSummary;
  location: string;
};

export type Reflection = {
  id: string;
  clientId: string;
  sessionId?: string;
  date: string;
  prompt: string;
  text: string;
  visibility: Extract<ConfidentialityLevel, "coach_klient">;
};

export type Insight = {
  id: string;
  clientId: string;
  sessionId: string;
  date: string;
  text: string;
  visibility: Extract<ConfidentialityLevel, "coach_klient">;
};

export type Commitment = {
  id: string;
  clientId: string;
  sessionId: string;
  date: string;
  text: string;
  dueLabel: string;
  status: CommitmentStatus;
  clientNote?: string;
  completedAt?: string;
  visibility: Extract<ConfidentialityLevel, "coach_klient">;
};

export type PortalDocument = {
  id: string;
  ownerType: "klient" | "uppdrag";
  ownerId: string;
  title: string;
  kind: string;
  date: string;
  description: string;
  visibility: ConfidentialityLevel;
};

export type Client = {
  id: string;
  engagementId: string;
  organisationId: string;
  name: string;
  initials: string;
  role: string;
  headline: string;
  startedAt: string;
  /** `full` = rik historik i demon, `oversikt` = deltagare utan djup historik. */
  depth: "full" | "oversikt";
  agreement: CoachingAgreement;
  goal: DevelopmentGoal;
  recurringThemes: string[];
};

export type CoachProfile = {
  id: string;
  name: string;
  title: string;
  initials: string;
  email: string;
  credential: string;
  focus: string;
};
