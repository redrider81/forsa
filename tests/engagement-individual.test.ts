import { describe, expect, it } from "vitest";
import { buildEngagementContext } from "@/lib/ai/context";
import { buildEngagementOverview, listEngagements, SEED_REPOSITORY_DATA, type PortalRepositoryData } from "@/lib/portal/repository";

/**
 * Individual engagements (no organisation) — created through "Ny klient" for a
 * private client. They were silently dropped from the engagement list and
 * their detail page returned 404 (2026-10-14 verification, finding 3d).
 */

const COACH = SEED_REPOSITORY_DATA.coach.id;
const seedClient = SEED_REPOSITORY_DATA.clients[0];
const seedEngagement = SEED_REPOSITORY_DATA.engagements[0];

const data: PortalRepositoryData = {
  ...SEED_REPOSITORY_DATA,
  engagements: [
    ...SEED_REPOSITORY_DATA.engagements,
    {
      ...seedEngagement,
      id: "eng-private",
      organisationId: undefined,
      title: "Individuell coaching",
      kind: "individuell",
      kindLabel: "Individuell coaching",
      participantIds: ["client-private"],
      milestones: [],
      nextReview: undefined,
      sponsorReporting: "",
    },
  ],
  clients: [
    ...SEED_REPOSITORY_DATA.clients,
    { ...seedClient, id: "client-private", name: "Privat Klient", engagementId: "eng-private", organisationId: undefined },
  ],
};

describe("individual engagements", () => {
  it("are part of the coach's engagements", () => {
    expect(listEngagements(COACH, data).map((item) => item.id)).toContain("eng-private");
  });

  it("get an overview with their participant and no invented organisation", () => {
    const overview = buildEngagementOverview(COACH, "eng-private", undefined, data);
    expect(overview).not.toBeNull();
    expect(overview!.organisation.id).toBe("");
    expect(overview!.organisation.name).toBe("");
    expect(overview!.participants.map((item) => item.client.id)).toEqual(["client-private"]);
  });

  it("every engagement in the list has an overview", () => {
    for (const engagement of listEngagements(COACH, data)) {
      expect(buildEngagementOverview(COACH, engagement.id, undefined, data), engagement.id).not.toBeNull();
    }
  });

  it("organisation engagements are unchanged", () => {
    const overview = buildEngagementOverview(COACH, seedEngagement.id, undefined, data);
    expect(overview!.organisation.id).toBe(seedEngagement.organisationId);
    expect(overview!.organisation.name).not.toBe("");
  });

  it("get no organisation-level AI context, as before", () => {
    expect(buildEngagementContext(COACH, "eng-private", undefined, data)).toBeNull();
    expect(buildEngagementContext(COACH, seedEngagement.id, undefined, data)).not.toBeNull();
  });

  it("stay inaccessible to another coach", () => {
    expect(buildEngagementOverview("coach-other", "eng-private", undefined, data)).toBeNull();
  });

  it("an organisation id that cannot be resolved is still not found", () => {
    const broken: PortalRepositoryData = {
      ...data,
      engagements: [{ ...seedEngagement, id: "eng-broken", organisationId: "org-missing" }],
    };
    expect(buildEngagementOverview(COACH, "eng-broken", undefined, broken)).toBeNull();
  });
});
