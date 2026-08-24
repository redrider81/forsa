import "server-only";

import { seedMaterials } from "@/lib/portal/data/materials";
import type { CoachingMaterial } from "@/lib/portal/types";
import {
  EMPTY_DEMO_MATERIALS_STATE,
  type DemoMaterialsState,
} from "@/lib/portal/store/demo-materials-state";

export type MaterialAudience = "klient" | "coach";

export {
  canClientDelete,
  canClientEdit,
  canCoachDelete,
  isSharingLevel,
  partitionClientMaterials,
  resolveLinkInput,
  type MaterialLinkInput,
} from "@/lib/portal/material-utils";

function sortMaterials(items: CoachingMaterial[]): CoachingMaterial[] {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function mergeMaterialsForClient(
  clientId: string,
  materialsState: DemoMaterialsState = EMPTY_DEMO_MATERIALS_STATE,
  materials: CoachingMaterial[] = seedMaterials,
): CoachingMaterial[] {
  const deleted = new Set(materialsState.deletedIds);
  const byId = new Map<string, CoachingMaterial>();

  for (const seed of materials) {
    if (seed.ownerClientId !== clientId || deleted.has(seed.id)) continue;
    byId.set(seed.id, { ...seed });
  }

  for (const added of materialsState.added) {
    if (added.ownerClientId !== clientId || deleted.has(added.id)) continue;
    byId.set(added.id, { ...added });
  }

  for (const [id, patch] of Object.entries(materialsState.updated)) {
    const existing = byId.get(id);
    if (!existing || existing.ownerClientId !== clientId) continue;
    byId.set(id, {
      ...existing,
      ...patch,
      id: existing.id,
      ownerClientId: existing.ownerClientId,
      updatedAt: patch.updatedAt ?? existing.updatedAt,
    });
  }

  return sortMaterials([...byId.values()]);
}

function visibleToCoach(material: CoachingMaterial): boolean {
  if (material.source === "coach_shared") return true;
  return material.sharingLevel === "shared_coach";
}

/** Alla material för en klient, filtrerade per audience. */
export function listClientMaterials(
  clientId: string,
  audience: MaterialAudience,
  materialsState: DemoMaterialsState = EMPTY_DEMO_MATERIALS_STATE,
  materials: CoachingMaterial[] = seedMaterials,
): CoachingMaterial[] {
  const merged = mergeMaterialsForClient(clientId, materialsState, materials);
  if (audience === "coach") {
    return merged.filter(visibleToCoach);
  }
  return merged;
}

export function getClientMaterial(
  clientId: string,
  materialId: string,
  audience: MaterialAudience,
  materialsState: DemoMaterialsState = EMPTY_DEMO_MATERIALS_STATE,
  materials: CoachingMaterial[] = seedMaterials,
): CoachingMaterial | null {
  return (
    listClientMaterials(clientId, audience, materialsState, materials).find(
      (item) => item.id === materialId,
    ) ?? null
  );
}

export function countMaterialsLinkedToNextSession(
  clientId: string,
  materialsState: DemoMaterialsState = EMPTY_DEMO_MATERIALS_STATE,
  materials: CoachingMaterial[] = seedMaterials,
): number {
  return listClientMaterials(clientId, "klient", materialsState, materials).filter(
    (item) => item.linkType === "next_session",
  ).length;
}
