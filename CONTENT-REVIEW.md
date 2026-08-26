# Copy pending customer approval (⚑)

Meningar markerade ⚑ i koden innehåller åtaganden om tid, hantering eller process som måste godkännas innan produktionssättning.

## Grundprincip: kommersiell neutralitet

**Priser och kommersiella paket är inte fastställda av kund och ska inte renderas publikt innan uttryckligt godkännande.**

Det gäller priser, från-priser, prisintervall, fasta paket, offertmodeller, investeringsrubriker och minimiomfattningar. Ingen svensk publik sida renderar i dag pris- eller paketcopy. `src/components/pricing-block.tsx` och `content/pricing.ts` finns kvar som intern infrastruktur men anropas inte längre från någon svensk publik sida — koppla inte in dem igen utan uttryckligt godkännande.

## Fortfarande pending

**Inga ej godkända claims återstår i den svenska publika copyn.**

Samtliga tids-, format-, resultat-, process- och kommersiella påståenden som saknade kundgodkännande är borttagna eller neutraliserade. Registret nedan finns kvar som spårbarhet över vad som togs bort och varför.

Två principer gäller fortsatt vid framtida ändringar:

1. Priser och kommersiella paket är inte fastställda av kund och ska inte renderas publikt innan uttryckligt godkännande.
2. Konfidentialitet får beskrivas som princip, men inte som exakt återrapporteringsmodell, gallringstid eller dataprocess innan detta är beslutat.

## Borttaget i copy-passen augusti 2026

Följande ej godkända påståenden finns inte längre i koden och behöver inte godkännas:

**Tids- och resultatlöften**
- "Normalt inom de två första samtalen." (startsidan)
- "Från öppen fråga till definierat nästa steg, normalt inom två samtal." (Executive coaching)
- "Första samtalet är kostnadsfritt, 45 minuter och konfidentiellt." (startsidan, kontakt, megamenyn)
- "Svar inom en arbetsdag." (kontaktformuläret och bekräftelsemejlet)

**Fasta format och programlängder**
- "Sex till åtta samtal över ett halvår" (startsidan, Executive coaching, Individuell coaching)
- "Grupper om sex till tio chefer." (Coachande ledarskap)
- "Fem tillfällen à tre timmar över ett halvår." (Coachande ledarskap, även i metadata)
- "Träning i coachande samtal mellan tillfällena, tillämpad i den egna gruppen." (Coachande ledarskap)
- "Individuell avstämning per deltagare vid halvtid." (Coachande ledarskap)
- "Avslutande utvärdering mot de mål som sattes vid start, återrapporterad till uppdragsgivaren." (Coachande ledarskap)
- Halvtidsavstämning och rapporteringssteg i startsidans uppdragsmodell

**Kommersiella claims**
- Hela sektionen "Omfattning och investering" på startsidan, Individuell coaching, Business coaching, Executive coaching, Ledningsgruppscoaching, Teamcoaching och Coachande ledarskap
- "Investering:" som etikett
- "Offereras per uppdrag efter ett första samtal om nuläget." (Teamcoaching)
- "Programmet offereras per uppdrag … Från" (Coachande ledarskap)
- Prisstrukturen "En ledare / En ledningsgrupp / En hel organisation" (startsidan)
- "Priset följer omfattningen, inte titeln." och motsvarande prisuppgiftsformuleringar

**Konfidentialitet och process**
- "normalt måluppfyllelse och närvaro, aldrig samtalsinnehåll" (Om Carolina)
- "Anteckningar förvaras separat från uppdragsgivarens system och raderas senast tolv månader efter avslutat uppdrag. Personuppgifter behandlas enligt dataskyddsförordningen." (Om Carolina)
- "Mål, omfattning och sekretess fastställs skriftligt innan arbetet börjar." → nu "är överenskomna innan arbetet börjar" (Business coaching)
- "Vad som återrapporteras till beställaren avtalas i förväg och skriftligt." → nu "Vad som återkopplas till beställaren bestäms i förväg." (Business coaching)
- "Avstämning mot målen under uppdragets gång, inom ramen för överenskommen sekretess." → nu utan sekretessprocedur (Business coaching)

**Effektpåståenden**
- "Effekten syns först i kvaliteten på vardagens ledarsamtal, därefter i hur snabbt problem kommer upp till ytan." (Coachande ledarskap)

**Övrigt**
- "Det är också utgångspunkten i samtalen: besluten prövas i affärsmässiga termer." (Om Carolina)

## Noterat: engelska sajten

`/en` ligger utanför det svenska copy-arbetet och har kvar den gamla positioneringen, de gamla programformaten och pris-/investeringssektionerna. Den ska hanteras i ett eget pass efter att svensk copy är slutligt godkänd. Fram till dess bör den betraktas som ej produktionsklar.
