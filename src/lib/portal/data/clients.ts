import type { Client, CoachingAgreement, DevelopmentGoal } from "@/lib/portal/types";

/** Standardvillkor som används i samtliga coachningsöverenskommelser i demon. */
const standardEthics =
  "Arbetet följer professionell coachingetik. Coachen arbetar med ett coachande förhållningssätt, gör inga bedömningar av person och ger inga diagnoser. Klienten äger sina val.";

function overviewAgreement(purpose: string, sponsorSharing: string): CoachingAgreement {
  return {
    agreedAt: "2026-03-06",
    purpose,
    scope: "Sex individuella coachingsamtal inom uppdragets ram.",
    cadence: "Var fjärde vecka, 60 minuter.",
    confidentiality:
      "Samtalens innehåll är konfidentiellt mellan klient och coach. Klienten avgör själv vad som delas vidare.",
    sponsorSharing,
    ethics: standardEthics,
    clientResponsibility:
      "Klienten formulerar fokus inför varje session och äger sina åtaganden mellan samtalen.",
  };
}

function overviewGoal(headline: string, clientWording: string): DevelopmentGoal {
  return {
    headline,
    clientWording,
    baseline: "Utgångsläget formulerades vid coachningsöverenskommelsen.",
    successCriteria: ["Klientens egen upplevelse av tydlighet i rollen", "Konkreta förändringar i vardagen"],
    horizon: "Programperioden 2026",
  };
}

export const clients: Client[] = [
  {
    id: "klient-emma-lind",
    engagementId: "eng-northline",
    organisationId: "org-northline",
    name: "Emma Lind",
    initials: "EL",
    role: "Grundare och vd",
    headline: "Från operativ grundare till strategisk vd",
    startedAt: "2026-03-05",
    depth: "full",
    recurringThemes: [
      "Vad händer om jag inte är den som löser det?",
      "Skillnaden mellan att vara behövd och att vara nödvändig",
      "Delegering som förtroende, inte som förlust av kvalitet",
    ],
    agreement: {
      agreedAt: "2026-03-05",
      purpose:
        "Att stödja Emma i övergången från en operativ grundarroll till en tydligare strategisk vd-roll när Northline Studio växer.",
      scope:
        "Åtta individuella coachingsamtal om 75 minuter under cirka sex månader, med en halvtidsavstämning och en avslutande utvecklingsöversikt.",
      cadence: "Var fjärde till var sjätte vecka, digitalt eller på plats i Göteborg.",
      confidentiality:
        "Allt som sägs i samtalen stannar mellan Emma och Carolina. Coachens egna anteckningar delas inte, varken med Emma eller med någon annan.",
      sponsorSharing:
        "Uppdraget är privat finansierat av bolaget men utan sponsorrapportering. Ingen annan i eller utanför Northline Studio tar del av innehållet.",
      ethics: standardEthics,
      clientResponsibility:
        "Emma formulerar fokus inför varje session, skriver en kort reflektion efteråt och äger sina åtaganden mellan samtalen.",
    },
    goal: {
      headline:
        "Att gå från en operativ grundarroll till en tydligare strategisk vd-roll när organisationen växer.",
      clientWording:
        "Jag vill kunna släppa taget om detaljerna utan att känna att jag sviker bolaget. Och jag vill veta vad jag faktiskt ska göra i stället.",
      baseline:
        "Vid start beskrev Emma en arbetsvecka där merparten av tiden gick till kundleveranser och akuta frågor, och där strategiskt arbete skedde på kvällar och helger.",
      successCriteria: [
        "Kundavstämningar och löpande leveransfrågor hanteras av teamet",
        "Ledningsmöten drivs utan att Emma själv föredrar varje punkt",
        "Emma kan beskriva sin vd-roll i egna ord för både team och styrelse",
        "Strategiskt arbete har en fast plats i veckan",
      ],
      horizon: "Sex månader, mars – september 2026",
    },
  },
  {
    id: "klient-johan-bergstrom",
    engagementId: "eng-bergstrom",
    organisationId: "org-bergstrom",
    name: "Johan Bergström",
    initials: "JB",
    role: "Vd",
    headline: "Att fatta färre men tydligare beslut",
    startedAt: "2026-02-26",
    depth: "full",
    recurringThemes: [
      "Skillnaden mellan att vara tillgänglig och att vara inblandad",
      "Vad ett beslut behöver för att hålla efter mötet",
    ],
    agreement: {
      agreedAt: "2026-02-26",
      purpose:
        "Att stärka Johans förmåga att fatta och stå bakom beslut som håller genom organisationen, som en del av ledarutvecklingsuppdraget.",
      scope: "Sex individuella coachingsamtal om 60 minuter under uppdragsperioden.",
      cadence: "Var fjärde vecka.",
      confidentiality:
        "Samtalens innehåll är konfidentiellt mellan Johan och Carolina. Coachens anteckningar delas inte.",
      sponsorSharing:
        "Till uppdragsgivaren rapporteras endast deltagande, genomförda sessioner och övergripande teman på gruppnivå.",
      ethics: standardEthics,
      clientResponsibility:
        "Johan formulerar fokus inför varje session och äger sina åtaganden mellan samtalen.",
    },
    goal: {
      headline: "Att fatta färre beslut själv, och göra de som fattas tydligare.",
      clientWording:
        "Jag vill sluta vara den som alla väntar på. Besluten ska vara begripliga även när jag inte är i rummet.",
      baseline:
        "Vid start beskrev Johan att många beslut passerade honom en gång till efter att de redan fattats i ledningsgruppen.",
      successCriteria: [
        "Ledningsgruppen fattar beslut inom sitt mandat utan att invänta vd",
        "Beslut dokumenteras med ansvarig och tidpunkt",
        "Färre återöppnade frågor mellan ledningsmöten",
      ],
      horizon: "Uppdragsperioden februari – oktober 2026",
    },
  },
  {
    id: "klient-sara-nyqvist",
    engagementId: "eng-bergstrom",
    organisationId: "org-bergstrom",
    name: "Sara Nyqvist",
    initials: "SN",
    role: "Operativ chef",
    headline: "Att leda genom sina chefer i stället för förbi dem",
    startedAt: "2026-03-04",
    depth: "full",
    recurringThemes: [
      "Att äga sitt mandat fullt ut",
      "Vad tydlighet kostar i stunden och ger över tid",
    ],
    agreement: {
      agreedAt: "2026-03-04",
      purpose:
        "Att stödja Sara i att leda genom sina gruppchefer och tydliggöra var beslut hör hemma i den operativa organisationen.",
      scope: "Sex individuella coachingsamtal om 60 minuter under uppdragsperioden.",
      cadence: "Var fjärde vecka.",
      confidentiality:
        "Samtalens innehåll är konfidentiellt mellan Sara och Carolina. Coachens anteckningar delas inte.",
      sponsorSharing:
        "Till uppdragsgivaren rapporteras endast deltagande, genomförda sessioner och övergripande teman på gruppnivå.",
      ethics: standardEthics,
      clientResponsibility:
        "Sara formulerar fokus inför varje session och äger sina åtaganden mellan samtalen.",
    },
    goal: {
      headline: "Att leda genom sina gruppchefer i stället för förbi dem.",
      clientWording:
        "Jag går in och löser saker för snabbt. Jag vill att mina chefer ska växa i sitt eget ansvar.",
      baseline:
        "Vid start beskrev Sara att hon regelbundet klev in i gruppchefernas frågor för att hålla tempo under tillväxten.",
      successCriteria: [
        "Gruppcheferna driver sina egna veckoavstämningar",
        "Sara har återkommande utvecklingssamtal i stället för akuta avstämningar",
        "Färre operativa frågor eskaleras direkt till Sara",
      ],
      horizon: "Uppdragsperioden februari – oktober 2026",
    },
  },
  {
    id: "klient-ali-demir",
    engagementId: "eng-bergstrom",
    organisationId: "org-bergstrom",
    name: "Ali Demir",
    initials: "AD",
    role: "Logistikchef",
    headline: "Tydligare prioritering i en pressad verksamhet",
    startedAt: "2026-03-06",
    depth: "oversikt",
    recurringThemes: ["Prioritering under press"],
    agreement: overviewAgreement(
      "Att stödja Ali i att prioritera tydligare när verksamheten är hårt belastad.",
      "Till uppdragsgivaren rapporteras endast deltagande och genomförda sessioner.",
    ),
    goal: overviewGoal(
      "Tydligare prioritering i en pressad verksamhet.",
      "Jag vill kunna säga vad som är viktigast just nu utan att känna att jag sviker något annat.",
    ),
  },
  {
    id: "klient-petra-sund",
    engagementId: "eng-bergstrom",
    organisationId: "org-bergstrom",
    name: "Petra Sund",
    initials: "PS",
    role: "HR-chef",
    headline: "Att vara både stödfunktion och egen röst i ledningen",
    startedAt: "2026-03-06",
    depth: "oversikt",
    recurringThemes: ["Rollen i ledningsgruppen"],
    agreement: overviewAgreement(
      "Att stödja Petra i att ta plats med egen riktning i ledningsgruppen, inte bara som stödfunktion.",
      "Petra är även uppdragsgivarens kontaktperson. Hennes egna samtal omfattas av samma sekretess som övriga deltagares.",
    ),
    goal: overviewGoal(
      "Att ta plats med egen riktning i ledningsgruppen.",
      "Jag vill bidra med mer än processer. Jag vill att min bild av organisationen ska väga.",
    ),
  },
  {
    id: "klient-helena-waller",
    engagementId: "eng-nordic-industrial",
    organisationId: "org-nordic-industrial",
    name: "Helena Waller",
    initials: "HW",
    role: "Chief Operating Officer",
    headline: "Att leda över affärsområdesgränser utan formellt mandat",
    startedAt: "2026-02-18",
    depth: "full",
    recurringThemes: [
      "Inflytande utan formellt mandat",
      "Att förbereda rummet i stället för att övertyga i rummet",
    ],
    agreement: {
      agreedAt: "2026-02-18",
      purpose:
        "Att stödja Helena i att leda förändring över affärsområdesgränser inom ramen för Executive Leadership Programme.",
      scope: "Sex individuella coachingsamtal om 60 minuter parallellt med programmets gemensamma delar.",
      cadence: "Var fjärde vecka.",
      confidentiality:
        "Samtalens innehåll är konfidentiellt mellan Helena och Carolina och delas inte med koncernen.",
      sponsorSharing:
        "Sponsor får endast programstatus, deltagande och övergripande teman. Inget individuellt innehåll rapporteras.",
      ethics: standardEthics,
      clientResponsibility:
        "Helena formulerar fokus inför varje session och äger sina åtaganden mellan samtalen.",
    },
    goal: {
      headline: "Att leda över affärsområdesgränser utan att luta sig mot formellt mandat.",
      clientWording:
        "Jag har ansvar för helheten men inte befogenhet över delarna. Jag vill hitta ett sätt att leda som håller ändå.",
      baseline:
        "Vid start beskrev Helena att förändringsarbete ofta stannade i affärsområdenas egna prioriteringar.",
      successCriteria: [
        "Gemensamma initiativ har namngivna ägare i affärsområdena",
        "Helena förbereder nyckelpersoner före beslutsforum",
        "Färre initiativ som stannar efter uppstart",
      ],
      horizon: "Programperioden februari – november 2026",
    },
  },
  {
    id: "klient-markus-ek",
    engagementId: "eng-nordic-industrial",
    organisationId: "org-nordic-industrial",
    name: "Markus Ek",
    initials: "ME",
    role: "VP Supply Chain",
    headline: "Från expert till ledare för andra experter",
    startedAt: "2026-02-20",
    depth: "full",
    recurringThemes: [
      "Att vara den som kan mest och ändå inte svara först",
      "Tystnad som ledarverktyg",
    ],
    agreement: {
      agreedAt: "2026-02-20",
      purpose:
        "Att stödja Markus i steget från sakkunnig expert till ledare för andra experter inom ramen för programmet.",
      scope: "Sex individuella coachingsamtal om 60 minuter parallellt med programmets gemensamma delar.",
      cadence: "Var fjärde vecka.",
      confidentiality:
        "Samtalens innehåll är konfidentiellt mellan Markus och Carolina och delas inte med koncernen.",
      sponsorSharing:
        "Sponsor får endast programstatus, deltagande och övergripande teman. Inget individuellt innehåll rapporteras.",
      ethics: standardEthics,
      clientResponsibility:
        "Markus formulerar fokus inför varje session och äger sina åtaganden mellan samtalen.",
    },
    goal: {
      headline: "Att leda genom frågor i stället för genom svar.",
      clientWording:
        "Jag är snabbast på att se lösningen. Problemet är att då slutar de andra leta.",
      baseline:
        "Vid start beskrev Markus att hans team ofta väntade in hans bedömning innan de tog egna beslut.",
      successCriteria: [
        "Teamet presenterar egna förslag innan Markus ger sin bild",
        "Markus leder minst en avstämning i veckan utan att själv föreslå lösning",
        "Fler beslut fattas i teamet utan hans närvaro",
      ],
      horizon: "Programperioden februari – november 2026",
    },
  },
  ...([
    ["klient-anette-rosen", "Anette Rosén", "AR", "VP Finance", "Att göra ekonomistyrning till ett ledarverktyg"],
    ["klient-david-lindqvist", "David Lindqvist", "DL", "Fabrikschef, Trollhättan", "Att leda en verksamhet i omställning"],
    ["klient-farah-haddad", "Farah Haddad", "FH", "VP Sustainability", "Att driva förändring med tålamod och tempo"],
    ["klient-gustav-almqvist", "Gustav Almqvist", "GA", "VP Sales, Norden", "Att bygga en säljorganisation som håller"],
    ["klient-ingela-strand", "Ingela Strand", "IS", "VP People & Culture", "Att växla från process till riktning"],
    ["klient-joakim-persson", "Joakim Persson", "JP", "Affärsområdeschef, Energy", "Att äga helheten i sitt affärsområde"],
    ["klient-lina-forsberg", "Lina Forsberg", "LF", "VP Engineering", "Att leda teknisk utveckling i stor skala"],
    ["klient-mattias-holm", "Mattias Holm", "MH", "Fabrikschef, Sandviken", "Att bygga tillit i en ny ledningsgrupp"],
    ["klient-nina-berglund", "Nina Berglund", "NB", "VP Legal", "Att gå från rådgivare till medbeslutare"],
    ["klient-oskar-wikstrom", "Oskar Wikström", "OW", "Affärsområdeschef, Industry", "Att prioritera mellan goda alternativ"],
  ] as const).map(([id, name, initials, role, headline]): Client => ({
    id,
    engagementId: "eng-nordic-industrial",
    organisationId: "org-nordic-industrial",
    name,
    initials,
    role,
    headline,
    startedAt: "2026-02-25",
    depth: "oversikt",
    recurringThemes: [],
    agreement: overviewAgreement(
      `Att stödja ${name.split(" ")[0]} i sitt ledarskap inom ramen för Executive Leadership Programme.`,
      "Sponsor får endast programstatus, deltagande och övergripande teman. Inget individuellt innehåll rapporteras.",
    ),
    goal: overviewGoal(headline, "Utvecklingsmålet formulerades vid coachningsöverenskommelsen."),
  })),
];
