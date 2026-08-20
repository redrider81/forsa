export const TIME_WINDOWS = ["08_10", "10_12", "12_14", "14_16", "16_17"] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

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
  onskadTidsfonster: TimeWindow | "";
};

export function isTimeWindow(value: string): value is TimeWindow {
  return (TIME_WINDOWS as readonly string[]).includes(value);
}
