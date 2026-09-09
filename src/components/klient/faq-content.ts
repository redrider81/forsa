/**
 * Innehållet i klientens FAQ.
 *
 * Ren data, ingen JSX — så att svaren kan låsas i test. Varje svar måste gå
 * att belägga i den befintliga implementationen; särskilt svaren om vad
 * Carolina ser. Ändra aldrig ett integritetssvar utan att först kontrollera
 * vad systemet faktiskt gör.
 */

export type FaqEntry = {
  question: string;
  /** Ett stycke per element. Håll dem korta. */
  answer: string[];
  /** Kontaktuppgift som renderas som en mailto-länk sist i svaret. */
  contactEmail?: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  /** En rad kontext i stängt läge. */
  summary: string;
  entries: FaqEntry[];
};

export const faqCategories: FaqCategory[] = [
  {
    id: "oversikt",
    title: "Översikt",
    summary: "Vad du ser när du loggar in, och hur delarna hänger ihop.",
    entries: [
      {
        question: "Vad visar Översikt?",
        answer: [
          "Översikt samlar det som är mest aktuellt i ditt coachingsamarbete just nu: din nästa session, din riktning, dina åtaganden, en plats att skriva en reflektion, den senaste sammanfattningen som delats med dig och material som är relevant framåt.",
          "Tanken är att du ska kunna logga in och direkt se var ni står, utan att leta.",
        ],
      },
      {
        question: 'Vad betyder "Min riktning"?',
        answer: [
          "Min riktning är den övergripande utvecklingsriktning ni har formulerat tillsammans i coachingen. Den ligger kvar mellan sessionerna som en påminnelse om vad arbetet handlar om i stort.",
          "Under riktningen står dina egna ord från när er överenskommelse gjordes.",
        ],
      },
      {
        question: 'Vad visar "Din väg så här långt"?',
        answer: [
          "Det är en lugn tillbakablick: dina senaste sessioner, hur många ni har genomfört, dina åtaganden och dina reflektioner sedan ni började.",
          "Det är inte en poäng och inte ett mått på hur bra du presterar. Det finns där för att ge sammanhang åt det ni gör nu.",
        ],
      },
    ],
  },
  {
    id: "forberedelse",
    title: "Förberedelse inför nästa session",
    summary: "Hur du förbereder dig, och vad som händer med det du skriver.",
    entries: [
      {
        question: "Hur förbereder jag mig inför nästa session?",
        answer: [
          "På Översikt finns knappen Förbered session vid din nästa session. Den tar dig till fyra korta frågor: vad du vill prioritera, vad som behöver bli tydligare efteråt, vad som har förändrats sedan sist och vad du vill att Carolina särskilt följer upp.",
          "Du behöver inte fylla i allt. Ett fält räcker. I samma vy kan du också kryssa för material du vill ta med till sessionen.",
        ],
      },
      {
        question: "Vad händer när jag sparar min förberedelse?",
        answer: [
          "Den sparas och delas med Carolina, så att den kan ingå i förberedelsen inför ert nästa samtal.",
        ],
      },
      {
        question: "Kan Carolina se min förberedelse?",
        answer: [
          "Ja. Förberedelsen är till för att användas i samtalet, och Carolina ser den så snart du har sparat den.",
        ],
      },
      {
        question: "Kan jag ändra min förberedelse?",
        answer: [
          "Ja. På Översikt står det Uppdatera förberedelse när något är sparat. Dina svar ligger kvar i formuläret, du ändrar det du vill och sparar igen. Den nya versionen ersätter den tidigare.",
        ],
      },
    ],
  },
  {
    id: "ataganden",
    title: "Åtaganden",
    summary: "Det du valt att bära med dig mellan samtalen.",
    entries: [
      {
        question: "Vad är ett åtagande?",
        answer: [
          "Ett åtagande är något du har valt att ta med dig ut ur ett samtal och arbeta vidare med tills ni ses nästa gång. Det kan vara ett konkret steg, men lika gärna något du vill pröva eller vara uppmärksam på.",
          "Det är inte en uppgiftslista att beta av. Det hör ihop med det ni pratade om.",
        ],
      },
      {
        question: "Hur uppdaterar jag ett åtagande?",
        answer: [
          "Under Dina åtaganden på Översikt klickar du på statusmarkeringen vid åtagandet och väljer Ej startat, Pågående eller Genomfört. Ändringen sparas direkt.",
        ],
      },
      {
        question: "Vad används min anteckning till?",
        answer: [
          "Vid varje åtagande kan du lägga till en kort notering. Den håller kvar sammanhanget — hur det gick, vad som blev svårt, vad du la märke till — så att ni slipper rekonstruera det på plats i nästa samtal.",
        ],
      },
      {
        question: "Kan Carolina se mina uppdateringar?",
        answer: [
          "Ja. Både status och notering ingår i det gemensamma underlaget för er coaching.",
        ],
      },
    ],
  },
  {
    id: "reflektioner",
    title: "Reflektioner",
    summary: "Dina egna ord mellan sessionerna.",
    entries: [
      {
        question: "Vad är en reflektion?",
        answer: [
          "En reflektion hjälper dig att fånga något som blivit tydligare, förändrats eller fortfarande känns öppet mellan samtalen.",
          "Den behöver varken vara lång eller genomarbetad. Några meningar räcker.",
        ],
      },
      {
        question: "När kan jag skriva en reflektion?",
        answer: [
          "När som helst mellan sessionerna, när något är värt att fånga innan det glider undan. Du börjar direkt från Översikt eller under Reflektioner.",
        ],
      },
      {
        question: "Kan Carolina läsa mina reflektioner?",
        answer: [
          "Ja. Reflektioner som du skriver i CVB Base delas med Carolina som en del av ert coachingsamarbete.",
          "Vill du skriva något som stannar hos dig lägger du det i stället som en anteckning under Material och markerar den Privat för mig.",
        ],
      },
      {
        question: "Var hittar jag tidigare reflektioner?",
        answer: [
          "Under Reflektioner i navigeringen ligger alla dina reflektioner i kronologisk ordning. Reflektioner du själv har skrivit här kan du också ta bort därifrån.",
        ],
      },
    ],
  },
  {
    id: "sessioner",
    title: "Sessioner",
    summary: "Din sessionshistorik och det som delas efteråt.",
    entries: [
      {
        question: "Vad finns under Sessioner?",
        answer: [
          "Din sessionshistorik: kommande session med fokus, och varje genomförd session med datum, fokus och den sammanfattning som delats med dig.",
          "Här kan du också föreslå en tid för ett nytt möte och svara på tidsförslag som väntar.",
        ],
      },
      {
        question: "Vad visas efter en genomförd session?",
        answer: [
          "När en sammanfattning har delats med dig visas den under sessionen: egna insikter, vad som blev tydligare och de åtaganden ni kom överens om.",
        ],
      },
      {
        question: "Kan jag se Carolinas arbetsanteckningar?",
        answer: [
          "Nej. Carolinas egna arbetsanteckningar visas inte i klientportalen. Det du ser är den sammanfattning hon har godkänt och delat med dig.",
        ],
      },
      {
        question: "Varför saknar en session ibland en sammanfattning?",
        answer: [
          "En sammanfattning visas först när den är godkänd och delad för dig. Fram till dess står det att sammanfattningen inte är delad ännu.",
        ],
      },
    ],
  },
  {
    id: "material",
    title: "Material",
    summary: "Din arbetsyta för filer, anteckningar och det Carolina delar.",
    entries: [
      {
        question: "Vad finns under Material?",
        answer: [
          "Material är din egen arbetsyta i coachingen. Där laddar du upp filer, skriver anteckningar och hittar det Carolina har delat med dig.",
          "Ytan är uppdelad i Mina filer, Mina anteckningar och Delat med mig.",
        ],
      },
      {
        question: 'Vad betyder "Privat för mig"?',
        answer: [
          "Att materialet bara syns för dig. Filer och anteckningar som är markerade Privat för mig når aldrig Carolina.",
        ],
      },
      {
        question: 'Vad betyder "Delat med Carolina"?',
        answer: [
          "Att du själv har valt att dela materialet. Det syns då i Carolinas klientvy och kan användas i ert coachingarbete. Du väljer delning när du lägger upp materialet och kan ändra den efteråt.",
        ],
      },
      {
        question: "Hur ser jag material som Carolina har delat med mig?",
        answer: [
          "Under Material, i avsnittet Delat med mig. Sådant material är märkt Delat av Carolina.",
        ],
      },
      {
        question: "Hur hittar jag material inför nästa session?",
        answer: [
          "Material som är kopplat till nästa session — antingen från materialraden eller när du förbereder dig — lyfts fram på Översikt under Relevant material, tillsammans med det Carolina har delat.",
        ],
      },
    ],
  },
  {
    id: "avtal-och-profil",
    title: "Avtal och profil",
    summary: "Dina avtal och dina egna uppgifter.",
    entries: [
      {
        question: "Var hittar jag mitt coachingavtal?",
        answer: ["Under Avtal i navigeringen."],
      },
      {
        question: "Vad kan jag se under Avtal?",
        answer: [
          "Dina coachingavtal med CVB Coaching, med status, datum och pris där det är angivet. Du öppnar ett avtal för att läsa det i sin helhet.",
          "Är ett avtal skickat till dig kan du signera det direkt i vyn.",
        ],
      },
      {
        question: "Var ändrar jag mina kontaktuppgifter?",
        answer: [
          "Under Profil. Där redigerar du namn, roll, e-post och telefonnummer. Organisation ändras inte av dig.",
        ],
      },
      {
        question: "Vad används mina profiluppgifter till?",
        answer: [
          "De identifierar dig i portalen och gör att Carolina kan nå dig kring coachingen.",
          "Under Profil finns också din coachningsöverenskommelse och en sammanställning av vad som är privat och vad som delas.",
        ],
      },
    ],
  },
  {
    id: "integritet-och-hjalp",
    title: "Integritet och hjälp",
    summary: "Vad som delas, vad som inte gör det, och vart du vänder dig.",
    entries: [
      {
        question: "Vad kan Carolina se i CVB Base?",
        answer: [
          "Det du delar genom systemet som en del av coachingen: din förberedelse inför nästa session, dina åtaganden med status och noteringar, dina reflektioner, och material du har valt att dela.",
          "Utgångspunkten är att det du skriver här är till för samtalet er emellan. Undantaget är material och anteckningar du markerar som privata — de stannar hos dig.",
        ],
      },
      {
        question: "Vad ser jag inte som klient?",
        answer: [
          "Carolinas egna arbetsanteckningar från sessionerna visas inte här.",
          "Sessionssammanfattningar visas först när de är godkända och delade för dig.",
        ],
      },
      {
        question: "Hur vet jag om material är privat eller delat?",
        answer: [
          "Varje material är märkt: Privat för mig, Delat med Carolina eller Delat av Carolina. Märkningen följer med både under Material och där material visas på Översikt.",
        ],
      },
      {
        question: "Vad gör jag om något inte fungerar?",
        answer: ["Hör av dig till Carolina, så tar hon det vidare."],
      },
      {
        question: "Hur kontaktar jag Carolina?",
        answer: ["Enklast via e-post."],
        contactEmail: "carolina@cvbcoaching.se",
      },
    ],
  },
];
