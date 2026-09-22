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

Nollställer det klienten lagt till. Samma funktion finns för coachen under
**Profil → Återställ demoläge**. Endpointen kräver coachsession — klienten kan
aldrig anropa den.

**All data i portalen är fiktiv.** Inga verkliga klientuppgifter förekommer.

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
