import "server-only";

import { Resend } from "resend";

/**
 * Email provider for the public booking chain.
 *
 * Separate from the portal's result-email provider on purpose: this one
 * carries a deterministic idempotency key, so a retry of the same logical
 * notification is also de-duplicated at the provider, not only locally.
 */
export type BookingEmailProvider = {
  send: (payload: {
    from: string;
    to: string;
    subject: string;
    body: string;
    idempotencyKey: string;
  }) => Promise<{ id: string }>;
};

export class BookingEmailError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "BookingEmailError";
  }
}

export function createResendBookingProvider(): BookingEmailProvider {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new BookingEmailError("missing_api_key", "E-postfunktionen saknar API-nyckel.");
  }

  const resend = new Resend(apiKey);

  return {
    async send({ from, to, subject, body, idempotencyKey }) {
      const result = await resend.emails.send(
        { from, to, subject, text: body },
        // Resend de-duplicates on this header, so the same logical event can
        // be retried without the recipient receiving it twice.
        { idempotencyKey },
      );

      if (result.error) {
        throw new BookingEmailError(result.error.name || "provider_error", result.error.message);
      }

      return { id: result.data?.id ?? "accepted" };
    },
  };
}
