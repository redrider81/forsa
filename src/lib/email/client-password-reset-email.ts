import { LEGAL_ENTITY } from "@/lib/legal/company";

/**
 * "Glömt lösenord?" — the reset link for an existing CVB Base client.
 *
 * Only sent to an address that belongs to a client account; the requester
 * is never told whether that was the case. Carries no coaching content and
 * never a password. The link is single-use and time-limited by Supabase Auth.
 */

export type ClientPasswordResetEmailContext = {
  resetUrl: string;
  validHours: number;
  loginUrl: string;
};

function validityLabel(hours: number): string {
  if (hours === 1) return "en timme";
  if (hours === 24) return "ett dygn";
  return `${hours} timmar`;
}

export function buildClientPasswordResetEmail(context: ClientPasswordResetEmailContext): { subject: string; body: string } {
  const body = [
    "Hej,",
    "",
    "Någon har begärt att lösenordet till ditt konto i CVB Base ska återställas. Välj ett nytt lösenord via länken nedan:",
    "",
    context.resetUrl,
    "",
    `Länken gäller i ${validityLabel(context.validHours)} och kan bara användas en gång. Om den har gått ut kan du begära en ny via ”Glömt lösenord?” på ${context.loginUrl}`,
    "",
    "Om det inte var du som begärde detta kan du bortse från meddelandet – ditt nuvarande lösenord fortsätter då att gälla.",
    "",
    `Har du frågor? Svara på det här mejlet eller skriv till ${LEGAL_ENTITY.legalEmail}.`,
    "",
    "Med vänlig hälsning,",
    LEGAL_ENTITY.operator,
    LEGAL_ENTITY.tradeName,
  ].join("\n");

  return { subject: "Återställ ditt lösenord till CVB Base", body };
}
