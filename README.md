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
src/app/                    publika sidor (sv) + /en (engelska)
src/app/logga-in/           inloggning till portalen
src/app/portal/             inloggad portal (kräver session)
src/app/api/portal/         auth- och AI-endpoints (server-side)
src/components/portal/      portalens UI-komponenter
src/lib/portal/             domänmodell, testdata, accesslager, session
src/lib/ai/                 OpenAI-integration, kontextbygge, kontextlås
tests/                      enhetstester
```

## Persistens — läs detta först

Nuvarande klientdata är fiktiv demodata. Persistenslagret är avsiktligt begränsat
tills CVB Coaching-konceptet är godkänt. Produktionsversionen ska använda ett
separat persistent datalager med auth och RLS.

Konkret:

- **Seed-data** (`src/lib/portal/data/`) är statisk och deterministisk. Den är
  källan för klienter, uppdrag, sessioner, insikter och dokument.
- **Demo-state** är det klienten själv lägger till i portalen: reflektioner,
  förberedelse inför nästa samtal och statusändringar på åtaganden. Det lagras
  i en HMAC-signerad httpOnly-cookie (`cvb_demo_state`) och färdas med varje request.

Cookien valdes för att den fungerar identiskt på varje serverless-instans. Ett
filsystem gör inte det: på Vercel är filsystemet skrivskyddat, `/tmp` är
instansbundet och processminne försvinner mellan anrop. Ingen del av koden antar
att lokala filskrivningar överlever.

| | Demo-state i cookie |
| --- | --- |
| Överlever refresh | Ja |
| Överlever utloggning och ny inloggning | Ja |
| Överlever omstart av webbläsaren | Ja (30 dagar) |
| Fungerar på alla serverless-instanser | Ja |
| Delas mellan klient- och coachinloggning i samma webbläsare | Ja — det är vad demoflödet bygger på |
| **Synkas mellan olika enheter eller webbläsare** | **Nej** |

Den sista raden är den verkliga begränsningen. Emma och Carolina måste
demonstreras i samma webbläsare. Det är ett medvetet val, inte en bugg, och
försvinner när ett riktigt datalager kopplas in.

### Migrering till databas

Data-access är abstraherat i `src/lib/portal/repository.ts`. Funktionerna finns
i två former:

- rena `build*`/`list*` som tar ett `DemoState` och är enhetstestade
- tunna `get*`-omslag som läser tillståndet

Vid migrering byts bara omslagen mot databasanrop. UI, domänmodell och AI-lager
är oberoende av var datan kommer ifrån.

## Portalen

Två separata ingångar, ingen publik registrering:

| Roll | Väg | Demokonto |
| --- | --- | --- |
| Klient | **Klientportal** i huvudnavigationen → `/klient-login` → `/klient` | `emma@northlinestudio.se` |
| Coach | Diskret i footern → `/coach-login` → `/portal` | `carolina@cvbcoaching.se` |

`/logga-in` finns kvar som redirect till `/coach-login` så att bokmärken fungerar.

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
| `PORTAL_SESSION_SECRET` | Ja i produktion | Signerar sessionscookien. `openssl rand -base64 32`. |
| `PORTAL_DEMO_PASSWORD` | Nej | Lösenord för demokontot. |
| `PORTAL_SHOW_DEMO_HINT` | Nej | `false` döljer den förifyllda demoinloggningen. |

### Vercel

Lägg in följande i projektets **Environment Variables** (Production och Preview)
innan live-demo:

- `OPENAI_API_KEY`
- `PORTAL_SESSION_SECRET`
- valfritt: `OPENAI_MODEL`, `PORTAL_DEMO_PASSWORD`, `PORTAL_SHOW_DEMO_HINT`

Secrets committas aldrig i repot.
