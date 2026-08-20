import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
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

export type ContactConfirmationEmail = {
  subject: string;
  text: string;
};

export function buildContactConfirmationEmail(
  payload: ContactIntakePayload,
  locale: Locale,
): ContactConfirmationEmail {
  const preferredDate = formatPreferredDate(payload.onskatDatum, locale);
  const t = getDictionary(locale);
  const preferredWindow =
    payload.onskadTidsfonster === ""
      ? locale === "sv"
        ? "Ej angivet"
        : "Not specified"
      : t.form.timeWindows[payload.onskadTidsfonster];

  if (locale === "sv") {
    return {
      subject: "Din förfrågan till CVB Coaching",
      text: [
        `Hej ${payload.namn},`,
        "",
        "Tack för din förfrågan. Vi har tagit emot uppgifterna nedan och återkommer med bekräftelse.",
        "",
        `Önskat datum: ${preferredDate}`,
        `Önskad tid på dagen: ${preferredWindow}`,
        "",
        "All kontakt hanteras konfidentiellt. Svar inom en arbetsdag.",
        "",
        "Med vänlig hälsning,",
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
      `Preferred time of day: ${preferredWindow}`,
      "",
      "All contact is handled confidentially. Response within one business day.",
      "",
      "Kind regards,",
      "CVB Coaching",
    ].join("\n"),
  };
}
