import "server-only";

import type { Locale } from "@/lib/i18n/config";

/**
 * Copy for the public first-contact chain.
 *
 * Two-hour blocks are AVAILABILITY WINDOWS, never the length of the call.
 * Every message below says the same thing the website says: Carolina calls
 * during the chosen window, and the call itself is short and free.
 *
 * None of these emails may imply a coaching relationship, a client account,
 * CVB Base access, a programme, or an engagement. An accepted introductory
 * call is an accepted phone call and nothing more.
 */

export const BOOKING_NOTIFICATION_EVENTS = [
  "customer_request_received",
  "coach_new_request",
  "customer_request_accepted",
  "customer_request_declined",
] as const;

export type BookingNotificationEvent = (typeof BOOKING_NOTIFICATION_EVENTS)[number];

export type BookingNotificationRecipient = "customer" | "coach";

export const BOOKING_EVENT_RECIPIENT: Record<BookingNotificationEvent, BookingNotificationRecipient> = {
  customer_request_received: "customer",
  coach_new_request: "coach",
  customer_request_accepted: "customer",
  customer_request_declined: "customer",
};

export type BookingEmailContext = {
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  requestedStartAt: string;
  requestedEndAt: string;
  locale: Locale;
};

export type BookingEmail = { subject: string; body: string };

const TIMEZONE = "Europe/Stockholm";

function formatDate(iso: string, locale: Locale): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  }).format(parsed);
}

function formatWindow(startAt: string, endAt: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startAt}–${endAt}`;
  return `${formatter.format(start)}–${formatter.format(end)}`;
}

function lines(...parts: Array<string | null | false>): string {
  return parts.filter((part): part is string => typeof part === "string").join("\n");
}

/** Carolina signs every customer-facing message personally. */
const SIGNATURE_SV = ["Med vänlig hälsning,", "Carolina von Braun", "CVB Coaching"];
const SIGNATURE_EN = ["Kind regards,", "Carolina von Braun", "CVB Coaching"];

function customerReceived(context: BookingEmailContext): BookingEmail {
  const date = formatDate(context.requestedStartAt, context.locale);
  const window = formatWindow(context.requestedStartAt, context.requestedEndAt, context.locale);

  if (context.locale === "sv") {
    return {
      subject: "Din förfrågan om ett inledande samtal",
      body: lines(
        `Hej ${context.name},`,
        "",
        "Tack för din förfrågan. Jag har fått den och återkommer med besked om det valda tidsfönstret.",
        "",
        `Valt datum: ${date}`,
        `Valt tidsfönster: ${window}`,
        "",
        "Tidsfönstret är den period jag kan ringa upp inom — inte samtalets längd. Samtalet är kort, kostnadsfritt och sker per telefon.",
        "",
        "Det här är ännu inte en bekräftad tid. Du hör från mig när jag har tittat på förfrågan.",
        "",
        ...SIGNATURE_SV,
      ),
    };
  }

  return {
    subject: "Your request for an introductory conversation",
    body: lines(
      `Hello ${context.name},`,
      "",
      "Thank you for your request. I have received it and will come back to you about the selected time window.",
      "",
      `Selected date: ${date}`,
      `Selected time window: ${window}`,
      "",
      "The time window is the period within which I can call you — not the length of the conversation. The conversation is short, free and by telephone.",
      "",
      "This is not a confirmed time yet. You will hear from me once I have looked at the request.",
      "",
      ...SIGNATURE_EN,
    ),
  };
}

/**
 * Operator notification. A new website request is a request for an
 * introductory call — never a new client.
 */
function coachNewRequest(context: BookingEmailContext): BookingEmail {
  const date = formatDate(context.requestedStartAt, "sv");
  const window = formatWindow(context.requestedStartAt, context.requestedEndAt, "sv");

  return {
    subject: `Ny förfrågan om inledande samtal – ${context.name}`,
    body: lines(
      "Ny förfrågan om inledande samtal från hemsidan.",
      "",
      `Namn: ${context.name}`,
      `E-post: ${context.email}`,
      context.phone ? `Telefon: ${context.phone}` : null,
      `Önskat datum: ${date}`,
      `Önskat tidsfönster: ${window}`,
      context.message ? "" : null,
      context.message,
      "",
      "Förfrågan ligger som väntande i CVB Base tills du godkänner eller avböjer den.",
    ),
  };
}

function customerAccepted(context: BookingEmailContext): BookingEmail {
  const date = formatDate(context.requestedStartAt, context.locale);
  const window = formatWindow(context.requestedStartAt, context.requestedEndAt, context.locale);

  if (context.locale === "sv") {
    return {
      subject: "Ditt inledande samtal är bekräftat",
      body: lines(
        `Hej ${context.name},`,
        "",
        "Tack för din förfrågan. Vi ses i det tidsfönster du valde.",
        "",
        `Datum: ${date}`,
        `Tidsfönster: ${window}`,
        "",
        "Jag ringer upp dig någon gång under det tidsfönstret. Samtalet är kort och kostnadsfritt, och du behöver inte förbereda något.",
        "",
        ...SIGNATURE_SV,
      ),
    };
  }

  return {
    subject: "Your introductory conversation is confirmed",
    body: lines(
      `Hello ${context.name},`,
      "",
      "Thank you for your request. We will speak during the time window you chose.",
      "",
      `Date: ${date}`,
      `Time window: ${window}`,
      "",
      "I will call you at some point during that window. The conversation is short and free, and there is nothing you need to prepare.",
      "",
      ...SIGNATURE_EN,
    ),
  };
}

function customerDeclined(context: BookingEmailContext): BookingEmail {
  const date = formatDate(context.requestedStartAt, context.locale);
  const window = formatWindow(context.requestedStartAt, context.requestedEndAt, context.locale);

  if (context.locale === "sv") {
    return {
      subject: "Om din förfrågan om ett inledande samtal",
      body: lines(
        `Hej ${context.name},`,
        "",
        "Tack för din förfrågan. Tyvärr går det inte att ta det tidsfönster du valde.",
        "",
        `Det gällde: ${date}, ${window}`,
        "",
        "Du är varmt välkommen att välja ett annat tidsfönster på cvbcoaching.se.",
        "",
        ...SIGNATURE_SV,
      ),
    };
  }

  return {
    subject: "About your request for an introductory conversation",
    body: lines(
      `Hello ${context.name},`,
      "",
      "Thank you for your request. Unfortunately I cannot take the time window you chose.",
      "",
      `This concerned: ${date}, ${window}`,
      "",
      "You are very welcome to choose another time window at cvbcoaching.se.",
      "",
      ...SIGNATURE_EN,
    ),
  };
}

export function buildBookingEmail(
  event: BookingNotificationEvent,
  context: BookingEmailContext,
): BookingEmail {
  switch (event) {
    case "customer_request_received":
      return customerReceived(context);
    case "coach_new_request":
      return coachNewRequest(context);
    case "customer_request_accepted":
      return customerAccepted(context);
    case "customer_request_declined":
      return customerDeclined(context);
  }
}
