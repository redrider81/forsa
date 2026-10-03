import type { Locale } from "@/lib/i18n/config";
import { LEGAL_ENTITY, LEGAL_UPDATED_AT } from "@/lib/legal/company";
import { formatUpdated, link, list, p, type LegalDocument } from "@/lib/legal/document";
import { legalHref } from "@/lib/legal/links";

/** Användarvillkor för CVB Base — the digital service itself. */

const mail = link(LEGAL_ENTITY.legalEmail, `mailto:${LEGAL_ENTITY.legalEmail}`);

function sv(): LegalDocument {
  const L = (key: Parameters<typeof legalHref>[0]) => legalHref(key, "sv");
  return {
    metaTitle: "Användarvillkor för CVB Base | CVB Coaching",
    metaDescription:
      "Användarvillkor för CVB Base, CVB Coachings digitala miljö för klienter i ett coachingsamarbete.",
    label: "CVB Base-villkor",
    title: "Användarvillkor för CVB Base",
    lead: "CVB Base är CVB Coachings digitala miljö för klienter i ett coachingsamarbete. Villkoren gäller när du använder ditt konto i CVB Base.",
    updatedLabel: `Senast uppdaterad ${formatUpdated(LEGAL_UPDATED_AT, "sv")}`,
    tocLabel: "Innehåll",
    sections: [
      {
        id: "tjansten",
        heading: "Tjänsten",
        blocks: [
          p(
            "I CVB Base kan du följa dina sessioner, förbereda dig inför samtal, skriva reflektioner, hålla ordning på åtaganden, ta del av material, dela material med Carolina och hantera avtal. CVB Base är en del av leveransen i ditt coachingsamarbete och används tillsammans med ",
            link("de allmänna villkoren", L("terms")),
            " och ditt individuella avtal.",
          ),
        ],
      },
      {
        id: "konto",
        heading: "Konto och inloggning",
        blocks: [
          list(
            "Det finns ingen öppen registrering. Ditt konto skapas av CVB Coaching när ett samarbete inleds.",
            "Kontot är personligt. Du får inte låta någon annan använda det.",
            "Du loggar in med e-post och lösenord. Håll ditt lösenord hemligt och kontakta oss direkt om du misstänker att någon annan har kommit åt ditt konto.",
            "Du ansvarar för det som görs med ditt konto, om det inte beror på att CVB Coaching har brustit i sitt ansvar.",
          ),
        ],
      },
      {
        id: "material",
        heading: "Ditt material — privat och delat",
        blocks: [
          p(
            "Information och material hanteras enligt de delnings- och åtkomstval som finns i tjänsten och som beskrivs i ",
            link("integritetspolicyn", L("privacy")),
            ".",
          ),
          p(
            "Du ansvarar för det du laddar upp och skriver. Ladda bara upp sådant du har rätt att dela, och dela bara känsliga personuppgifter, till exempel om hälsa, om du har lämnat det separata samtycket under Profil. Det du själv laddar upp kan du ta bort när funktionen finns tillgänglig.",
          ),
        ],
      },
      {
        id: "tillaten-anvandning",
        heading: "Tillåten användning",
        blocks: [
          p("Du får inte:"),
          list(
            "försöka komma åt andra användares uppgifter eller på annat sätt kringgå behörighetsgränser,",
            "försöka störa, överbelasta eller skada tjänsten,",
            "ladda upp skadlig kod eller material som gör intrång i någon annans rättigheter eller är olagligt,",
            "använda tjänsten för något annat än ditt coachingsamarbete.",
          ),
          p("Vid allvarlig eller upprepad överträdelse kan CVB Coaching stänga av kontot."),
        ],
      },
      {
        id: "tillganglighet",
        heading: "Tillgänglighet och underhåll",
        blocks: [
          p(
            "Vi strävar efter att CVB Base ska vara tillgängligt, men kan inte garantera att tjänsten alltid fungerar utan avbrott. Tjänsten kan tillfälligt vara otillgänglig vid planerat underhåll, uppdateringar eller störningar hos våra leverantörer. Vi försöker förlägga planerat underhåll till tider då det stör så lite som möjligt.",
          ),
          p(
            "Spara gärna egna kopior av material som är viktigt för dig. Innehållet i CVB Base är ett stöd i coachingen och ersätter inte ditt eget arkiv.",
          ),
        ],
      },
      {
        id: "personuppgifter",
        heading: "Personuppgifter och cookies",
        blocks: [
          p(
            "Hur dina personuppgifter behandlas beskrivs i ",
            link("integritetspolicyn", L("privacy")),
            ". CVB Base använder bara tekniskt nödvändiga cookies, se ",
            link("cookiepolicyn", L("cookies")),
            ".",
          ),
        ],
      },
      {
        id: "avslut",
        heading: "När samarbetet avslutas",
        blocks: [
          p(
            "När coachingsamarbetet avslutas markeras du som avslutad klient. Historiken finns då kvar, så att samarbetet kan återupptas. Du kan begära att dina uppgifter raderas och att ditt konto tas bort — kontakta ",
            mail,
            ". Avtal och uppgifter som måste sparas enligt lag, eller som behövs för rättsliga anspråk, sparas så länge det krävs, enligt integritetspolicyn.",
          ),
        ],
      },
      {
        id: "ansvar",
        heading: "Ansvar",
        blocks: [
          p(
            "CVB Coaching ansvarar för skada som orsakas genom att CVB Coaching varit försumlig i tillhandahållandet av tjänsten. Mot en konsument begränsas inte ansvaret utöver vad tvingande lag tillåter.",
          ),
        ],
      },
      {
        id: "andringar",
        heading: "Ändringar och kontakt",
        blocks: [
          p(
            "Vi kan uppdatera villkoren, till exempel när tjänsten ändras. Väsentliga ändringar meddelas i god tid. Frågor om CVB Base skickar du till ",
            mail,
            ".",
          ),
        ],
      },
    ],
  };
}

function en(): LegalDocument {
  const L = (key: Parameters<typeof legalHref>[0]) => legalHref(key, "en");
  return {
    metaTitle: "CVB Base terms of use | CVB Coaching",
    metaDescription:
      "Terms of use for CVB Base, CVB Coaching's digital environment for clients in a coaching engagement.",
    label: "CVB Base terms",
    title: "CVB Base terms of use",
    lead: "CVB Base is CVB Coaching's digital environment for clients in a coaching engagement. These terms apply when you use your CVB Base account.",
    updatedLabel: `Last updated ${formatUpdated(LEGAL_UPDATED_AT, "en")}`,
    tocLabel: "Contents",
    sections: [
      {
        id: "service",
        heading: "The service",
        blocks: [
          p(
            "In CVB Base you can follow your sessions, prepare for conversations, write reflections, keep track of commitments, access material, share material with Carolina and handle contracts. CVB Base is part of the delivery in your coaching engagement and is used together with the ",
            link("general terms", L("terms")),
            " and your individual contract. The CVB Base interface is in Swedish.",
          ),
        ],
      },
      {
        id: "account",
        heading: "Account and login",
        blocks: [
          list(
            "There is no open registration. Your account is created by CVB Coaching when an engagement starts.",
            "The account is personal. You may not let anyone else use it.",
            "You log in with email and password. Keep your password secret and contact us immediately if you suspect that someone else has accessed your account.",
            "You are responsible for what is done with your account, unless it results from CVB Coaching failing in its responsibilities.",
          ),
        ],
      },
      {
        id: "material",
        heading: "Your material — private and shared",
        blocks: [
          p(
            "Information and material are handled according to the sharing and access choices available in the service and as described in the ",
            link("privacy policy", L("privacy")),
            ".",
          ),
          p(
            "You are responsible for what you upload and write. Only upload what you have the right to share, and only share sensitive personal data, such as health information, if you have given the separate consent under Profile. You can remove what you have uploaded yourself where the function is available.",
          ),
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        blocks: [
          p("You may not:"),
          list(
            "try to access other users' data or otherwise circumvent access restrictions,",
            "try to disrupt, overload or damage the service,",
            "upload malicious code or material that infringes someone else's rights or is unlawful,",
            "use the service for anything other than your coaching engagement.",
          ),
          p("In the event of a serious or repeated breach, CVB Coaching may suspend the account."),
        ],
      },
      {
        id: "availability",
        heading: "Availability and maintenance",
        blocks: [
          p(
            "We aim to keep CVB Base available, but cannot guarantee that the service always works without interruption. The service may be temporarily unavailable during planned maintenance, updates or disruptions at our providers. We try to schedule planned maintenance at times when it causes as little disruption as possible.",
          ),
          p(
            "Please keep your own copies of material that is important to you. The content in CVB Base supports the coaching and does not replace your own archive.",
          ),
        ],
      },
      {
        id: "personal-data",
        heading: "Personal data and cookies",
        blocks: [
          p(
            "How your personal data is processed is described in the ",
            link("privacy policy", L("privacy")),
            ". CVB Base only uses strictly necessary cookies, see the ",
            link("cookie policy", L("cookies")),
            ".",
          ),
        ],
      },
      {
        id: "ending",
        heading: "When the engagement ends",
        blocks: [
          p(
            "When the coaching engagement ends, you are marked as a former client. The history then remains, so that the engagement can be resumed. You can request that your data is erased and your account deleted — contact ",
            mail,
            ". Contracts and data that must be kept by law, or are needed for legal claims, are kept for as long as required, as described in the privacy policy.",
          ),
        ],
      },
      {
        id: "liability",
        heading: "Liability",
        blocks: [
          p(
            "CVB Coaching is liable for damage caused by CVB Coaching's negligence in providing the service. Towards a consumer, liability is not limited beyond what mandatory law permits.",
          ),
        ],
      },
      {
        id: "changes",
        heading: "Changes and contact",
        blocks: [
          p(
            "We may update these terms, for example when the service changes. Material changes are announced in good time. Send questions about CVB Base to ",
            mail,
            ". If the Swedish and English versions differ, the Swedish version applies.",
          ),
        ],
      },
    ],
  };
}

export function baseTermsDocument(locale: Locale): LegalDocument {
  return locale === "en" ? en() : sv();
}
