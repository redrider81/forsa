import { LEGAL_ENTITY } from "@/lib/legal/company";

/**
 * Invitation to CVB Base — sent when Carolina gives a client portal access.
 *
 * Plain text in Carolina's own voice. Carries nothing from the coaching
 * relationship beyond the recipient's first name: no engagement, goal or
 * session content, and never a password. The activation link is the only
 * credential and it is single-use and time-limited by Supabase Auth.
 *
 * CVB Base is Swedish-only, so this is too.
 */

export type ClientInvitationEmailContext = {
  clientName: string;
  activationUrl: string;
  validHours: number;
  loginUrl: string;
};

export type ClientInvitationEmail = { subject: string; body: string };

function validityLabel(hours: number): string {
  if (hours === 1) return "en timme";
  if (hours === 24) return "ett dygn";
  return `${hours} timmar`;
}

export function buildClientInvitationEmail(context: ClientInvitationEmailContext): ClientInvitationEmail {
  const firstName = context.clientName.trim().split(/\s+/)[0] || context.clientName.trim();
  const validity = validityLabel(context.validHours);

  const body = [
    `Hej ${firstName},`,
    "",
    "Välkommen till CVB Base!",
    "",
    "Jag har gett dig tillgång till CVB Base, CVB Coachings digitala miljö för vårt coachingsamarbete. Där samlar du dina sessioner, förberedelser, reflektioner och åtaganden, och får tillgång till material vi delar mellan samtalen.",
    "",
    "Du får det här meddelandet eftersom vi har inlett ett coachingsamarbete. Det finns ingen öppen registrering i CVB Base – kontot har skapats åt dig.",
    "",
    "Så aktiverar du ditt konto:",
    "1. Öppna länken nedan.",
    "2. Välj ett eget lösenord.",
    "3. Du loggas in direkt i CVB Base.",
    "",
    context.activationUrl,
    "",
    `Länken gäller i ${validity} och kan bara användas en gång. Om den har gått ut kan du själv begära en ny länk via ”Glömt lösenord?” på ${context.loginUrl}. Om något inte fungerar svarar du bara på det här mejlet eller skriver till ${LEGAL_ENTITY.legalEmail}, så skickar jag en ny inbjudan.`,
    "",
    `När kontot är aktiverat loggar du in med din e-postadress och ditt lösenord på ${context.loginUrl}`,
    "",
    "Om du inte väntade dig det här meddelandet kan du bortse från det.",
    "",
    "Med vänlig hälsning,",
    LEGAL_ENTITY.operator,
    LEGAL_ENTITY.tradeName,
  ].join("\n");

  return { subject: "Din inbjudan till CVB Base", body };
}
