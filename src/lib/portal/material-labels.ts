import type { MaterialCategory, MaterialLinkType, MaterialSharingLevel, MaterialSource } from "@/lib/portal/types";

export const materialCategoryLabel: Record<MaterialCategory, string> = {
  arbetsmaterial: "Arbetsmaterial",
  underlag: "Underlag",
  utvardering: "Utvärdering",
  anteckning: "Anteckning",
  ovrigt: "Övrigt",
};

export const materialCategoryOptions = Object.entries(materialCategoryLabel).map(
  ([value, label]) => ({ value: value as MaterialCategory, label }),
);

export const materialSharingLabel: Record<MaterialSharingLevel, string> = {
  private: "Privat för mig",
  shared_coach: "Delat med Carolina",
};

export const materialSourceLabel: Record<MaterialSource, string> = {
  client_upload: "Uppladdat av dig",
  client_note: "Anteckning",
  coach_shared: "Delat av Carolina",
};

export const materialLinkTypeLabel: Record<MaterialLinkType, string> = {
  goal: "Utvecklingsmål",
  next_session: "Nästa session",
  session: "Session",
  commitment: "Åtagande",
  none: "Ingen koppling",
};

export const materialLinkTypeOptions = [
  { value: "none" as const, label: "Ingen koppling" },
  { value: "goal" as const, label: "Mitt utvecklingsmål" },
  { value: "next_session" as const, label: "Nästa session" },
  { value: "session" as const, label: "Specifik session" },
  { value: "commitment" as const, label: "Specifikt åtagande" },
];
