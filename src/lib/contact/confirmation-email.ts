import type { Locale } from "@/lib/i18n/config";
import { type ContactIntakePayload } from "@/lib/contact/intake-types";

function formatPreferredDate(isoDate: string, locale: Locale): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

function formatPreferredTime(isoStart: string, isoEnd: string, locale: Locale): string {
  if (!isoStart || !isoEnd) return locale === "sv" ? "Ej angivet" : "Not specified";
  const formatter = new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  });
  const start = formatter.format(new Date(isoStart));
  const end = formatter.format(new Date(isoEnd));
  return `${start}–${end}`;
}

export type ContactConfirmationEmail = {
  subject: string;
  text: string;
};

export function buildContactConfirmationEmail(
  payload: ContactIntakePayload,
  locale: Locale,
): ContactConfirmationEmail {
  const preferredDate = formatPreferredDate(payload.onskatDatum, locale);
  const preferredTime = formatPreferredTime(payload.onskadTid, payload.onskadTidSlut, locale);

  if (locale === "sv") {
    return {
      subject: "Din förfrågan till CVB Coaching",
      text: [
        `Hej ${payload.namn},`,
        "",
        "Tack för din förfrågan. Uppgifterna nedan är mottagna, och en bekräftelse följer.",
        "",
        `Önskat datum: ${preferredDate}`,
        `Önskad tid: ${preferredTime}`,
        "",
        "All kontakt hanteras konfidentiellt.",
        "",
        "Med vänlig hälsning,",
        "Carolina von Braun",
        "CVB Coaching",
      ].join("\n"),
    };
  }

  return {
    subject: "Your request to CVB Coaching",
    text: [
      `Hello ${payload.namn},`,
      "",
      "Thank you for your request. We have received the details below and will confirm by reply.",
      "",
      `Preferred date: ${preferredDate}`,
      `Preferred time: ${preferredTime}`,
      "",
      "All contact is handled confidentially. Response within one business day.",
      "",
      "Kind regards,",
      "CVB Coaching",
    ].join("\n"),
  };
}
