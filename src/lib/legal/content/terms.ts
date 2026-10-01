import type { Locale } from "@/lib/i18n/config";
import { formattedPostalAddress, LEGAL_ENTITY, LEGAL_UPDATED_AT, legalPartyName } from "@/lib/legal/company";
import { companyFacts, formatUpdated, link, list, p, type LegalDocument } from "@/lib/legal/document";
import { legalHref } from "@/lib/legal/links";
import { isGeneralTermsVersion, type GeneralTermsVersion } from "@/lib/legal/terms-versions";

/**
 * Allmänna villkor för CVB Coaching. They complement the individual
 * contract and never restrict mandatory consumer protection. The withdrawal
 * section mirrors the implemented ångerfunktion in CVB Base.
 */

const mail = link(LEGAL_ENTITY.legalEmail, `mailto:${LEGAL_ENTITY.legalEmail}`);

function sv(): LegalDocument {
  const L = (key: Parameters<typeof legalHref>[0]) => legalHref(key, "sv");
  return {
    metaTitle: "Allmänna villkor | CVB Coaching",
    metaDescription:
      "Allmänna villkor för coaching hos CVB Coaching: avtal, coachingens natur, sekretess, pris, avbokning, ångerrätt och tvister.",
    label: "Villkor",
    title: "Allmänna villkor för coaching",
    lead: "Villkoren gäller coachingtjänster från CVB Coaching. De kompletterar det individuella coachingavtalet, som anger det som är specifikt för ert samarbete.",
    updatedLabel: `Senast uppdaterad ${formatUpdated(LEGAL_UPDATED_AT, "sv")}`,
    tocLabel: "Innehåll",
    sections: [
      {
        id: "tillampning",
        heading: "Tillämpning",
        blocks: [
          p(
            "Villkoren gäller när CVB Coaching levererar coaching till en privatperson eller till ett företag eller en organisation. Det individuella avtalet kan komplettera villkoren, till exempel med pris, antal sessioner, intervall, särskilda sekretessregler och leveransvillkor. Om det individuella avtalet och villkoren skiljer sig åt gäller det individuella avtalet.",
          ),
          p(
            "Villkoren begränsar aldrig de rättigheter du har som konsument enligt tvingande lag, till exempel konsumenttjänstlagen och lagen om distansavtal och avtal utanför affärslokaler.",
          ),
        ],
      },
      {
        id: "parter",
        heading: "Parter",
        blocks: [
          companyFacts("sv"),
          p(
            `Avtalspart för CVB Coachings tjänster är ${legalPartyName()}. När villkoren talar om CVB Coaching avses den avtalsparten.`,
          ),
          p(
            "Klient är den person som får coaching. Uppdragsgivare är ett företag eller en organisation som beställer och betalar coaching för en eller flera klienter. Avtalspart är antingen klienten själv eller uppdragsgivaren — det framgår av det individuella avtalet.",
          ),
        ],
      },
      {
        id: "avtal",
        heading: "När avtal uppstår",
        blocks: [
          p(
            "Det inledande samtalet är kostnadsfritt och förpliktar ingen av parterna. Ett coachingavtal uppstår först när det individuella avtalet har godkänts av båda parter. När avtalet ingås i CVB Base uppstår det när både klienten och CVB Coaching har signerat. I CVB Base anges också om avtalet är ett konsumentavtal eller ett företagsavtal.",
          ),
        ],
      },
      {
        id: "coachingens-natur",
        heading: "Coachingens natur",
        blocks: [
          p(
            "Coaching är en samtalsbaserad process som stödjer klienten i att klargöra mål, se sin situation tydligare och själv komma fram till beslut och handlingar.",
          ),
          p(
            "Coaching är inte medicinsk behandling, psykoterapi eller annan psykologisk behandling, och inte heller juridisk, finansiell eller annan professionell rådgivning. Om det framkommer att klienten behöver sådant stöd kan Carolina rekommendera att klienten vänder sig till rätt instans, och samarbetet kan då pausas.",
          ),
        ],
      },
      {
        id: "ansvar-i-processen",
        heading: "Klientens och coachens ansvar",
        blocks: [
          p(
            "Klienten ansvarar för sina egna beslut och handlingar, både under och efter coachingen, och för att delta aktivt i samtalen.",
          ),
          p(
            "CVB Coaching ansvarar för att genomföra coachingprocessen professionellt, med omsorg och i enlighet med vedertagna etiska riktlinjer för coaching.",
          ),
        ],
      },
      {
        id: "sekretess",
        heading: "Sekretess",
        blocks: [
          p(
            "Det som kommer fram i samtalen behandlas konfidentiellt. CVB Coaching lämnar inte ut innehållet till någon annan, inklusive en uppdragsgivare, utan klientens samtycke. Undantag gäller om CVB Coaching är skyldig att lämna ut uppgifter enligt lag eller myndighetsbeslut, eller om det finns en allvarlig risk för någons liv eller hälsa.",
          ),
        ],
      },
      {
        id: "foretagsfinansierad",
        heading: "Coaching som betalas av en uppdragsgivare",
        blocks: [
          p(
            "När en uppdragsgivare betalar är klienten fortfarande den person coachingen är till för. Vad som återrapporteras till uppdragsgivaren bestäms i förväg och begränsas till det som överenskommits, till exempel deltagande, antal genomförda sessioner och övergripande status. Innehållet i samtalen, klientens reflektioner och coachens anteckningar delas inte med uppdragsgivaren.",
          ),
        ],
      },
      {
        id: "pris",
        heading: "Pris och betalning",
        blocks: [
          p(
            "Pris och betalningsvillkor framgår av det individuella avtalet. Pris som anges till en konsument är det totala priset, inklusive moms om moms ska betalas. Vid försenad betalning får dröjsmålsränta tas ut enligt räntelagen.",
          ),
        ],
      },
      {
        id: "bokning",
        heading: "Bokning, ombokning och avbokning",
        blocks: [
          p(
            "Sessioner bokas via CVB Base eller i direkt kontakt med Carolina. Behöver du boka om eller avboka, gör det så snart som möjligt via CVB Base eller genom att kontakta Carolina.",
          ),
          p(
            "Om det individuella avtalet anger en tidsgräns för avbokning och vad som gäller vid sen avbokning eller uteblivet besök, gäller det. Reglerar det individuella avtalet inte detta tas ingen avgift ut för en avbokad session. Om CVB Coaching behöver ställa in en session erbjuds en ny tid utan extra kostnad.",
          ),
        ],
      },
      {
        id: "uppsagning",
        heading: "Uppsägning",
        blocks: [
          p(
            "Avtalstid och uppsägning framgår av det individuella avtalet. Anger det inget annat kan klienten avsluta samarbetet när som helst, och betalar då för det som har utförts fram till dess. Båda parter får säga upp avtalet med omedelbar verkan om den andra parten väsentligt bryter mot avtalet.",
          ),
        ],
      },
      {
        id: "angerratt",
        heading: "Ångerrätt för konsumenter",
        blocks: [
          p(
            "Om du är konsument och ingår avtalet på distans — till exempel genom att signera i CVB Base — har du enligt lagen (2005:59) om distansavtal och avtal utanför affärslokaler rätt att ångra avtalet inom 14 dagar från den dag avtalet ingicks. I CVB Base ingås avtalet när både du och CVB Coaching har signerat. Infaller fristens sista dag på en lördag, söndag eller helgdag förlängs den till nästa vardag. Du kan ångra dig redan från att du själv har signerat.",
          ),
          p("Så ångrar du avtalet:"),
          list(
            "i CVB Base: öppna avtalet under Avtal och välj Ångra avtalet här, eller",
            ["genom att mejla ", mail, " ett tydligt meddelande om att du ångrar avtalet. Du kan använda standardformuläret nedan, men det är inte obligatoriskt."],
          ),
          p(
            "När du ångrar dig i CVB Base registreras tidpunkten direkt och du får ett mottagningsbevis via e-post. Det räcker att du skickar ditt meddelande innan ångerfristen har löpt ut.",
          ),
          p(
            "Om du uttryckligen har begärt att coachingen ska påbörjas under ångerfristen och sedan ångrar dig, betalar du för den del av tjänsten som har utförts fram till dess, i proportion till det avtalade priset. Har tjänsten utförts helt, efter din uttryckliga begäran och med din insikt om att ångerrätten då upphör, har du ingen ångerrätt kvar. Att en session har ägt rum betyder inte i sig att ångerrätten har upphört.",
          ),
          p("Ångerrätten gäller inte avtal som ingås av ett företag eller en organisation."),
        ],
      },
      {
        id: "standardformular",
        heading: "Standardformulär för utövande av ångerrätt",
        blocks: [
          p("Fyll i och skicka detta formulär endast om du vill frånträda avtalet."),
          list(
            ["Till: ", `${legalPartyName()} (${LEGAL_ENTITY.tradeName}), ${formattedPostalAddress()}, `, mail],
            "Jag meddelar härmed att jag frånträder mitt avtal om köp av följande tjänster: …",
            "Beställd den / mottagen den: …",
            "Konsumentens namn: …",
            "Konsumentens adress: …",
            "Konsumentens underskrift (endast om formuläret skickas i pappersform): …",
            "Datum: …",
          ),
        ],
      },
      {
        id: "immateriella-rattigheter",
        heading: "Material och immateriella rättigheter",
        blocks: [
          p(
            "Material som CVB Coaching tar fram eller delar — till exempel övningar, underlag och mallar — tillhör CVB Coaching. Klienten får använda det för sin egen utveckling men inte sprida det vidare eller använda det kommersiellt.",
          ),
          p(
            "Det klienten själv skriver eller laddar upp tillhör klienten. CVB Coaching använder det bara för att genomföra coachingen.",
          ),
        ],
      },
      {
        id: "cvb-base",
        heading: "CVB Base",
        blocks: [
          p(
            "När coachingen omfattar CVB Base är tjänsten en del av leveransen. Användningen regleras i ",
            link("användarvillkoren för CVB Base", L("baseTerms")),
            ".",
          ),
        ],
      },
      {
        id: "personuppgifter",
        heading: "Personuppgifter och AI-stöd",
        blocks: [
          p(
            "Hur personuppgifter behandlas beskrivs i ",
            link("integritetspolicyn", L("privacy")),
            ". Carolina kan använda AI-stödet i CVB Base för att förbereda och strukturera sitt arbete, enligt vad som beskrivs där. AI-stödet fattar inga beslut; coachingen genomförs av Carolina.",
          ),
        ],
      },
      {
        id: "ansvar",
        heading: "Ansvar",
        blocks: [
          p(
            "CVB Coaching ansvarar för skada som orsakas genom att CVB Coaching varit försumlig. CVB Coaching ansvarar inte för klientens egna beslut eller för följderna av dem.",
          ),
          p(
            "Mot en konsument begränsas inte ansvaret utöver vad tvingande lag tillåter. Mot ett företag eller en organisation är ansvaret begränsat till det pris som betalats för uppdraget och omfattar inte indirekt skada, utom vid uppsåt eller grov vårdslöshet.",
          ),
          p(
            "Ingen part ansvarar för förseningar eller hinder som beror på omständigheter utanför partens kontroll och som parten inte skäligen kunnat förutse eller undvika.",
          ),
        ],
      },
      {
        id: "klagomal",
        heading: "Klagomål och tvister",
        blocks: [
          p("Är du missnöjd, kontakta i första hand ", mail, " så försöker vi hitta en lösning."),
          p(
            "Som konsument kan du också vända dig till Allmänna reklamationsnämnden (ARN), ",
            link("arn.se", "https://www.arn.se"),
            ", och till din kommuns konsumentvägledning.",
          ),
          p(
            "Svensk lag gäller. Tvister prövas av allmän domstol. Som konsument har du alltid kvar det skydd du har enligt tvingande lag.",
          ),
        ],
      },
      {
        id: "andringar",
        heading: "Ändringar",
        blocks: [
          p(
            "CVB Coaching kan uppdatera villkoren. Ändringar gäller inte ett redan ingånget avtal utan att båda parter är överens om det.",
          ),
        ],
      },
    ],
  };
}

function en(): LegalDocument {
  const L = (key: Parameters<typeof legalHref>[0]) => legalHref(key, "en");
  return {
    metaTitle: "General terms | CVB Coaching",
    metaDescription:
      "General terms for coaching with CVB Coaching: contract, the nature of coaching, confidentiality, price, cancellation, right of withdrawal and disputes.",
    label: "Terms",
    title: "General terms for coaching",
    lead: "These terms apply to coaching services from CVB Coaching. They complement the individual coaching contract, which sets out what is specific to your engagement.",
    updatedLabel: `Last updated ${formatUpdated(LEGAL_UPDATED_AT, "en")}`,
    tocLabel: "Contents",
    sections: [
      {
        id: "scope",
        heading: "Scope",
        blocks: [
          p(
            "The terms apply when CVB Coaching delivers coaching to a private individual or to a company or organisation. The individual contract may supplement the terms, for example with price, number of sessions, frequency, specific confidentiality rules and delivery terms. If the individual contract and the terms differ, the individual contract applies.",
          ),
          p(
            "The terms never restrict the rights you have as a consumer under mandatory law, for example the Swedish Consumer Services Act and the Swedish Act on Distance Contracts and Off-Premises Contracts.",
          ),
        ],
      },
      {
        id: "parties",
        heading: "Parties",
        blocks: [
          companyFacts("en"),
          p(
            `The contracting party for CVB Coaching's services is ${legalPartyName()}. Where these terms refer to CVB Coaching, they mean that contracting party.`,
          ),
          p(
            "The client is the person receiving coaching. A commissioning client is a company or organisation that orders and pays for coaching for one or more clients. The contracting party is either the client or the commissioning client — this is stated in the individual contract.",
          ),
        ],
      },
      {
        id: "contract",
        heading: "When a contract is formed",
        blocks: [
          p(
            "The introductory conversation is free of charge and binds neither party. A coaching contract is formed only when the individual contract has been approved by both parties. When the contract is entered into in CVB Base, it is formed when both the client and CVB Coaching have signed. CVB Base also states whether the contract is a consumer contract or a business contract.",
          ),
        ],
      },
      {
        id: "nature",
        heading: "The nature of coaching",
        blocks: [
          p(
            "Coaching is a conversation-based process that supports the client in clarifying goals, seeing their situation more clearly and reaching their own decisions and actions.",
          ),
          p(
            "Coaching is not medical treatment, psychotherapy or other psychological treatment, nor legal, financial or other professional advice. If it becomes clear that the client needs such support, Carolina may recommend that the client turns to the appropriate provider, and the engagement may then be paused.",
          ),
        ],
      },
      {
        id: "responsibilities",
        heading: "The client's and the coach's responsibilities",
        blocks: [
          p(
            "The client is responsible for their own decisions and actions, both during and after the coaching, and for taking an active part in the conversations.",
          ),
          p(
            "CVB Coaching is responsible for carrying out the coaching process professionally, with care and in line with established ethical guidelines for coaching.",
          ),
        ],
      },
      {
        id: "confidentiality",
        heading: "Confidentiality",
        blocks: [
          p(
            "What comes up in the conversations is treated confidentially. CVB Coaching does not disclose the content to anyone else, including a commissioning client, without the client's consent. Exceptions apply if CVB Coaching is required to disclose information by law or by a decision of a public authority, or if there is a serious risk to someone's life or health.",
          ),
        ],
      },
      {
        id: "commissioned",
        heading: "Coaching paid for by a commissioning client",
        blocks: [
          p(
            "When a commissioning client pays, the client is still the person the coaching is for. What is reported back to the commissioning client is decided in advance and limited to what has been agreed, for example participation, number of completed sessions and overall status. The content of the conversations, the client's reflections and the coach's notes are not shared with the commissioning client.",
          ),
        ],
      },
      {
        id: "price",
        heading: "Price and payment",
        blocks: [
          p(
            "Price and payment terms are stated in the individual contract. A price given to a consumer is the total price, including VAT where VAT is payable. For late payment, interest may be charged under the Swedish Interest Act.",
          ),
        ],
      },
      {
        id: "booking",
        heading: "Booking, rescheduling and cancellation",
        blocks: [
          p(
            "Sessions are booked through CVB Base or in direct contact with Carolina. If you need to reschedule or cancel, do so as soon as possible through CVB Base or by contacting Carolina.",
          ),
          p(
            "If the individual contract sets a cancellation deadline and what applies for late cancellation or non-attendance, that applies. If the individual contract does not regulate this, no fee is charged for a cancelled session. If CVB Coaching needs to cancel a session, a new time is offered at no extra cost.",
          ),
        ],
      },
      {
        id: "termination",
        heading: "Termination",
        blocks: [
          p(
            "Contract term and termination are stated in the individual contract. Unless it says otherwise, the client may end the engagement at any time and then pays for what has been performed up to that point. Either party may terminate the contract with immediate effect if the other party materially breaches it.",
          ),
        ],
      },
      {
        id: "withdrawal",
        heading: "Right of withdrawal for consumers",
        blocks: [
          p(
            "If you are a consumer and enter into the contract at a distance — for example by signing in CVB Base — you have the right under the Swedish Act on Distance Contracts and Off-Premises Contracts (2005:59) to withdraw from the contract within 14 days from the day the contract was concluded. In CVB Base the contract is concluded when both you and CVB Coaching have signed. If the last day of the period falls on a Saturday, Sunday or public holiday, it is extended to the next working day. You can withdraw as soon as you have signed yourself.",
          ),
          p("How to withdraw:"),
          list(
            "in CVB Base: open the contract under Avtal (Contracts) and choose Ångra avtalet här (withdraw from the contract here), or",
            ["by emailing ", mail, " a clear statement that you withdraw from the contract. You may use the model form below, but it is not obligatory."],
          ),
          p(
            "When you withdraw in CVB Base, the time is registered immediately and you receive an acknowledgement of receipt by email. It is enough that you send your statement before the withdrawal period has expired.",
          ),
          p(
            "If you have expressly requested that the coaching start during the withdrawal period and then withdraw, you pay for the part of the service performed up to that point, in proportion to the agreed price. If the service has been fully performed, at your express request and with your acknowledgement that the right of withdrawal then ends, you no longer have a right of withdrawal. The fact that a session has taken place does not in itself mean that the right of withdrawal has ended.",
          ),
          p("The right of withdrawal does not apply to contracts entered into by a company or organisation."),
        ],
      },
      {
        id: "model-form",
        heading: "Model withdrawal form",
        blocks: [
          p("Complete and return this form only if you wish to withdraw from the contract."),
          list(
            ["To: ", `${legalPartyName()} (${LEGAL_ENTITY.tradeName}), ${formattedPostalAddress()}, `, mail],
            "I hereby give notice that I withdraw from my contract for the provision of the following service: …",
            "Ordered on / received on: …",
            "Name of consumer: …",
            "Address of consumer: …",
            "Signature of consumer (only if this form is notified on paper): …",
            "Date: …",
          ),
        ],
      },
      {
        id: "intellectual-property",
        heading: "Material and intellectual property",
        blocks: [
          p(
            "Material that CVB Coaching produces or shares — for example exercises, worksheets and templates — belongs to CVB Coaching. The client may use it for their own development but may not distribute it further or use it commercially.",
          ),
          p("What the client writes or uploads belongs to the client. CVB Coaching uses it only to deliver the coaching."),
        ],
      },
      {
        id: "cvb-base",
        heading: "CVB Base",
        blocks: [
          p(
            "When the coaching includes CVB Base, the service is part of the delivery. Its use is governed by the ",
            link("CVB Base terms of use", L("baseTerms")),
            ".",
          ),
        ],
      },
      {
        id: "personal-data",
        heading: "Personal data and AI support",
        blocks: [
          p(
            "How personal data is processed is described in the ",
            link("privacy policy", L("privacy")),
            ". Carolina may use the AI support in CVB Base to prepare and structure her work, as described there. The AI support makes no decisions; the coaching is carried out by Carolina.",
          ),
        ],
      },
      {
        id: "liability",
        heading: "Liability",
        blocks: [
          p(
            "CVB Coaching is liable for damage caused by CVB Coaching's negligence. CVB Coaching is not liable for the client's own decisions or their consequences.",
          ),
          p(
            "Towards a consumer, liability is not limited beyond what mandatory law permits. Towards a company or organisation, liability is limited to the price paid for the assignment and does not cover indirect loss, except in cases of intent or gross negligence.",
          ),
          p(
            "Neither party is liable for delays or obstacles caused by circumstances beyond its control that it could not reasonably have foreseen or avoided.",
          ),
        ],
      },
      {
        id: "complaints",
        heading: "Complaints and disputes",
        blocks: [
          p("If you are dissatisfied, please first contact ", mail, " and we will try to find a solution."),
          p(
            "As a consumer you can also turn to the Swedish National Board for Consumer Disputes (Allmänna reklamationsnämnden, ARN), ",
            link("arn.se", "https://www.arn.se"),
            ", and to your municipality's consumer advice service.",
          ),
          p(
            "Swedish law applies. Disputes are settled by the general courts. As a consumer you always retain the protection you have under mandatory law.",
          ),
        ],
      },
      {
        id: "changes",
        heading: "Changes",
        blocks: [
          p(
            "CVB Coaching may update these terms. Changes do not apply to a contract already entered into unless both parties agree. If the Swedish and English versions differ, the Swedish version applies.",
          ),
        ],
      },
    ],
  };
}

export function termsDocument(locale: Locale): LegalDocument {
  return locale === "en" ? en() : sv();
}

/**
 * Every version of the general terms that a contract can be pinned to.
 * Only the current version exists so far and is backed by the current
 * text. Before changing the text above, copy it here under its version so
 * contracts pinned to it keep rendering exactly what the client accepted.
 */
const GENERAL_TERMS: Record<GeneralTermsVersion, (locale: Locale) => LegalDocument> = {
  "2026-10-01": termsDocument,
};

export function generalTermsDocument(version: string | null | undefined, locale: Locale): LegalDocument | null {
  return isGeneralTermsVersion(version) ? GENERAL_TERMS[version](locale) : null;
}
