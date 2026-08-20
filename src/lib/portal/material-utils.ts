import type { CoachingMaterial, MaterialLinkType, MaterialSharingLevel } from "@/lib/portal/types";

export function partitionClientMaterials(materials: CoachingMaterial[]): {
  ownFiles: CoachingMaterial[];
  ownNotes: CoachingMaterial[];
  sharedByCoach: CoachingMaterial[];
} {
  return {
    ownFiles: materials.filter((item) => item.source === "client_upload"),
    ownNotes: materials.filter((item) => item.source === "client_note"),
    sharedByCoach: materials.filter((item) => item.source === "coach_shared"),
  };
}

export function canClientEdit(material: CoachingMaterial): boolean {
  return material.createdByRole === "klient";
}

export function canClientDelete(material: CoachingMaterial): boolean {
  return material.createdByRole === "klient";
}

export function canCoachDelete(material: CoachingMaterial): boolean {
  return material.source === "coach_shared";
}

export type MaterialLinkInput = {
  linkType: MaterialLinkType;
  linkedSessionId?: string;
  linkedCommitmentId?: string;
};

export function resolveLinkInput(input: MaterialLinkInput): Pick<
  CoachingMaterial,
  "linkType" | "linkedSessionId" | "linkedCommitmentId"
> {
  if (input.linkType === "none") {
    return { linkType: "none", linkedSessionId: undefined, linkedCommitmentId: undefined };
  }
  if (input.linkType === "goal" || input.linkType === "next_session") {
    return {
      linkType: input.linkType,
      linkedSessionId: undefined,
      linkedCommitmentId: undefined,
    };
  }
  if (input.linkType === "session") {
    return {
      linkType: "session",
      linkedSessionId: input.linkedSessionId,
      linkedCommitmentId: undefined,
    };
  }
  return {
    linkType: "commitment",
    linkedSessionId: undefined,
    linkedCommitmentId: input.linkedCommitmentId,
  };
}

export function isSharingLevel(value: string): value is MaterialSharingLevel {
  return value === "private" || value === "shared_coach";
}
