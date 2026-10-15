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
    "Välkommen till CvB Base, din personliga klientportal hos CvB Coaching!",
    "",
    "Här hittar du stöd för din utveckling under vårt samarbete, till exempel reflektioner, sammanfattningar från våra sessioner och relevant material.",
    "",
    "Aktivera ditt konto",
    "",
    "Klicka på länken nedan för att aktivera ditt konto och välja ditt lösenord:",
    "",
    context.activationUrl,
    "",
    `Länken är giltig i ${validity} och kan bara användas en gång. Om länken har gått ut kan du själv begära en ny via ”Glömt lösenord?” på ${context.loginUrl}.`,
    "",
    "När ditt konto är aktiverat loggar du in med din e-postadress och ditt lösenord här:",
    "",
    context.loginUrl,
    "",
    `Om något inte fungerar är du välkommen att svara på det här mejlet eller skriva till ${LEGAL_ENTITY.legalEmail}, så hjälper jag dig.`,
    "",
    "Om du inte väntade dig det här meddelandet kan du bortse från det.",
    "",
    "Ser fram emot vårt samarbete!",
    "",
    "Vänliga hälsningar,",
    LEGAL_ENTITY.operator,
    "CvB Coaching",
  ].join("\n");

  return { subject: "Din inbjudan till CVB Base", body };
}
