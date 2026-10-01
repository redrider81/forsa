# Legal compliance — intern översikt

Senast uppdaterad 2026-10-01. Beskriver vad som finns i koden, inte juridisk rådgivning.

## Legal-sidor

| Route | Källa |
| --- | --- |
| `/integritet`, `/en/integritet` | `src/lib/legal/content/privacy.ts` |
| `/villkor`, `/en/villkor` | `src/lib/legal/content/terms.ts` |
| `/cvb-base-villkor`, `/en/cvb-base-villkor` | `src/lib/legal/content/base-terms.ts` |
| `/cookies`, `/en/cookies` | `src/lib/legal/content/cookies.ts` |

Renderas av `src/components/legal/legal-document-page.tsx`. Den svenska texten
gäller vid skillnad. Ändras dataflödena nedan ska texterna ändras samtidigt;
`tests/legal-pages.test.ts` fångar förbjudna påståenden (t.ex. "GDPR-säker",
modellnamn, platshållare, icke-publika adresser).

## Personuppgiftsbiträden och dataflöden

| Leverantör | Funktion | Data |
| --- | --- | --- |
| Supabase (eu-central-1, Frankfurt) | Databas, Auth, Storage | Allt i CVB Base och publika bokningsförfrågningar |
| Vercel | Hosting, serverfunktioner | Förfrågningar, IP, loggar |
| OpenAI | AI-stöd för Carolina (`src/lib/ai/`) | Klientkontext enligt `src/lib/ai/context.ts`: profil, överenskommelse, mål, sessioner, godkända sammanfattningar, förberedelse, reflektioner, insikter, åtaganden, dokumenttitlar och Carolinas anteckningar. **Aldrig material/filer.** Organisationsläget får ingen samtalsdata. Anrop med `store: false`. |
| Resend | E-post | Bokningsmejl, ångerkvitto, notiser till Carolina |

Alla fyra är amerikanska företag; policyn anger tredjelandsöverföring med stöd
av DPF eller standardavtalsklausuler.

Cookies: endast Supabase Auth (`sb-…-auth-token`). Ingen analytics, ingen
localStorage. `cvb_demo_state`/`cvb_demo_materials` skrivs inte längre.

## B2C/B2B

`contracts.counterparty_type` (`consumer` | `business`), NULL = ej klassat.
Coachen väljer vid skapande eller på utkastet (RPC
`set_contract_counterparty_type`). Sändning och klientsignering kräver värde.
Befintliga avtal backfilldes inte; de fem demoavtalen klassades som `business`
i den separata demomigrationen `20260930090100`.

## Online-ångerfunktion (lag 2005:59, från 2026-06-19)

- Avtalet ingås vid coachens kontrasignering. `withdrawal_deadline` sätts då
  server-side: Stockholmsdatum + 14 dagar, förlängt över lördag, söndag,
  helgdag och midsommar-/jul-/nyårsafton (`contract_withdrawal_deadline`).
- Klienten kan ångra från egen signatur till fristens slut. Efter ångring kan
  coachen inte kontrasignera.
- `exercise_contract_withdrawal` (SECURITY DEFINER): endast klient, eget
  avtal, konsument, inom frist; idempotent; skriver `contract_withdrawals`
  (append-only, trigger blockerar UPDATE, FK `on delete restrict`) och två
  outbox-rader i samma transaktion.
- Mejl skickas efter commit (`src/lib/portal/contract-withdrawal.ts`) via
  befintlig Resend-provider med idempotensnyckel; fel syns i coachens
  dashboard och kan skickas om (`/api/portal/avtal/[id]/angra/skicka-om`).
- Tidig start: separat, frivillig kryssruta vid signering →
  `early_performance_requested_at` (bara konsumentavtal).

## Avtalsbekräftelse (varaktigt medium)

När ett konsumentavtal kontrasigneras köar `sign_contract_as_coach` exakt en rad
i `contract_confirmation_notifications` i samma transaktion. Efter commit
renderas ett fristående textmejl (`src/lib/email/contract-confirmation-email.ts`):
parter, avtals-id och version, tidpunkt för ingående, pris, valuta,
betalningsvillkor, hela avtalstexten och fälten, ångerrätt med sista dag,
hänvisning till "Ångra avtalet här", status för tidig start samt de fullständiga
allmänna villkoren i aktuell version. Ämne och text sparas en gång på raden och
återanvänds vid varje omskick. Misslyckat utskick syns i dashboarden och kan
skickas om; signering påverkas aldrig. Företagsavtal köar ingen bekräftelse.

## Känsliga personuppgifter (art. 9)

`special_category_consents`: en rad per samtycke (`consent_version`, `scope`,
`granted_at`, `withdrawn_at`, vem), högst ett aktivt per klient, endast
övergången till återkallat tillåts. Bara klienten kan lämna/återkalla via
RPC (Profil → Känsliga personuppgifter); Carolina ser läget på klientsidan.

AI-spärr per datakälla (`src/lib/ai/context.ts`, ingen textklassificering):
utan aktivt samtycke ingår inte sessionernas fokus/innehåll, sammanfattningar,
förberedelser, reflektioner, insikter, åtaganden, klientens egna ord,
återkommande teman eller Carolinas anteckningar; utkast till
sessionssammanfattning nekas. Organisationskontexten innehåller aldrig
individuellt samtalsinnehåll. Ändras samtyckestexten måste en ny version läggas
till i både `special-category-consent-rules.ts` och RPC:n.

Efter återkallelse (WITHDRAWN, senaste återkallelse T) begränsas allt
samtyckesomfattat innehåll skrivet t.o.m. T: det filtreras bort i den enda
läsvägen (`fetchPortalRepositoryData`) för coach, AI och appens funktioner;
klienten ser fortfarande sitt eget (`viewer: "klient"`). Klienten kan begära
radering (Profil); Carolina genomför den på klientsidan
(`erase_special_category_content`, samma predikat som läsvägen). Raderingen rör
aldrig avtal, signaturer, ångerposter, bekräftelser eller samtyckeshistoriken.
Nytt innehåll efter T är vanlig data; klienten uppmanas vid fritextfälten att
inte lämna känsliga uppgifter. Nytt samtycke = ny rad, normal behandling igen.

Predikat (tidsstämplar som en senare ändring inte kan flytta): reflections,
insights, commitments, session_coach_notes och sessions (fokusfälten) på
`created_at`; session_preparations på `client_saved_at` (sätts av trigger
endast vid klientens egen sparning); session_summaries på `approved_at`;
målets egna ord/utgångsläge och återkommande teman så länge WITHDRAWN.

Samtyckesfönster (icke-retroaktivt): ett fönster är `[granted_at, withdrawn_at)`.
Klientskrivet innehåll (reflektioner, förberedelser via `client_saved_at`,
åtagandenas klientnotering via `updated_at`) når Carolina bara om det skrevs
inom ett fönster; annars är det privat för klienten — även efter ett senare
samtycke. För AI-underlag (`fetchPortalRepositoryData({ purpose: "ai" })`)
krävs fönster för alla samtyckesomfattade källor, även Carolinas egna
(coachanteckningar, insikter, åtagandetext, sammanfattningar, sessionsfokus via
`focus_written_at`);
målets egna ord/utgångsläge och teman saknar stabil tidsstämpel och ingår därför
aldrig i AI-underlag. Carolina ser en neutral notis när privat innehåll finns
(`countClientPrivateContent`, läser aldrig text). Raderingsflödet är oförändrat:
det omfattar innehåll t.o.m. återkallelsen; privat innehåll skrivet senare kan
klienten själv ta bort.

Databasnivå (`20261001110000_cvb_base_consent_database_enforcement`): samma
gräns gäller även för rå Supabase REST/PostgREST, inte bara i läsvägen.
Regel: klienten läser alltid sitt eget; coachen läser klientskrivet innehåll
bara när klienten har ett aktivt samtycke och innehållet skrevs inom ett
fönster (`special_category_coach_may_read`, falskt för alla utom ägande coach).

- `reflections`: restriktiv RLS-policy (SELECT) ovanpå de befintliga.
- `commitments.client_note`: kolumnen är inte längre läsbar för
  `authenticated`; läses via `read_commitment_client_notes()`.
- `session_preparations`: textkolumnerna är inte läsbara direkt; läses via
  `read_session_preparations()` som maskerar per fält. Klienten sparar via
  `save_own_session_preparation(...)`. `follow_up` skrivs av båda parter:
  `follow_up_author`/`follow_up_saved_at` sätts av trigger när texten faktiskt
  ändras. Carolinas egen text ("Vad behöver utforskas?") visas alltid för
  henne; klientens gates som övriga klientfält. Äldre rader saknar författare
  och räknas som klientskrivna (gated, ingen backfill).
- `sessions.focus_written_at`: verklig skrivtid för fokusfälten (trigger;
  bokning/status flyttar den inte). AI-underlag kräver att den ligger i ett
  fönster; äldre rader (NULL) ingår aldrig i AI. Historisk begränsning och
  radering använder fortsatt `created_at`.
- `count_client_private_content(client_id)`: antal för coach-notisen, ingen text.

## Villkorsversion på avtalet

`contracts.general_terms_version` låses när avtalet skickas, bekräftas vid
klientens signering (måste vara samma) och ändras aldrig därefter (trigger).
Bekräftelsen renderar exakt den versionens text från registret i
`src/lib/legal/content/terms.ts`; klienten läser den på `/villkor/<version>`.
Äldre avtal får ingen påhittad backfill (NULL = äldre avtal); ett äldre skickat
avtal får den version klienten bekräftar vid signering. Ny villkorstext: frys
den gamla i registret, lägg till versionen i `terms-versions.ts` och i RPC:ernas
lista.

## Migreringsordning vid release

Produktion har t.o.m. `20260908090000`. Kör i ordning:

1. `20260911010000_cvb_base_approve_session_summary`
2. `20260930090000_cvb_base_consumer_withdrawal`
3. `20260930090100_cvb_base_contract_counterparty_demo`
4. `20261001090000_cvb_base_contract_confirmation`
5. `20261001090100_cvb_base_special_category_consent`
6. `20261001100000_cvb_base_special_category_post_withdrawal`
7. `20261001100100_cvb_base_contract_terms_version`
8. `20261001110000_cvb_base_consent_database_enforcement`

Driftsätt koden direkt därefter. Migration 8 drar in läsrätten på
`commitments.client_note` och förberedelsernas textkolumner; nuvarande
produktionskod läser dem direkt och fungerar därför inte förrän den nya koden
är driftsatt.

## Identitet

`src/lib/legal/company.ts`. CVB Coaching drivs av Carolina von Braun som
privatperson — hon är personuppgiftsansvarig och avtalspart. Adress Skårsgatan
53, 412 69 Göteborg; juridisk kontakt carolina@cvbcoaching.se (info@ används
fortfarande i sidfot och strukturerad data). Ingen företagsform, inget
organisationsnummer och inget personnummer publiceras.

När verksamheten registreras: fyll i `registration` (registrerat namn,
företagsform sv/en, organisationsnummer). Sidorna visar då uppgifterna och
namnger det registrerade företaget som ansvarig och avtalspart utan
textändringar. Detta är ingen release-blockerare.

Telefon: inget verifierat publikt nummer finns, så inget visas (`phone: null`).

## Kända luckor att besluta om

- Publika bokningsförfrågningar saknar gallringsfunktion; policyn anger
  kriteriebaserad lagring.
- Permanent radering av klient tar inte bort Supabase Auth-kontot; sker på
  begäran.
- Personuppgiftsbiträdesavtal med de fyra leverantörerna bör bekräftas.
