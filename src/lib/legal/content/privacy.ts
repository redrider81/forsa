import type { Locale } from "@/lib/i18n/config";
import { LEGAL_ENTITY, LEGAL_UPDATED_AT, legalPartyName } from "@/lib/legal/company";
import { companyFacts, formatUpdated, link, list, p, type LegalDocument } from "@/lib/legal/document";
import { legalHref } from "@/lib/legal/links";

/**
 * Integritetspolicy — public transparency for clients and website visitors.
 * Describes purposes, legal bases and rights at a level appropriate for legal
 * disclosure, not internal product or system documentation.
 */

const mail = link(LEGAL_ENTITY.legalEmail, `mailto:${LEGAL_ENTITY.legalEmail}`);

function sv(): LegalDocument {
  const L = (key: Parameters<typeof legalHref>[0]) => legalHref(key, "sv");
  return {
    metaTitle: "Integritetspolicy | CVB Coaching",
    metaDescription:
      "Så behandlar CVB Coaching personuppgifter på webbplatsen, vid bokning av ett första samtal och i CVB Base.",
    label: "Integritet",
    title: "Integritetspolicy",
    lead: "Så behandlar CVB Coaching personuppgifter på webbplatsen, när du bokar ett första samtal och i CVB Base — den digitala miljö som används i ett coachingsamarbete.",
    updatedLabel: `Senast uppdaterad ${formatUpdated(LEGAL_UPDATED_AT, "sv")}`,
    tocLabel: "Innehåll",
    sections: [
      {
        id: "ansvarig",
        heading: "Personuppgiftsansvarig",
        blocks: [
          p(
            `Personuppgiftsansvarig för den behandling som beskrivs här är ${legalPartyName()}, som driver ${LEGAL_ENTITY.tradeName}. Frågor om hur dina personuppgifter behandlas, och begäran om att utöva dina rättigheter, skickar du till `,
            mail,
            ".",
          ),
          companyFacts("sv"),
        ],
      },
      {
        id: "i-korthet",
        heading: "I korthet",
        blocks: [
          list(
            "Vi samlar bara in det som behövs för att boka ett första samtal och för att genomföra ett coachingsamarbete.",
            "Webbplatsen använder inga cookies för statistik eller marknadsföring.",
            "I CVB Base ser du din egen coachingmiljö. Åtkomst till uppgifter styrs av ditt konto och dina val i tjänsten.",
            "Vi säljer inte personuppgifter och lämnar inte ut dem för andras marknadsföring.",
          ),
        ],
      },
      {
        id: "kontakt-och-bokning",
        heading: "När du kontaktar oss eller bokar ett första samtal",
        blocks: [
          p("När du bokar ett inledande samtal via webbplatsen behandlar vi:"),
          list(
            "namn, e-postadress och telefonnummer,",
            "företag eller organisation om du anger det,",
            "vilken typ av stöd du är intresserad av och det du själv skriver om din situation — i det utökade formuläret även roll, vilket läge du står i, vad som behöver bli tydligare och när du vill komma vidare,",
            "det tidsfönster du väljer och vilket språk du använde på webbplatsen.",
          ),
          p(
            "Ändamålet är att hantera din förfrågan, boka och genomföra det inledande samtalet, bedöma om ett coachingsamarbete ska inledas och kommunicera med dig om förfrågan. Du får en bekräftelse och senare ett besked via e-post, och Carolina får en notis om förfrågan.",
          ),
          p(
            "Rättslig grund: behandlingen är nödvändig för att vidta åtgärder på din begäran innan ett eventuellt avtal ingås (artikel 6.1 b i dataskyddsförordningen, GDPR). Kontaktar du oss för ett företags eller en organisations räkning behandlar vi dina kontaktuppgifter med stöd av vårt berättigade intresse av att hantera förfrågan (artikel 6.1 f).",
          ),
          p(
            "Mejlar du oss direkt behandlar vi de uppgifter du skickar på samma sätt. Skriv gärna inte känsliga personuppgifter, till exempel om hälsa, i formuläret eller i ett mejl.",
          ),
        ],
      },
      {
        id: "coachingsamarbete",
        heading: "Under ett coachingsamarbete",
        blocks: [
          p("Om vi inleder ett samarbete behandlar vi, beroende på uppdraget:"),
          list(
            "identitets- och kontaktuppgifter, roll och i förekommande fall organisation och uppdragsgivare,",
            "avtal, signaturer (namn, e-post, konto och tidpunkt) och, för konsumenter, uppgifter om ångerrätt,",
            "coachingöverenskommelse och utvecklingsmål,",
            "sessioner — datum, tid, plats, fokus och önskat resultat,",
            "det du själv skriver i CVB Base: förberedelser, reflektioner, åtaganden och noteringar,",
            "sessionssammanfattningar som Carolina har godkänt och delat med dig,",
            "material och dokument som du eller Carolina laddar upp eller delar,",
            "Carolinas egna arbetsanteckningar om samtalen.",
          ),
          p(
            "Ändamålet är att genomföra coachingen, planera och följa upp samtal, dokumentera det ni kommit överens om och administrera avtal och betalning.",
          ),
          p(
            "Rättslig grund: avtalet med dig (artikel 6.1 b). När coachingen beställs och betalas av din arbetsgivare eller en annan uppdragsgivare, och avtalet är med dem, behandlar vi dina uppgifter med stöd av vårt berättigade intresse av att leverera den coaching som beställts (artikel 6.1 f). Uppgifter som måste sparas enligt bokföringslagen behandlas för att uppfylla en rättslig förpliktelse (artikel 6.1 c), och vi kan behöva spara avtal och ångerärenden för att kunna fastställa, göra gällande eller försvara rättsliga anspråk (artikel 6.1 f).",
          ),
        ],
      },
      {
        id: "cvb-base",
        heading: "CVB Base",
        blocks: [
          p(
            "CVB Base har ingen öppen registrering. Konton skapas av CVB Coaching och du loggar in med ditt personliga konto. Som klient ser du din egen coachingmiljö. Carolina har åtkomst till det som behövs för att genomföra coachingen med sina klienter.",
          ),
          p(
            "Information och material hanteras enligt de delnings- och åtkomstval som finns i tjänsten och enligt vad som följer av avtalet och ",
            link("användarvillkoren för CVB Base", L("baseTerms")),
            ". Uppdragsgivare har inget konto i CVB Base. Det som kan återrapporteras till en uppdragsgivare är begränsat till det ni kommit överens om i förväg — inte innehållet i samtalen.",
          ),
        ],
      },
      {
        id: "kansliga-uppgifter",
        heading: "Känsliga personuppgifter",
        blocks: [
          p(
            "Coaching är inte vård eller behandling, och CVB Base har ingen funktion för att samla in känsliga personuppgifter, som uppgifter om hälsa. Fritext — reflektioner, förberedelser, anteckningar och dokument — kan ändå komma att innehålla sådant som du själv väljer att berätta.",
          ),
          p(
            "Sådana uppgifter behandlas med stöd av ditt uttryckliga samtycke (artikel 9.2 a). Samtycket lämnar du separat under Profil i CVB Base. Det är frivilligt, är skilt från avtalet och villkoren, och coachingen kan genomföras utan det — då ber vi dig att inte dela sådana uppgifter. Samtycket omfattar det du själv skriver i CVB Base eller berättar i samtalen och som Carolina dokumenterar. Tidpunkten för när du lämnar och återkallar samtycket registreras och historiken sparas.",
          ),
          p(
            "Du kan när som helst återkalla samtycket under Profil. Från och med återkallelsen behandlar vi inte känsliga personuppgifter med stöd av samtycket: innehåll som omfattas av samtycket begränsas och används inte längre i coachingen. Du kan fortfarande se ditt eget innehåll och under Profil begära att det raderas. Behandling som skett före återkallelsen påverkas inte. Avtal, bokningar och samtyckeshistoriken bygger inte på samtycket och sparas enligt avsnittet om lagring.",
          ),
        ],
      },
      {
        id: "e-post",
        heading: "E-post från tjänsten",
        blocks: [
          p(
            "Tjänsten skickar e-post till dig och till Carolina, till exempel bekräftelse och besked om ditt inledande samtal, avtalsbekräftelse med avtal och villkor när ett konsumentavtal har ingåtts, och mottagningsbevis om du ångrar ett konsumentavtal.",
          ),
        ],
      },
      {
        id: "leverantorer",
        heading: "Leverantörer och överföringar",
        blocks: [
          p("Vi använder personuppgiftsbiträden som behandlar uppgifter för vår räkning, till exempel för:"),
          list(
            "lagring av data, inloggning och fillagring i samband med CVB Base och bokningar — i regel inom EU/EES,",
            "drift av webbplatsen och tekniska serverfunktioner,",
            "utskick av e-post från tjänsten.",
          ),
          p(
            "E-post som skickas till Carolina hanteras också av den e-posttjänst hon använder för sin brevlåda.",
          ),
          p(
            "Vissa leverantörer är etablerade utanför EU/EES, bland annat i USA. Personuppgifter kan därför behandlas i, eller vara åtkomliga från, länder utanför EU/EES, även när lagring sker inom EU. En sådan överföring får bara ske med stöd av EU-kommissionens beslut om adekvat skyddsnivå för certifierade företag enligt EU–US Data Privacy Framework, eller med EU-kommissionens standardavtalsklausuler. Kontakta oss om du vill veta mer om skyddsåtgärderna.",
          ),
        ],
      },
      {
        id: "lagring",
        heading: "Hur länge uppgifterna sparas",
        blocks: [
          list(
            "Förfrågningar om ett första samtal sparas så länge de behövs för att hantera förfrågan och eventuell fortsatt kontakt om ett samarbete.",
            "Innehåll i ett coachingsamarbete sparas under samarbetet. När samarbetet avslutas finns historiken kvar så att samarbetet kan återupptas, om inte du eller vi avslutar kontot eller begär radering enligt nedan.",
            "Material som du själv har laddat upp eller skrivit kan du ta bort i tjänsten när funktionen finns tillgänglig.",
            "Samtyckeshistoriken (när samtycke lämnats och återkallats) och begäranden om radering sparas så länge klientuppgifterna finns kvar, så att det går att visa vad som gällde.",
            "Skickade och signerade avtal, signaturer och uppgifter om utövad ångerrätt sparas så länge det behövs för att kunna fastställa, göra gällande eller försvara rättsliga anspråk, och i den mån de utgör räkenskapsinformation i sju år enligt bokföringslagen.",
            "Inloggningskontot tas bort separat. Kontakta oss om du vill att ditt konto raderas.",
          ),
        ],
      },
      {
        id: "rattigheter",
        heading: "Dina rättigheter",
        blocks: [
          p("Enligt dataskyddsförordningen har du rätt att:"),
          list(
            "få tillgång till de personuppgifter vi behandlar om dig,",
            "få felaktiga uppgifter rättade — kontaktuppgifter kan du också ändra själv under Profil i CVB Base,",
            "få uppgifter raderade, om de inte måste sparas enligt lag eller behövs för rättsliga anspråk,",
            "begära att behandlingen begränsas,",
            "invända mot behandling som grundar sig på berättigat intresse,",
            "få ut de uppgifter du själv har lämnat i ett strukturerat, maskinläsbart format (dataportabilitet), när behandlingen grundar sig på avtal.",
          ),
          p(
            "Behandlingen av känsliga personuppgifter bygger på ditt uttryckliga samtycke, som du kan återkalla när som helst under Profil i CVB Base. Återkallelsen påverkar inte behandling som skett innan. Övrig behandling som beskrivs här bygger inte på samtycke.",
          ),
          p("Kontakta ", mail, " för att utöva dina rättigheter."),
          p(
            "Du har också rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY), ",
            link("imy.se", "https://www.imy.se"),
            ".",
          ),
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        blocks: [
          p(
            "Webbplatsen använder bara tekniskt nödvändiga cookies för inloggning i CVB Base. Läs mer i ",
            link("cookiepolicyn", L("cookies")),
            ".",
          ),
        ],
      },
      {
        id: "andringar",
        heading: "Ändringar",
        blocks: [
          p(
            "Vi uppdaterar policyn när behandlingen ändras. Datumet högst upp visar när den senast ändrades. Se även ",
            link("allmänna villkor", L("terms")),
            " och ",
            link("användarvillkor för CVB Base", L("baseTerms")),
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
    metaTitle: "Privacy policy | CVB Coaching",
    metaDescription:
      "How CVB Coaching processes personal data on the website, when you book a first conversation and in CVB Base.",
    label: "Privacy",
    title: "Privacy policy",
    lead: "How CVB Coaching processes personal data on the website, when you book a first conversation and in CVB Base — the digital environment used in a coaching engagement.",
    updatedLabel: `Last updated ${formatUpdated(LEGAL_UPDATED_AT, "en")}`,
    tocLabel: "Contents",
    sections: [
      {
        id: "controller",
        heading: "Controller",
        blocks: [
          p(
            `The controller for the processing described here is ${legalPartyName()}, who runs ${LEGAL_ENTITY.tradeName}. Send questions about how your personal data is processed, and requests to exercise your rights, to `,
            mail,
            ".",
          ),
          companyFacts("en"),
        ],
      },
      {
        id: "summary",
        heading: "In brief",
        blocks: [
          list(
            "We only collect what is needed to book a first conversation and to carry out a coaching engagement.",
            "The website uses no cookies for statistics or marketing.",
            "In CVB Base you see your own coaching environment. Access to data is governed by your account and your choices in the service.",
            "We do not sell personal data or disclose it for others' marketing.",
          ),
        ],
      },
      {
        id: "contact-and-booking",
        heading: "When you contact us or book a first conversation",
        blocks: [
          p("When you book an introductory conversation on the website, we process:"),
          list(
            "your name, email address and phone number,",
            "your company or organisation if you provide it,",
            "the type of support you are interested in and what you write about your situation — in the extended form also your role, the situation you are in, what needs to become clearer and when you want to move forward,",
            "the time window you choose and the language you used on the website.",
          ),
          p(
            "The purpose is to handle your request, book and hold the introductory conversation, assess whether to start a coaching engagement and communicate with you about the request. You receive a confirmation and later a reply by email, and Carolina receives a notification about the request.",
          ),
          p(
            "Legal basis: the processing is necessary to take steps at your request before any contract is entered into (Article 6(1)(b) of the General Data Protection Regulation, GDPR). If you contact us on behalf of a company or organisation, we process your contact details on the basis of our legitimate interest in handling the request (Article 6(1)(f)).",
          ),
          p(
            "If you email us directly, we process what you send in the same way. Please do not write sensitive personal data, such as health information, in the form or in an email.",
          ),
        ],
      },
      {
        id: "coaching-engagement",
        heading: "During a coaching engagement",
        blocks: [
          p("If we start an engagement, we process, depending on the assignment:"),
          list(
            "identity and contact details, role and, where relevant, organisation and commissioning client,",
            "contracts, signatures (name, email, account and time) and, for consumers, information about the right of withdrawal,",
            "the coaching agreement and development goals,",
            "sessions — date, time, place, focus and desired outcome,",
            "what you write yourself in CVB Base: preparations, reflections, commitments and notes,",
            "session summaries that Carolina has approved and shared with you,",
            "material and documents that you or Carolina upload or share,",
            "Carolina's own working notes about the conversations.",
          ),
          p(
            "The purpose is to deliver the coaching, plan and follow up conversations, document what you have agreed and administer contracts and payment.",
          ),
          p(
            "Legal basis: the contract with you (Article 6(1)(b)). When the coaching is ordered and paid for by your employer or another commissioning client, and the contract is with them, we process your data on the basis of our legitimate interest in delivering the coaching that has been ordered (Article 6(1)(f)). Data that must be kept under the Swedish Bookkeeping Act is processed to comply with a legal obligation (Article 6(1)(c)), and we may need to keep contracts and withdrawal records to establish, exercise or defend legal claims (Article 6(1)(f)).",
          ),
        ],
      },
      {
        id: "cvb-base",
        heading: "CVB Base",
        blocks: [
          p(
            "CVB Base has no open registration. Accounts are created by CVB Coaching and you log in with your personal account. As a client you see your own coaching environment. Carolina has access to what she needs to deliver coaching to her clients.",
          ),
          p(
            "Information and material are handled according to the sharing and access choices available in the service and as follows from the contract and the ",
            link("CVB Base terms of use", L("baseTerms")),
            ". Commissioning clients have no account in CVB Base. What may be reported to a commissioning client is limited to what has been agreed in advance — not the content of the conversations.",
          ),
        ],
      },
      {
        id: "sensitive-data",
        heading: "Sensitive personal data",
        blocks: [
          p(
            "Coaching is not healthcare or treatment, and CVB Base has no function for collecting sensitive personal data such as health information. Free text — reflections, preparations, notes and documents — may still contain things you choose to share.",
          ),
          p(
            "Such data is processed on the basis of your explicit consent (Article 9(2)(a)). You give this consent separately under Profile in CVB Base. It is voluntary, separate from the contract and the terms, and the coaching can be carried out without it — in that case we ask you not to share such data. The consent covers what you write yourself in CVB Base or say in the conversations and Carolina documents. The times you give and withdraw consent are recorded and the history is kept.",
          ),
          p(
            "You can withdraw the consent at any time under Profile. From the withdrawal onwards, we do not process sensitive personal data on the basis of the consent: content covered by the consent is restricted and no longer used in the coaching. You can still see your own content and request its erasure under Profile. Processing that took place before the withdrawal is not affected. Contracts, bookings and the consent history are not based on the consent and are kept as described in the section on retention.",
          ),
        ],
      },
      {
        id: "email",
        heading: "Email from the service",
        blocks: [
          p(
            "The service sends email to you and to Carolina, for example confirmation of and reply to your introductory conversation, a contract confirmation with the contract and terms when a consumer contract has been concluded, and an acknowledgement of receipt if you withdraw from a consumer contract.",
          ),
        ],
      },
      {
        id: "processors",
        heading: "Providers and transfers",
        blocks: [
          p("We use processors that process personal data on our behalf, for example for:"),
          list(
            "storage of data, login and file storage in connection with CVB Base and bookings — generally within the EU/EEA,",
            "hosting of the website and technical server functions,",
            "sending email from the service.",
          ),
          p("Email sent to Carolina is also handled by the email service she uses for her mailbox."),
          p(
            "Some providers are established outside the EU/EEA, including in the United States. Personal data may therefore be processed in, or be accessible from, countries outside the EU/EEA, even when storage is within the EU. Such a transfer may only take place on the basis of the European Commission's adequacy decision for companies certified under the EU–US Data Privacy Framework, or with the European Commission's standard contractual clauses. Contact us if you would like to know more about the safeguards.",
          ),
        ],
      },
      {
        id: "retention",
        heading: "How long data is kept",
        blocks: [
          list(
            "Requests for a first conversation are kept for as long as they are needed to handle the request and any further contact about an engagement.",
            "Content in a coaching engagement is kept during the engagement. When it ends, the history remains so that the engagement can be resumed, unless you or we close the account or request erasure as described below.",
            "Material you have uploaded or written yourself can be removed in the service where the function is available.",
            "The consent history (when consent was given and withdrawn) and erasure requests are kept for as long as the client record exists, so that it can be shown what applied.",
            "Sent and signed contracts, signatures and records of exercised withdrawal rights are kept for as long as needed to establish, exercise or defend legal claims, and to the extent they are accounting records for seven years under the Swedish Bookkeeping Act.",
            "The login account is removed separately. Contact us if you want your account deleted.",
          ),
        ],
      },
      {
        id: "rights",
        heading: "Your rights",
        blocks: [
          p("Under the GDPR you have the right to:"),
          list(
            "access the personal data we process about you,",
            "have inaccurate data rectified — you can also change your contact details yourself under Profile in CVB Base,",
            "have data erased, unless it must be kept by law or is needed for legal claims,",
            "request restriction of processing,",
            "object to processing based on legitimate interest,",
            "receive the data you have provided in a structured, machine-readable format (data portability), where the processing is based on a contract.",
          ),
          p(
            "The processing of sensitive personal data is based on your explicit consent, which you can withdraw at any time under Profile in CVB Base. Withdrawal does not affect processing that took place before. Other processing described here is not based on consent.",
          ),
          p("Contact ", mail, " to exercise your rights."),
          p(
            "You also have the right to lodge a complaint with the Swedish Authority for Privacy Protection (Integritetsskyddsmyndigheten, IMY), ",
            link("imy.se", "https://www.imy.se"),
            ".",
          ),
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        blocks: [
          p(
            "The website only uses strictly necessary cookies for logging in to CVB Base. Read more in the ",
            link("cookie policy", L("cookies")),
            ".",
          ),
        ],
      },
      {
        id: "changes",
        heading: "Changes",
        blocks: [
          p(
            "We update this policy when the processing changes. The date at the top shows when it was last changed. See also the ",
            link("general terms", L("terms")),
            " and the ",
            link("CVB Base terms of use", L("baseTerms")),
            ". If the Swedish and English versions differ, the Swedish version applies.",
          ),
        ],
      },
    ],
  };
}

export function privacyDocument(locale: Locale): LegalDocument {
  return locale === "en" ? en() : sv();
}
