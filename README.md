# CVB Coaching

Webbplats och inloggad portal för CVB Coaching (Carolina von Braun).
Next.js 16 (App Router), React 19, Tailwind CSS v4 och GSAP.

## Kom igång

```bash
npm install
npm run dev
```

Öppna http://localhost:3000.

| Skript | Gör |
| --- | --- |
| `npm run dev` | Utvecklingsserver |
| `npm run build` | Produktionsbygge |
| `npm run start` | Kör produktionsbygget |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript utan emit |
| `npm run test` | Enhetstester (Vitest) |
| `npm run test:db` | Databasintegrationstester mot produktionens behörighetsmodell (kräver Docker) |

## Struktur

```
src/app/                    publika sidor (sv) + /en (engelska) — live på https://cvbcoaching.se/
src/app/cvb-base/           coachprodukten CVB Base (kräver inloggning)
src/app/klient/             klientportalen (kräver inloggning)
src/app/api/portal/         auth-, AI- och arbetsflödes-endpoints (server-side)
src/components/portal/      portalens UI-komponenter
src/lib/portal/             domänmodell, testdata, accesslager, session
src/lib/ai/                 OpenAI-integration, kontextbygge, kontextlås
tests/                      enhetstester
```

## Persistens — läs detta först

**Publik webbplats:** https://cvbcoaching.se/ är live.

**CVB Base och klientportalen** använder Supabase som primärt persistenslager:
Auth, tabeller, RLS, Storage och säkerhetsdefinierade RPC:er. Inloggning sker via
Supabase Auth — inte via en egen sessionscookie.

**Pilot/demo-data:** innehållet i databasen är fiktivt (se migrations under
`supabase/migrations/`). Det är produktionssatt arkitektur med demodata — inte
bevis på att verkliga coachingklienter använder systemet i produktion.

Konkret:

- **Seed-data** (`src/lib/portal/data/`) är statisk och deterministisk. Den
  används i enhetstester och som referens för domänmodellen.
- **Runtime-data** läses och skrivs via Supabase (`fetchPortalRepositoryData`,
  klient- och coach-API:er, RPC:er). Reflektioner, förberedelse, åtaganden,
  coachanteckningar och godkända sessionssammanfattningar persisteras i databasen.
- **Demo-state-cookie** (`cvb_demo_state`) är kvar som läsbar legacy på några
  coachvyer men skrivs inte längre av API:erna efter Supabase-migreringen.

Data-access är abstraherat i `src/lib/portal/repository.ts`:

- rena `build*`/`list*` som tar en `PortalRepositoryData`-ögonblicksbild och är
  enhetstestade
- tunna `get*`-omslag som hämtar ögonblicksbilden från Supabase via RLS

### Databasbehörigheter och migreringar

Produktionsprojektet ger **inga** data- eller EXECUTE-rättigheter till `anon`,
`authenticated` eller `service_role` på nya objekt i `public`. Varje migrering
måste därför själv `GRANT`a exakt det applikationen gör — en RLS-policy utan
matchande GRANT nekas med 42501 innan policyn ens utvärderas. Lokal Supabase
(och Supabase-imagen) ger däremot allt per default, så en saknad GRANT syns
inte lokalt. Så uppstod kalender- och coachprofilfelen 2026-10-14.

`npm run test:db` kör alla migreringar i en isolerad engångscontainer med
produktionens default privileges och testar sedan som portalens egna roller
(aldrig `service_role`): behörigheter för varje tabell- och RPC-anrop
(`tests/db/20_privileges.sql`), coach/klient-isolering, samtyckesgränsen,
kalendern, mötesavslut och `plpgsql_check` av alla funktioner. Ett nytt
`.from()`/`.rpc()`-anrop i koden kräver en rad i `20_privileges.sql`.

**Produktionssättning av en migrering**

1. Kör `npm run test:db` — grönt krävs.
2. Applicera migreringen på produktionen via Supabase (MCP `apply_migration`
   eller SQL-editorn som migrering). Plattformen registrerar då sin egen
   version (tidsstämpel för appliceringen).
3. Läs den registrerade versionen (`supabase_migrations.schema_migrations`) och
   döp om den lokala filen till exakt den versionen innan commit, så att repo
   och produktion har samma historik.
4. Commit och push.

**Kör inte `supabase db push` mot produktionen.** Tre äldre migreringar har
olika versionsnummer i repot och i produktionens register (samma innehåll):

| Repo | Produktion |
| --- | --- |
| `20261003100000_general_terms_version_2026_10_03` | `20261003092107` |
| `20261012120000_cvb_base_client_invitations` | `20261012030441` |
| `20261014120000_cvb_base_availability_table_grants` | `20261014124441` |

`db push` skulle betrakta dem som oapplicerade. Att normalisera historiken
(`supabase migration repair` eller omdöpning av filerna) är ett separat beslut
som inte är genomfört.

## Portalen

Två separata ingångar, ingen publik registrering:

| Roll | Väg | Demokonto |
| --- | --- | --- |
| Klient | **Klientportal** i huvudnavigationen → `/klient-login` → `/klient` | `emma@northlinestudio.se` |
| Coach | `/carolina` → `/cvb-base` | `carolina@cvbcoaching.se` |

`/coach-login` och `/logga-in` redirectar till `/carolina` så att bokmärken fungerar.

Lösenordet styrs av `PORTAL_DEMO_PASSWORD`; utan variabel används `cvb-demo-2026`.
Inloggningsvyerna förifyller uppgifterna så att demon kan köras utan instruktion —
sätt `PORTAL_SHOW_DEMO_HINT=false` för att stänga av det.

Rollen ligger i den signerade sessionen. En klientsession ger aldrig coachåtkomst,
och ett klientkonto kan inte logga in via coachformuläret.

### Demo reset

```bash
npm run reset:demo
```

Raderar bara den äldre demo-state-cookien (`cvb_demo_state`) i webbläsaren.
Ingen databaspost påverkas. Endpointen kräver coachsession — klienten kan
aldrig anropa den. Det finns ingen återställningsknapp i portalen.

**Demodata:** databasen innehåller fiktiva seed-poster (klienter, uppdrag,
sessioner, avtal, dokument) bredvid poster som skapats i portalen. Demoposter
tas inte bort automatiskt.

### Sekretessnivåer

| Nivå | Innehåll | Syns för |
| --- | --- | --- |
| `coach` | Coachens privata arbetsanteckningar | Endast coachen |
| `coach_klient` | Utvecklingsmål, reflektioner, insikter, åtaganden, godkända sammanfattningar | Coach och klient |
| `organisation` | Deltagande, sessionsantal, programstatus, milstolpar | Uppdragsgivare |

Coachens privata anteckningar ingår i AI-underlaget **endast** när Carolina
arbetar med sin egen klient i coachläge — de är hennes arbetsmaterial och hjälper
henne tänka. De når aldrig klientvyn, organisationsnivån, någon rapport eller
någon annan klients kontext. Modellen instrueras uttryckligen att aldrig
formulera dem som något som kan delas vidare.

## AI

Tre funktioner, alla server-side:

| Endpoint | Funktion |
| --- | --- |
| `POST /api/portal/ai/klient` (`mode: "forbered"`) | Förbered nästa session |
| `POST /api/portal/ai/klient` (`mode: "fraga"`) | Fråga om aktuell klient |
| `POST /api/portal/ai/organisation` | Fråga om aktuellt uppdrag |
| `POST /api/portal/ai/sessionssammanfattning` | Strukturera anteckningar till utkast |
| `POST /api/portal/mote/sammanfattning` | Godkänn och dela sessionssammanfattning med klienten |

### Kontextlås

AI:n är låst till den klient eller det uppdrag som är öppen. Frontend skickar
endast context-ID, context-typ och frågan. Servern:

1. verifierar sessionen,
2. verifierar åtkomst till vald klient/organisation via `src/lib/portal/repository.ts`,
3. bygger underlaget deterministiskt i `src/lib/ai/context.ts`,
4. avvisar frågor utanför kontexten (`src/lib/ai/scope.ts`),
5. anropar OpenAI.

Modellen kan alltså inte välja att läsa data från en annan klient.
Testerna i `tests/isolation.test.ts` verifierar detta.

### Modell

Anropen går mot OpenAI Responses API. Primär modell är **`gpt-5.6` (GPT-5.6 Sol)**.

`reasoning.effort` sätts till `high` för **Förbered nästa session** och för fria
frågor om aktuell klient, eftersom de kräver syntes över hela klienthistoriken.

Reservkedjan `gpt-5.1` → `gpt-5` → `gpt-4.1` är enbart en teknisk reserv och
används **endast** om den primära modellen saknas i kontot. Nätverksfel,
timeout, 429 och 5xx byter aldrig modell — anropet misslyckas i stället tydligt
så att felet syns i stället för att kvaliteten tyst degraderas.

Saknas `OPENAI_API_KEY` fungerar portalen som vanligt; AI-anropen svarar då med
ett tydligt svenskt meddelande i stället för att krascha.

## Legal routes

Publika, statiskt renderade juridiska sidor (svenska och engelska):

| Svenska | Engelska | Innehåll |
| --- | --- | --- |
| `/integritet` | `/en/integritet` | Integritetspolicy |
| `/villkor` | `/en/villkor` | Allmänna villkor för coaching, inkl. ångerrätt och standardformulär |
| `/cvb-base-villkor` | `/en/cvb-base-villkor` | Användarvillkor för CVB Base |
| `/cookies` | `/en/cookies` | Cookiepolicy (endast nödvändig inloggningscookie — ingen banner) |

Texterna ligger i `src/lib/legal/content/`, identitetsuppgifterna i
`src/lib/legal/company.ts`. CVB Coaching drivs i dag av Carolina von Braun som
privatperson, som därför är personuppgiftsansvarig och avtalspart. När
verksamheten registreras fylls `registration` i där — företagsform,
registrerat namn och organisationsnummer visas då automatiskt.
Länkar finns i sidfoten, vid bokningsformulärets skicka-knapp, på
inloggningssidorna och under Profil i klientportalen.

### Privacy / Terms

Texterna beskriver den faktiska implementationen (dataflöden, AI-underlag,
leverantörer, cookies). Ändras koden ska texten ändras — se
`docs/legal-compliance.md`. AI-anropen görs med `store: false`.

### Consumer withdrawal flow

Varje avtal klassas uttryckligen som `consumer` eller `business`
(`contracts.counterparty_type`) innan det kan skickas — aldrig härlett från
organisation. För konsumentavtal:

- avtalet ingås när coachen kontrasignerar; ångerfristen (14 dagar, förlängd
  över helg/helgdag) räknas server-side från `coach_signed_at`,
- klienten kan ångra via **Ångra avtalet här** på avtalet i CVB Base
  (`POST /api/portal/avtal/[id]/angra` → RPC `exercise_contract_withdrawal`),
  redan från sin egen signatur och till och med fristens sista dag,
- ångringen är idempotent, lagras i `contract_withdrawals` (append-only) och
  rör aldrig status eller signaturer,
- mottagningsbevis till klienten och notis till Carolina går via samma
  outbox-mönster som bokningsmejlen; misslyckade utskick syns under
  *Mejl som behöver skickas om* och kan skickas om,
- en begäran om tidig start är ett separat, frivilligt val vid signering,
- vid kontrasignering köas en avtalsbekräftelse (hela avtalet + villkor) till
  klienten i samma transaktion och skickas efter commit; den kan skickas om.

Samtycke till behandling av känsliga personuppgifter (art. 9) lämnas och
återkallas av klienten under Profil. Utan aktivt samtycke ingår inget
samtalsinnehåll i AI-underlaget; efter återkallelse begränsas tidigare innehåll
och klienten kan begära radering. Varje avtal låser den villkorsversion som
gällde när det skickades — se `docs/legal-compliance.md`.

Företagsavtal har ingen ångerfunktion.

## Environment variables

Se `.env.example`. Kopiera till `.env.local` lokalt.

| Variabel | Krävs | Beskrivning |
| --- | --- | --- |
| `OPENAI_API_KEY` | Ja, för AI | OpenAI-nyckel. Endast server-side. |
| `OPENAI_MODEL` | Nej | Låser en annan modell än den primära `gpt-5.6`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Ja för CVB Base | Supabase-projektets URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Ja för CVB Base | Supabase publishable key. |
| `PORTAL_DEMO_PASSWORD` | Nej | Lösenord för demokontot. |
| `PORTAL_SHOW_DEMO_HINT` | Nej | `false` döljer den förifyllda demoinloggningen. |
| `EMAIL_SEND_ENABLED` | Ja för skarp e-post | Måste vara exakt `true`. Allt annat ger simulerat läge där inget skickas. Endast server-side. |
| `RESEND_API_KEY` | Ja när e-post är på | Nyckel till e-postleverantören. Endast server-side. |
| `EMAIL_FROM` | Ja när e-post är på | Verifierad avsändaridentitet. Endast server-side. |
| `BOOKING_OPERATOR_EMAIL` | Nej | Mottagare för operatörsnotiser om nya förfrågningar. Utan värde används portalens etablerade coachadress. Endast server-side. |

### Vercel

Lägg in följande i projektets **Environment Variables** (Production och Preview)
innan live-demo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- valfritt: `OPENAI_MODEL`, `PORTAL_DEMO_PASSWORD`, `PORTAL_SHOW_DEMO_HINT`

För skarpa bokningsmejl krävs dessutom `EMAIL_SEND_ENABLED=true`,
`RESEND_API_KEY` och `EMAIL_FROM` — och `EMAIL_SEND_ENABLED` sätts till `true`
endast i den miljö som faktiskt ska skicka. Ingen av e-postvariablerna får
`NEXT_PUBLIC_`-prefix; med det prefixet hamnar värdet i webbläsarbundeln.

Deployprocessen för bokningsflödet beskrivs i
`docs/cvb-p0a-public-booking-release.md`.

Secrets committas aldrig i repot.
