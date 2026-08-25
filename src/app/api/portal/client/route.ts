import { readCoachSession } from "@/lib/portal/session";
import { deriveClientInitials } from "@/lib/portal/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EngagementKind, EngagementStatus } from "@/lib/portal/types";

const KIND_LABELS: Record<EngagementKind, string> = {
  individuell: "Individuell coaching",
  ledarutveckling: "Ledarutvecklingsuppdrag",
  program: "Ledarskapsprogram",
};

const KINDS = new Set<EngagementKind>(["individuell", "ledarutveckling", "program"]);
const STATUSES = new Set<EngagementStatus>(["planering", "pagaende", "avslutat"]);

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Carolina skapar en ny privat- eller företagsklient med tillhörande uppdrag. */
export async function POST(request: Request) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const clientType = raw.clientType === "foretag" ? "foretag" : "privat";
  const clientRaw = (raw.client ?? {}) as Record<string, unknown>;
  const engagementRaw = (raw.engagement ?? {}) as Record<string, unknown>;
  const agreementRaw = (raw.agreement ?? {}) as Record<string, unknown>;
  const goalRaw = (raw.goal ?? {}) as Record<string, unknown>;

  const name = text(clientRaw.name, 120);
  const role = text(clientRaw.role, 120);
  const email = text(clientRaw.email, 160);
  if (!name || !role || !email) {
    return Response.json({ ok: false, error: "Namn, roll och e-post krävs." }, { status: 400 });
  }

  const title = text(engagementRaw.title, 160);
  const kind = KINDS.has(engagementRaw.kind as EngagementKind)
    ? (engagementRaw.kind as EngagementKind)
    : "individuell";
  const startDate = text(engagementRaw.startDate, 10);
  const endDate = text(engagementRaw.endDate, 10);
  if (!title || !startDate || !endDate) {
    return Response.json(
      { ok: false, error: "Uppdragets titel, startdatum och slutdatum krävs." },
      { status: 400 },
    );
  }

  const recurringThemes = Array.isArray(clientRaw.recurringThemes)
    ? clientRaw.recurringThemes.filter((item): item is string => typeof item === "string").slice(0, 12)
    : [];

  const clientPayload = {
    name,
    role,
    email,
    phone: text(clientRaw.phone, 40),
    headline: text(clientRaw.headline, 160),
    startedAt: startDate,
    initials: deriveClientInitials(name),
    recurringThemes,
  };

  const engagementPayload = {
    title,
    kind,
    kindLabel: KIND_LABELS[kind],
    purpose: text(engagementRaw.purpose, 400),
    scopeNote: text(engagementRaw.scopeNote, 400),
    periodLabel: text(engagementRaw.periodLabel, 120),
    startDate,
    endDate,
    status: STATUSES.has(engagementRaw.status as EngagementStatus)
      ? (engagementRaw.status as EngagementStatus)
      : "pagaende",
  };

  const agreementPayload = {
    agreedAt: text(agreementRaw.agreedAt, 10),
    purpose: text(agreementRaw.purpose, 600),
    scope: text(agreementRaw.scope, 600),
    cadence: text(agreementRaw.cadence, 300),
    confidentiality: text(agreementRaw.confidentiality, 600),
    sponsorSharing: text(agreementRaw.sponsorSharing, 600),
    ethics: text(agreementRaw.ethics, 600),
    clientResponsibility: text(agreementRaw.clientResponsibility, 600),
  };

  const successCriteria =
    typeof goalRaw.successCriteria === "string"
      ? goalRaw.successCriteria
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 12)
      : [];

  const goalPayload = {
    headline: text(goalRaw.headline, 200),
    clientWording: text(goalRaw.clientWording, 600),
    baseline: text(goalRaw.baseline, 600),
    successCriteria,
    horizon: text(goalRaw.horizon, 120),
  };

  let organisationId: string | null = null;
  let newOrganisation: Record<string, string> | null = null;

  if (clientType === "foretag") {
    const organisationRaw = (raw.organisation ?? {}) as Record<string, unknown>;
    if (organisationRaw.mode === "new") {
      const orgName = text(organisationRaw.name, 160);
      if (!orgName) {
        return Response.json({ ok: false, error: "Ange organisationens namn." }, { status: 400 });
      }
      newOrganisation = {
        name: orgName,
        sizeLabel: text(organisationRaw.sizeLabel, 80),
        industry: text(organisationRaw.industry, 80),
        location: text(organisationRaw.location, 80),
        sponsorName: text(organisationRaw.sponsorName, 120),
        sponsorRole: text(organisationRaw.sponsorRole, 120),
      };
    } else {
      const existingId = text(organisationRaw.id, 64);
      if (!existingId) {
        return Response.json({ ok: false, error: "Välj en organisation." }, { status: 400 });
      }
      organisationId = existingId;
    }
  }

  const supabase = await createSupabaseServerClient();
  const { data: clientId, error } = await supabase.rpc("create_client_bundle", {
    p_client: clientPayload,
    p_engagement: engagementPayload,
    p_agreement: agreementPayload,
    p_goal: goalPayload,
    p_organisation_id: organisationId ?? undefined,
    p_new_organisation: newOrganisation ?? undefined,
  });

  if (error || !clientId) {
    return Response.json({ ok: false, error: "Klienten kunde inte skapas." }, { status: 502 });
  }

  return Response.json({ ok: true, clientId });
}
