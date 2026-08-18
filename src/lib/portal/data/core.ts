import type { CoachProfile, Engagement, Organisation } from "@/lib/portal/types";

/**
 * All data i denna demo är fiktiv. Inga verkliga klientuppgifter förekommer.
 */

export const coach: CoachProfile = {
  id: "coach-cvb",
  name: "Carolina von Braun",
  title: "Grundare och coach, CVB Coaching",
  initials: "CvB",
  email: "carolina@cvbcoaching.se",
  credential: "Professionell coachcertifiering (ICF)",
  focus: "Executive coaching, ledarutveckling och ledningsgruppsutveckling",
};

export const organisations: Organisation[] = [
  {
    id: "org-northline",
    name: "Northline Studio AB",
    sizeLabel: "ca 15 anställda",
    industry: "Digital designbyrå",
    location: "Göteborg",
  },
  {
    id: "org-bergstrom",
    name: "Bergström Logistik AB",
    sizeLabel: "ca 120 anställda",
    industry: "Tredjepartslogistik",
    location: "Borås",
    sponsor: { name: "Petra Sund", role: "HR-chef" },
  },
  {
    id: "org-nordic-industrial",
    name: "Nordic Industrial Group",
    sizeLabel: "1 000+ anställda",
    industry: "Industrikoncern",
    location: "Stockholm och Göteborg",
    sponsor: { name: "Ingrid Palm", role: "HR-direktör" },
  },
];

export const engagements: Engagement[] = [
  {
    id: "eng-northline",
    organisationId: "org-northline",
    title: "Executive coaching – grundare i växande bolag",
    kind: "individuell",
    kindLabel: "Individuell executive coaching",
    purpose:
      "Att stödja grundaren i övergången från en operativ grundarroll till en tydligare strategisk vd-roll när organisationen växer.",
    scopeNote: "En deltagare. Åtta sessioner över cirka sex månader.",
    periodLabel: "mars – september 2026",
    startDate: "2026-03-05",
    endDate: "2026-09-24",
    status: "pagaende",
    participantIds: ["klient-emma-lind"],
    milestones: [
      { id: "ms-nl-1", label: "Coachningsöverenskommelse och utgångsläge", date: "2026-03-05", status: "genomford" },
      { id: "ms-nl-2", label: "Halvtidsavstämning av utvecklingsmålet", date: "2026-06-18", status: "genomford" },
      { id: "ms-nl-3", label: "Utvecklingsöversikt inför avslut", date: "2026-09-10", status: "kommande" },
    ],
    nextReview: { label: "Halvtidsavstämning genomförd – nästa avstämning inför avslut", date: "2026-09-10" },
    sponsorReporting:
      "Uppdraget är helt individuellt. Ingen sponsor eller organisation tar del av innehållet. Endast genomförda sessioner rapporteras för fakturering.",
  },
  {
    id: "eng-bergstrom",
    organisationId: "org-bergstrom",
    title: "Ledarutveckling – tydligare ansvar och beslut efter tillväxt",
    kind: "ledarutveckling",
    kindLabel: "Ledarutvecklingsuppdrag",
    purpose:
      "Tydligare ansvarsfördelning och bättre beslutsfattande i ledningen efter en period av snabb tillväxt.",
    scopeNote: "Fyra deltagare med separata coachingrelationer och ett gemensamt organisationsmål.",
    periodLabel: "februari – oktober 2026",
    startDate: "2026-02-12",
    endDate: "2026-10-15",
    status: "pagaende",
    participantIds: [
      "klient-johan-bergstrom",
      "klient-sara-nyqvist",
      "klient-ali-demir",
      "klient-petra-sund",
    ],
    milestones: [
      { id: "ms-bl-1", label: "Uppstart och gemensam målbild med ledningen", date: "2026-02-12", status: "genomford" },
      { id: "ms-bl-2", label: "Individuella coachningsöverenskommelser klara", date: "2026-03-06", status: "genomford" },
      { id: "ms-bl-3", label: "Gemensam halvtidsavstämning", date: "2026-06-04", status: "genomford" },
      { id: "ms-bl-4", label: "Uppföljande ledningsdialog", date: "2026-09-03", status: "kommande" },
      { id: "ms-bl-5", label: "Programöversikt och avslut", date: "2026-10-15", status: "kommande" },
    ],
    nextReview: { label: "Uppföljande ledningsdialog", date: "2026-09-03" },
    sponsorReporting:
      "På organisationsnivå rapporteras deltagande, genomförda sessioner, programstatus och övergripande teman på aggregerad nivå. Individuella samtalsinnehåll, reflektioner och coachanteckningar delas aldrig.",
  },
  {
    id: "eng-nordic-industrial",
    organisationId: "org-nordic-industrial",
    title: "Executive Leadership Programme 2026",
    kind: "program",
    kindLabel: "Ledarskapsprogram för seniora chefer",
    purpose:
      "Att stärka koncernens seniora ledare i strategiskt beslutsfattande, ägarskap och samspel över affärsområdesgränser.",
    scopeNote: "Tolv deltagare, individuell coaching kombinerad med fyra gemensamma programgenomgångar.",
    periodLabel: "februari – november 2026",
    startDate: "2026-02-04",
    endDate: "2026-11-19",
    status: "pagaende",
    participantIds: [
      "klient-helena-waller",
      "klient-markus-ek",
      "klient-anette-rosen",
      "klient-david-lindqvist",
      "klient-farah-haddad",
      "klient-gustav-almqvist",
      "klient-ingela-strand",
      "klient-joakim-persson",
      "klient-lina-forsberg",
      "klient-mattias-holm",
      "klient-nina-berglund",
      "klient-oskar-wikstrom",
    ],
    milestones: [
      { id: "ms-ni-1", label: "Programstart och gemensam riktning", date: "2026-02-04", status: "genomford" },
      { id: "ms-ni-2", label: "Programgenomgång 1 – ledarskap i komplexitet", date: "2026-04-15", status: "genomford" },
      { id: "ms-ni-3", label: "Programgenomgång 2 – beslut och ägarskap", date: "2026-06-10", status: "genomford" },
      { id: "ms-ni-4", label: "Programgenomgång 3 – samspel över affärsområden", date: "2026-09-16", status: "kommande" },
      { id: "ms-ni-5", label: "Programöversikt och avslutande reflektion", date: "2026-11-19", status: "kommande" },
    ],
    nextReview: { label: "Programgenomgång 3 – samspel över affärsområden", date: "2026-09-16" },
    sponsorReporting:
      "Sponsor får programstatus, deltagandegrad, genomförda och kommande aktiviteter samt övergripande utvecklingsteman. Inga individuella reflektioner, insikter eller coachanteckningar ingår.",
  },
];
