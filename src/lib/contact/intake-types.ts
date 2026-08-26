export const PUBLIC_BOOKING_SLUG = "carolina-von-braun";

export type ContactIntakePayload = {
  namn: string;
  organisation: string;
  roll: string;
  epost: string;
  telefon: string;
  ort: string;
  fragan: string;
  lage: string;
  situation: string;
  tydligare: string;
  tidpunkt: string;
  onskatDatum: string;
  /** ISO start timestamp of the selected real slot, e.g. "2026-09-03T07:00:00+00:00". */
  onskadTid: string;
  /** ISO end timestamp of the selected real slot. */
  onskadTidSlut: string;
};
