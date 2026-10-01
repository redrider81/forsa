import type { Locale } from "@/lib/i18n/config";
import { LEGAL_ENTITY, LEGAL_UPDATED_AT, legalPartyName } from "@/lib/legal/company";
import { companyFacts, formatUpdated, link, list, p, type LegalDocument } from "@/lib/legal/document";
import { legalHref } from "@/lib/legal/links";

/**
 * Integritetspolicy. Describes the implementation as audited on 2026-09-30:
 * what the booking form stores, the CVB Base access model (RLS), exactly
 * what the AI functions send to OpenAI, the email outbox, cookies and the
 * existing end/delete lifecycle. Change the text when the code changes.
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
            "I CVB Base ser du bara din egen miljö. Carolina har bara åtkomst till sina egna klienter.",
            "Material som du markerar som privat i CVB Base syns bara för dig.",
            "CVB Base innehåller AI-stöd som Carolina använder i sitt arbete. AI-stödet fattar inga beslut om dig.",
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
        heading: "Hur åtkomsten är uppdelad i CVB Base",
        blocks: [
          p(
            "CVB Base har ingen öppen registrering. Konton skapas av CVB Coaching och du loggar in med ditt personliga konto. Åtkomsten styrs i databasen, med behörighetsregler på radnivå, och inte bara i gränssnittet:",
          ),
          list(
            "Som klient ser du bara din egen coachingmiljö — aldrig andra klienters.",
            "Carolina har bara åtkomst till de klienter hon själv arbetar med.",
            "Material du markerar som privat syns bara för dig. Det når inte Carolina och ingår inte i något AI-underlag.",
            "Material du delar med Carolina syns för Carolina. Det du skriver som förberedelse, reflektion eller notering syns för Carolina om du skrev det medan du hade ett aktivt samtycke till behandling av känsliga personuppgifter. Utan aktivt samtycke hålls det privat för dig — även om du lämnar samtycke senare.",
            "Carolinas arbetsanteckningar lagras separat och visas aldrig för dig eller för en uppdragsgivare.",
            "Uppdragsgivare har inget konto i CVB Base. Det som kan återrapporteras till en uppdragsgivare är begränsat till det ni kommit överens om i förväg, till exempel deltagande, antal genomförda sessioner och övergripande status — inte innehållet i samtalen.",
          ),
          p(
            "Inget system kan vara helt säkert, men åtkomststyrningen, rollseparationen och att AI-anrop bara görs från servern är konkreta skydd som finns i tjänsten.",
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
            "Du kan när som helst återkalla samtycket under Profil. Från och med återkallelsen behandlar vi inte känsliga personuppgifter med stöd av samtycket: inget samtalsinnehåll ingår i AI-stödet, och det innehåll du har lämnat fram till återkallelsen — reflektioner, förberedelser, noteringar, åtaganden, insikter, sessionernas innehåll, sammanfattningar och Carolinas anteckningar — begränsas och används inte längre i coachingen. Du kan fortfarande se ditt eget innehåll och under Profil begära att det raderas. Behandling som skett före återkallelsen påverkas inte. Avtal, bokningar och samtyckeshistoriken bygger inte på samtycket och sparas enligt avsnittet om lagring.",
          ),
        ],
      },
      {
        id: "ai",
        heading: "AI-stöd i CVB Base",
        blocks: [
          p(
            "CVB Base innehåller AI-funktioner. De används bara av Carolina, som stöd i hennes eget arbete, och du som klient använder dem inte. Funktionerna kan:",
          ),
          list(
            "sammanställa ett underlag inför nästa session med en klient,",
            "besvara Carolinas frågor om en viss klient,",
            "strukturera Carolinas anteckningar från ett samtal till ett utkast till sessionssammanfattning,",
            "besvara frågor om ett uppdrag på organisationsnivå.",
          ),
          p(
            "När en funktion om en klient används skickas ett underlag som bara gäller den klienten: namn, roll, organisation och uppdrag, coachingöverenskommelse, utvecklingsmål, sessionernas fokus och önskade resultat, godkända sessionssammanfattningar, klientens förberedelse, reflektioner, insikter, åtaganden och noteringar, titlar på delade dokument samt Carolinas egna arbetsanteckningar. Vid utkast till sessionssammanfattning skickas också de anteckningar Carolina skriver från samtalet.",
          ),
          p(
            "Samtalsinnehållet — sessionernas fokus och innehåll, sammanfattningar, förberedelser, reflektioner, insikter, åtaganden, noteringar och Carolinas arbetsanteckningar — ingår bara om klienten har ett aktivt samtycke till behandling av känsliga personuppgifter. Utan samtycke, eller efter att samtycket återkallats, skickas bara ramen: namn, roll, organisation och uppdrag, coachingöverenskommelse, utvecklingsmålets rubrik och kriterier, sessionsdatum och dokumenttitlar, och funktionen för utkast till sessionssammanfattning används inte. Spärren gäller hela datakällor; ingen text klassificeras automatiskt.",
          ),
          p(
            "Material och filer — varken privata eller delade — ingår inte i underlaget. Funktionen på organisationsnivå får deltagarnas namn och roller, antal genomförda och bokade sessioner, milstolpar och dokument på uppdragsnivå, men inga reflektioner, sammanfattningar eller anteckningar.",
          ),
          p(
            "Underlaget byggs på servern, avgränsat till den klient eller det uppdrag som är öppet, och skickas till OpenAI. Anropen görs med inställningen att OpenAI inte ska spara svaren för senare hämtning. Enligt OpenAI:s villkor för API-tjänsten används data från sådana anrop inte för att träna OpenAI:s modeller som standard, men OpenAI kan spara data under en begränsad tid för att upptäcka och förhindra missbruk.",
          ),
          p(
            "AI-resultat visas bara för Carolina och publiceras aldrig automatiskt för dig eller för någon annan. Ett utkast till sessionssammanfattning delas med dig först när Carolina har granskat, redigerat och godkänt det. Carolina kan välja att skicka en sammanställning till sin egen e-post. AI-stödet används inte för automatiserade beslut som har rättsliga följder för dig eller påverkar dig på liknande sätt.",
          ),
          p(
            "Rättslig grund: vårt berättigade intresse av att Carolina ska kunna förbereda och strukturera coachingen effektivt (artikel 6.1 f). Du kan invända mot behandlingen — då använder Carolina inte AI-funktionerna för ditt coachingsamarbete.",
          ),
        ],
      },
      {
        id: "e-post",
        heading: "E-post från tjänsten",
        blocks: [
          p(
            "Tjänsten skickar e-post via en e-postleverantör: bekräftelse och besked om ditt inledande samtal, notiser till Carolina, en avtalsbekräftelse med hela avtalet och villkoren när ett konsumentavtal har ingåtts och, om du ångrar ett konsumentavtal, ett mottagningsbevis. Tjänsten sparar en logg över om varje utskick lyckades, så att misslyckade utskick kan skickas om.",
          ),
        ],
      },
      {
        id: "leverantorer",
        heading: "Leverantörer och överföringar",
        blocks: [
          p("Vi använder följande leverantörer, som behandlar personuppgifter för vår räkning:"),
          list(
            "Supabase — databas, inloggning och fillagring för CVB Base och bokningar. Databasen och filerna lagras inom EU (Frankfurt, Tyskland).",
            "Vercel — drift av webbplatsen och serverfunktionerna. Behandlar till exempel IP-adresser och tekniska loggar när du använder webbplatsen.",
            "OpenAI — AI-funktionerna i CVB Base, enligt avsnittet om AI-stöd.",
            "Resend — utskick av e-post från tjänsten.",
          ),
          p(
            "E-post som skickas till Carolina hanteras också av den e-posttjänst hon använder för sin brevlåda.",
          ),
          p(
            "Supabase, Vercel, OpenAI och Resend är amerikanska företag. Personuppgifter kan därför behandlas i, eller vara åtkomliga från, USA eller andra länder utanför EU/EES, även när lagringen sker inom EU. En sådan överföring får bara ske med stöd av EU-kommissionens beslut om adekvat skyddsnivå för företag som är certifierade enligt EU–US Data Privacy Framework, eller med EU-kommissionens standardavtalsklausuler. Kontakta oss om du vill veta mer om skyddsåtgärderna.",
          ),
        ],
      },
      {
        id: "lagring",
        heading: "Hur länge uppgifterna sparas",
        blocks: [
          list(
            "Förfrågningar om ett första samtal sparas så länge de behövs för att hantera förfrågan och eventuell fortsatt kontakt om ett samarbete.",
            "Innehåll i ett coachingsamarbete sparas under samarbetet. När samarbetet avslutas markeras du som avslutad klient och historiken finns kvar, så att samarbetet kan återupptas. Carolina kan radera en avslutad klient permanent, och du kan när som helst begära radering.",
            "Material som du själv har laddat upp eller skrivit tas bort när du raderar det.",
            "Samtyckeshistoriken (när samtycke lämnats och återkallats) och begäranden om radering sparas så länge klientuppgifterna finns kvar, även efter att innehåll raderats, så att det går att visa vad som gällde.",
            "Skickade och signerade avtal, signaturer och uppgifter om utövad ångerrätt sparas så länge det behövs för att kunna fastställa, göra gällande eller försvara rättsliga anspråk, och i den mån de utgör räkenskapsinformation i sju år enligt bokföringslagen. CVB Base hindrar därför permanent radering av en klient som har sådana avtal.",
            "Inloggningskontot (e-postadress och inloggningsuppgifter) tas bort separat. Kontakta oss om du vill att ditt konto raderas.",
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
            "invända mot behandling som grundar sig på berättigat intresse, till exempel AI-stödet,",
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
            "In CVB Base you only see your own environment. Carolina only has access to her own clients.",
            "Material you mark as private in CVB Base is visible only to you.",
            "CVB Base contains AI support that Carolina uses in her work. The AI support does not make decisions about you.",
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
        heading: "How access is divided in CVB Base",
        blocks: [
          p(
            "CVB Base has no open registration. Accounts are created by CVB Coaching and you log in with your personal account. Access is enforced in the database, with row-level access rules, and not only in the interface:",
          ),
          list(
            "As a client you only see your own coaching environment — never other clients'.",
            "Carolina only has access to the clients she works with herself.",
            "Material you mark as private is visible only to you. It does not reach Carolina and is not part of any AI input.",
            "Material you share with Carolina is visible to Carolina. What you write as preparation, reflection or note is visible to Carolina if you wrote it while you had active consent to the processing of sensitive personal data. Without active consent it is kept private to you — even if you give consent later.",
            "Carolina's working notes are stored separately and are never shown to you or to a commissioning client.",
            "Commissioning clients have no account in CVB Base. What may be reported to a commissioning client is limited to what has been agreed in advance, for example participation, number of completed sessions and overall status — not the content of the conversations.",
          ),
          p(
            "No system can be completely secure, but the access control, the role separation and the fact that AI calls are only made from the server are concrete safeguards in the service.",
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
            "You can withdraw the consent at any time under Profile. From the withdrawal onwards, we do not process sensitive personal data on the basis of the consent: no conversation content is included in the AI support, and the content you have provided up to the withdrawal — reflections, preparations, notes, commitments, insights, session content, summaries and Carolina's notes — is restricted and no longer used in the coaching. You can still see your own content and request its erasure under Profile. Processing that took place before the withdrawal is not affected. Contracts, bookings and the consent history are not based on the consent and are kept as described in the section on retention.",
          ),
        ],
      },
      {
        id: "ai",
        heading: "AI support in CVB Base",
        blocks: [
          p(
            "CVB Base contains AI functions. They are used only by Carolina, as support in her own work; as a client you do not use them. The functions can:",
          ),
          list(
            "compile preparation material ahead of the next session with a client,",
            "answer Carolina's questions about a specific client,",
            "structure Carolina's notes from a conversation into a draft session summary,",
            "answer questions about an engagement at organisation level.",
          ),
          p(
            "When a client function is used, input concerning only that client is sent: name, role, organisation and engagement, coaching agreement, development goals, the sessions' focus and desired outcomes, approved session summaries, the client's preparation, reflections, insights, commitments and notes, titles of shared documents and Carolina's own working notes. For a draft session summary, the notes Carolina writes from the conversation are also sent.",
          ),
          p(
            "The conversation content — the sessions' focus and content, summaries, preparations, reflections, insights, commitments, notes and Carolina's working notes — is included only if the client has active consent to the processing of sensitive personal data. Without consent, or after the consent has been withdrawn, only the framework is sent: name, role, organisation and engagement, coaching agreement, the development goal's heading and criteria, session dates and document titles, and the draft session summary function is not used. The gate applies to whole data sources; no text is classified automatically.",
          ),
          p(
            "Material and files — neither private nor shared — are not part of the input. The organisation-level function receives participants' names and roles, the number of completed and booked sessions, milestones and engagement-level documents, but no reflections, summaries or notes.",
          ),
          p(
            "The input is built on the server, limited to the client or engagement that is open, and sent to OpenAI. The calls are made with the setting that OpenAI should not store the responses for later retrieval. Under OpenAI's terms for the API service, data from such calls is not used to train OpenAI's models by default, but OpenAI may retain data for a limited time to detect and prevent abuse.",
          ),
          p(
            "AI results are shown only to Carolina and are never published automatically to you or anyone else. A draft session summary is shared with you only after Carolina has reviewed, edited and approved it. Carolina may choose to send a compilation to her own email. The AI support is not used for automated decisions that produce legal effects concerning you or similarly affect you.",
          ),
          p(
            "Legal basis: our legitimate interest in Carolina being able to prepare and structure the coaching effectively (Article 6(1)(f)). You can object to the processing — Carolina will then not use the AI functions for your coaching engagement.",
          ),
        ],
      },
      {
        id: "email",
        heading: "Email from the service",
        blocks: [
          p(
            "The service sends email through an email provider: confirmation of and reply to your introductory conversation, notifications to Carolina, a contract confirmation containing the full contract and terms when a consumer contract has been concluded and, if you withdraw from a consumer contract, an acknowledgement of receipt. The service keeps a log of whether each message was sent, so that failed messages can be resent.",
          ),
        ],
      },
      {
        id: "processors",
        heading: "Providers and transfers",
        blocks: [
          p("We use the following providers, which process personal data on our behalf:"),
          list(
            "Supabase — database, login and file storage for CVB Base and bookings. The database and files are stored within the EU (Frankfurt, Germany).",
            "Vercel — hosting of the website and the server functions. Processes, for example, IP addresses and technical logs when you use the website.",
            "OpenAI — the AI functions in CVB Base, as described in the section on AI support.",
            "Resend — sending email from the service.",
          ),
          p("Email sent to Carolina is also handled by the email service she uses for her mailbox."),
          p(
            "Supabase, Vercel, OpenAI and Resend are US companies. Personal data may therefore be processed in, or be accessible from, the United States or other countries outside the EU/EEA, even when it is stored within the EU. Such a transfer may only take place on the basis of the European Commission's adequacy decision for companies certified under the EU–US Data Privacy Framework, or with the European Commission's standard contractual clauses. Contact us if you would like to know more about the safeguards.",
          ),
        ],
      },
      {
        id: "retention",
        heading: "How long data is kept",
        blocks: [
          list(
            "Requests for a first conversation are kept for as long as they are needed to handle the request and any further contact about an engagement.",
            "Content in a coaching engagement is kept during the engagement. When it ends, you are marked as a former client and the history remains, so that the engagement can be resumed. Carolina can permanently delete a former client, and you can request erasure at any time.",
            "Material you have uploaded or written yourself is removed when you delete it.",
            "The consent history (when consent was given and withdrawn) and erasure requests are kept for as long as the client record exists, even after content has been erased, so that it can be shown what applied.",
            "Sent and signed contracts, signatures and records of exercised withdrawal rights are kept for as long as needed to establish, exercise or defend legal claims, and to the extent they are accounting records for seven years under the Swedish Bookkeeping Act. CVB Base therefore prevents permanent deletion of a client who has such contracts.",
            "The login account (email address and login credentials) is removed separately. Contact us if you want your account deleted.",
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
            "object to processing based on legitimate interest, for example the AI support,",
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
