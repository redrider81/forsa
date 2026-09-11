import type { FaqCategory } from "@/components/faq/faq-types";

/** Coachens produktvägledning. Integritetskritiska svar låses i test. */
export const coachFaqCategories: FaqCategory[] = [
  {
    id: "oversikt",
    title: "Översikt",
    summary: "Dagens arbete, det som kräver åtgärd och verksamhetens nuläge.",
    entries: [
      {
        question: "Vad visar Översikt?",
        answer: [
          "Översikt samlar dagens agenda, bokningsförfrågningar, sådant som kräver åtgärd, inkommet sedan senaste inloggningen och de närmaste insatserna.",
          "Här finns också verksamhetsmått och en klientöversikt som ger sammanhang utan att du behöver öppna varje klient.",
        ],
      },
      {
        question: "Hur öppnar jag dagens session?",
        answer: ["Gå till Dagens agenda och öppna sessionen. Därifrån kan du starta mötesläget eller förbereda samtalet."],
      },
      {
        question: 'Vad betyder "Kräver åtgärd"?',
        answer: ["Det är sådant som väntar på ett aktivt beslut eller nästa steg från dig. Öppna raden för att hantera ärendet i rätt sammanhang."],
      },
    ],
  },
  {
    id: "kalender",
    title: "Kalender och bokningar",
    summary: "Planerade sessioner, tidsperioder och klienternas förfrågningar.",
    entries: [
      {
        question: "Hur använder jag Kalender?",
        answer: ["Kalender visar planerade insatser. Växla mellan Idag, Vecka och Månad för att anpassa tidsspannet och öppna en post för att arbeta vidare med den."],
      },
      {
        question: "Var ser jag bokningsförfrågningar?",
        answer: ["Väntande bokningsförfrågningar visas på Översikt. Där ser du klientens förslag och kan ta ställning till nästa steg."],
      },
      {
        question: "Var ställer jag in min tillgänglighet?",
        answer: ["Öppna Kalender och välj Tillgänglighet. Den vyn används för de tider som ska ligga till grund för bokningen."],
      },
    ],
  },
  {
    id: "klienter",
    title: "Klienter",
    summary: "Skapa klienter och hitta mål, historik och aktuella underlag.",
    entries: [
      {
        question: "Hur lägger jag till en klient?",
        answer: ["Öppna Klienter och välj Ny klient. Fyll i klientens uppgifter och den information som ska utgöra starten för coachingsamarbetet."],
      },
      {
        question: "Vad hittar jag i klientens översikt?",
        answer: ["Klientöversikten samlar nästa session, utvecklingsmål, åtaganden, klientens insikter och reflektioner, sessioner, avtal samt dokument och material."],
      },
      {
        question: "Hur förbereder jag mig inför nästa session?",
        answer: ["Öppna klienten och välj Förbered session. Där samlas klientens förberedelse, föregående session, öppna åtaganden och den senaste reflektionen."],
      },
      {
        question: "Kan jag se portalen som klienten ser den?",
        answer: ["Ja. Från klientens sida kan du öppna Klientvy och kontrollera den delade klientupplevelsen."],
      },
    ],
  },
  {
    id: "sessioner",
    title: "Sessioner och sammanfattningar",
    summary: "Arbeta under samtalet och välj vad klienten får se efteråt.",
    entries: [
      {
        question: "Vad gör jag i mötesläget?",
        answer: ["Mötesläget samlar dagens önskade utfall, det som ska utforskas, utvecklingsmålet och tidigare åtaganden. Där sparar du också samtalets överenskommelse och privata coachanteckningar."],
      },
      {
        question: "Kan klienten se mina coachanteckningar?",
        answer: ["Nej. Privata coachanteckningar och arbetsanteckningar är märkta Endast du och delas aldrig med klienten eller uppdragsgivaren."],
      },
      {
        question: "Hur skapar jag en sessionssammanfattning?",
        answer: ["När sessionen avslutas fyller du i samtalets lärande och nästa steg. Därefter kan du skapa ett utkast från underlaget.", "Läs igenom och redigera alltid utkastet innan du godkänner det."],
      },
      {
        question: "När kan klienten se sammanfattningen?",
        answer: ["Först när du har granskat, godkänt och delat sammanfattningen. Inget utkast delas automatiskt."],
      },
    ],
  },
  {
    id: "uppdrag",
    title: "Uppdrag",
    summary: "Deltagare, programstatus, milstolpar och rapportering.",
    entries: [
      {
        question: "Vad är ett uppdrag?",
        answer: ["Ett uppdrag samlar ett coachingprogram för en organisation. Där ser du status, deltagare, genomförande, milstolpar och material på uppdragsnivå."],
      },
      {
        question: "Vad visar programöversikten?",
        answer: ["Programöversikten sammanfattar deltagande, genomförda och kommande sessioner, programstatus och milstolpar."],
      },
      {
        question: "Visas individuellt samtalsinnehåll för uppdragsgivaren?",
        answer: ["Nej. Rapporteringen omfattar programinformation och aldrig individuellt samtalsinnehåll."],
      },
    ],
  },
  {
    id: "avtal",
    title: "Avtal",
    summary: "Skapa, skicka och följa avtal och återanvändbara mallar.",
    entries: [
      {
        question: "Hur skapar jag ett nytt avtal?",
        answer: ["Öppna Avtal och välj Nytt avtal. Välj en mall eller börja med ett tomt avtal, koppla en klient och fyll i avtalsuppgifterna."],
      },
      {
        question: "Hur använder jag avtalsmallar?",
        answer: ["Under Mallar skapar du återanvändbara upplägg med sektioner och anpassade fält. Ändringar påverkar inte redan skapade avtal."],
      },
      {
        question: "Vad händer när jag skickar ett avtal?",
        answer: ["Avtalet blir tillgängligt för klienten att läsa och signera. I avtalsvyn ser du status och om klientens eller Carolinas signering återstår."],
      },
    ],
  },
  {
    id: "dokument",
    title: "Dokument och material",
    summary: "Det interna arkivet och material som hör till klienter eller uppdrag.",
    entries: [
      {
        question: "Vad finns under Dokument?",
        answer: ["Dokument är ditt interna arkiv för exempelvis avtal, mallar, certifikat och administrativa underlag. Du kan lägga till information och en fil."],
      },
      {
        question: "Kan klienterna se mitt dokumentarkiv?",
        answer: ["Nej. Dokumentarkivet under coachmenyn är synligt endast för dig."],
      },
      {
        question: "Vad betyder Coach privat?",
        answer: ["Material med märkningen Coach privat stannar i coachens arbetsyta och visas inte i klientportalen."],
      },
      {
        question: "Kan jag se klientens privata material?",
        answer: ["Nej. Det som klienten markerar Privat för mig når aldrig Carolina. Du ser bara material som klienten uttryckligen har valt att dela och material som du själv har delat."],
      },
    ],
  },
  {
    id: "profil-och-integritet",
    title: "Profil, integritet och hjälp",
    summary: "Din profil och gränserna mellan privat, delat och rapporterat.",
    entries: [
      {
        question: "Vad finns under Profil?",
        answer: ["Profil visar dina uppgifter och en sammanfattning av portalens integritetsnivåer. I demoläget finns även återställning av fiktivt testmaterial."],
      },
      {
        question: "Vad delas mellan coach och klient?",
        answer: ["Utvecklingsmål, sessionsöverenskommelser, klientens reflektioner, insikter, åtaganden och sammanfattningar som du har godkänt och delat ingår i det gemensamma underlaget."],
      },
      {
        question: "Vad delas med en uppdragsgivare?",
        answer: ["Deltagande, genomförda och kommande sessioner, programstatus och milstolpar kan ingå. Individuellt samtalsinnehåll delas inte."],
      },
      {
        question: "Vad gör jag om något inte fungerar?",
        answer: ["Notera vilken sida du är på och vad du försökte göra. Kontakta sedan den som ansvarar för CVB Base utan att skicka känsligt klientinnehåll i onödan."],
      },
    ],
  },
];
