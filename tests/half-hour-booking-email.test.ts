import { describe, expect, it } from "vitest";

import { buildBookingEmail, type BookingEmailContext } from "@/lib/email/booking-emails";

/**
 * Introductory calls are booked as 30-minute slots
 * (20261015120000_cvb_base_public_half_hour_slots). The confirmation sent
 * after Carolina accepts carries her own wording and the exact slot; the
 * receipt sent on submission still says the time awaits confirmation.
 */

// Monday 2026-10-19, 10:30–11:00 Europe/Stockholm (CEST, UTC+2).
const context: BookingEmailContext = {
  name: "Anna Lind",
  email: "anna@example.com",
  phone: "070-000 00 00",
  message: null,
  requestedStartAt: "2026-10-19T08:30:00.000Z",
  requestedEndAt: "2026-10-19T09:00:00.000Z",
  locale: "sv",
};

describe("bekräftelse av 30-minuterssamtal", () => {
  it("använder Carolinas text med exakt datum och tidsintervall", () => {
    const email = buildBookingEmail("customer_request_accepted", context);

    expect(email.subject).toBe("Ditt inledande samtal är bekräftat");
    expect(email.body).toBe(
      [
        "Hej Anna Lind,",
        "",
        "Tack för ditt bokade samtal! Jag ringer upp dig på den valda tiden.",
        "",
        "Samtalet är kort och kostnadsfritt, och ger dig möjlighet att berätta om din situation, vad du vill utveckla eller vad du önskar få stöd med.",
        "",
        "Valt datum: måndag 19 oktober 2026",
        "",
        "Valt tidsfönster: 10:30–11:00",
        "",
        "Ser fram emot att höras!",
        "",
        "Med vänlig hälsning,",
        "Carolina von Braun",
        "CVB Coaching",
      ].join("\n"),
    );
  });

  it("visar tiden i Stockholmstid även efter övergången till vintertid", () => {
    // Monday 2026-11-02, 15:30–16:00 Europe/Stockholm (CET, UTC+1).
    const email = buildBookingEmail("customer_request_accepted", {
      ...context,
      requestedStartAt: "2026-11-02T14:30:00.000Z",
      requestedEndAt: "2026-11-02T15:00:00.000Z",
    });

    expect(email.body).toContain("Valt datum: måndag 2 november 2026");
    expect(email.body).toContain("Valt tidsfönster: 15:30–16:00");
  });

  it("bekräftar på engelska för besökare som bokade på engelska", () => {
    const email = buildBookingEmail("customer_request_accepted", { ...context, locale: "en" });

    expect(email.body).toContain("I will call you at the time you chose.");
    expect(email.body).toContain("Selected time window: 10:30–11:00");
  });

  it("låter kvittot vid förfrågan fortsatt vänta på bekräftelse", () => {
    const received = buildBookingEmail("customer_request_received", context);

    expect(received.body).toContain("Valt tidsfönster: 10:30–11:00");
    expect(received.body).toContain("Det här är ännu inte en bekräftad tid.");
    expect(received.body).not.toContain("Tack för ditt bokade samtal");
  });
});
