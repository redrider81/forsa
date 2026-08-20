import "server-only";

import { Resend } from "resend";
import type { EmailProvider } from "@/lib/email/result-email";
import { ResultEmailError } from "@/lib/email/result-email";

export function createResendProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new ResultEmailError(
      "missing_config",
      "E-postfunktionen saknar API-nyckel i den här miljön.",
    );
  }

  const resend = new Resend(apiKey);

  return {
    async send({ from, to, subject, body }) {
      const result = await resend.emails.send({
        from,
        to,
        subject,
        text: body,
      });

      if (result.error) {
        console.error("[CVB Coaching] Resend misslyckades", {
          recipient: to,
          subjectLength: subject.length,
          bodyLength: body.length,
          errorName: result.error.name,
          errorMessage: result.error.message,
        });

        throw new ResultEmailError(
          "provider_error",
          resendErrorMessage(result.error.message),
        );
      }

      return { id: result.data?.id ?? "sent" };
    },
  };
}

function resendErrorMessage(providerMessage: string): string {
  const message = providerMessage.toLowerCase();

  if (message.includes("from") && (message.includes("domain") || message.includes("verify"))) {
    return "Avsändaradressen är inte verifierad för utskick.";
  }
  if (message.includes("api key") || message.includes("unauthorized")) {
    return "E-postfunktionen saknar giltig API-nyckel i den här miljön.";
  }

  return "Det gick inte att skicka e-postmeddelandet just nu.";
}
