-- CVB Base — demo/test data for currently implemented features (Avtal,
-- client lifecycle, booking, meeting context). DATA ONLY: no schema, RLS,
-- or RPC changes. Idempotent — safe to run more than once. Uses only
-- existing clients and the one existing authenticated demo accounts
-- (coach Carolina, client Emma Lind). No new auth users are created.

do $$
declare
  v_coach_id uuid := '289fc70a-53be-5bda-87de-d2fcc55f79c5';        -- Carolina von Braun
  v_coach_auth_id uuid := '1248867b-a010-4df4-a463-baba64d6b459';   -- Carolina's auth/profile id

  v_emma_id uuid := 'ddc48239-c366-55dd-90fb-3a33134b6055';         -- Emma Lind (client)
  v_emma_auth_id uuid := '1a92ab5c-9599-48de-9e51-76bb632fc512';    -- Emma's auth/profile id
  v_emma_engagement uuid;

  v_johan_id uuid := 'e6fa23cd-a855-5764-b459-ba4c44cf5c94';        -- Johan Bergström (deletable, UTKAST)
  v_johan_engagement uuid;

  v_ali_id uuid := '58c52833-4cd6-5fce-af14-528f0f3608b9';          -- Ali Demir (outgoing booking demo)

  v_nina_id uuid := '33838fa6-283a-57be-afff-9bb215eb864b';         -- Nina Berglund (ended client demo)

  v_contract_id uuid;
  v_version_id uuid;
begin
  select engagement_id into v_emma_engagement from public.clients where id = v_emma_id;
  select engagement_id into v_johan_engagement from public.clients where id = v_johan_id;

  -- ---------------------------------------------------------- A. templates

  insert into public.contract_templates (coach_id, name, title, content)
  select v_coach_id, 'Individuell coaching', 'Coachningsavtal – individuell coaching', '{
    "sections": [
      {"id": "s1", "heading": "Syfte och mål", "body": "Coachningen syftar till att stödja klienten i en tydligt definierad utvecklingsfråga, formulerad tillsammans vid uppstart."},
      {"id": "s2", "heading": "Uppdragets omfattning", "body": "Individuella samtal enligt överenskommen kadens, under den period som anges i avtalet."},
      {"id": "s3", "heading": "Genomförande", "body": "Sessionerna genomförs digitalt eller på plats enligt överenskommelse. Klienten ansvarar för att förbereda sig inför varje samtal."},
      {"id": "s4", "heading": "Sekretess", "body": "Samtalens innehåll är konfidentiellt mellan coach och klient. Ingen information delas med tredje part utan klientens samtycke."},
      {"id": "s5", "heading": "Ansvar och roller", "body": "Coachen ansvarar för processen och strukturen. Klienten ansvarar för sina egna beslut och sitt eget genomförande."},
      {"id": "s6", "heading": "Avbokning", "body": "Avbokning senast 24 timmar före bokad tid. Sen avbokning kan komma att debiteras."},
      {"id": "s7", "heading": "Pris och betalningsvillkor", "body": "Pris och betalningsvillkor anges nedan under respektive fält."},
      {"id": "s8", "heading": "Avtalstid", "body": "Avtalet gäller under den period som anges vid avtalets startdatum och avslutas när överenskommet antal sessioner är genomfört."},
      {"id": "s9", "heading": "Uppsägning", "body": "Endera part kan avsluta samarbetet med skälig varsel, enligt överenskommelse vid uppstart."},
      {"id": "s10", "heading": "Övriga villkor", "body": "Eventuella tillägg eller särskilda villkor anges här."}
    ],
    "fields": [
      {"id": "f1", "label": "Program", "type": "text", "value": "Individuell coaching", "options": []},
      {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "2 500", "options": []},
      {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "8", "options": []},
      {"id": "f4", "label": "Startdatum", "type": "datum", "value": "2026-09-01", "options": []},
      {"id": "f5", "label": "Fakturering", "type": "val", "value": "Månadsvis", "options": ["Månadsvis", "Kvartalsvis", "Vid uppstart"]}
    ]
  }'::jsonb
  where not exists (
    select 1 from public.contract_templates where coach_id = v_coach_id and name = 'Individuell coaching'
  );

  insert into public.contract_templates (coach_id, name, title, content)
  select v_coach_id, 'Executive coaching', 'Coachningsavtal – executive coaching', '{
    "sections": [
      {"id": "s1", "heading": "Syfte och mål", "body": "Coachningen stödjer klienten i en ledarroll med förhöjd komplexitet, med fokus på beslutsfattande, mandat och strategisk riktning."},
      {"id": "s2", "heading": "Uppdragets omfattning", "body": "Executive coaching enligt överenskommen kadens under avtalsperioden, med möjlighet till uppföljning mellan sessioner."},
      {"id": "s3", "heading": "Genomförande", "body": "Sessionerna genomförs digitalt eller på plats. Vid behov kan korta avstämningar ske mellan ordinarie sessioner."},
      {"id": "s4", "heading": "Sekretess", "body": "Samtalens innehåll är konfidentiellt. Ingen information delas med styrelse, ledning eller uppdragsgivare utan klientens uttryckliga samtycke."},
      {"id": "s5", "heading": "Ansvar och roller", "body": "Coachen ansvarar för processen. Klienten ansvarar för sina beslut och sitt agerande i rollen."},
      {"id": "s6", "heading": "Avbokning", "body": "Avbokning senast 24 timmar före bokad tid. Sen avbokning kan komma att debiteras."},
      {"id": "s7", "heading": "Pris och betalningsvillkor", "body": "Pris och betalningsvillkor anges nedan under respektive fält."},
      {"id": "s8", "heading": "Avtalstid", "body": "Avtalet gäller under den period som anges vid avtalets startdatum och löper till dess överenskommet program är genomfört."},
      {"id": "s9", "heading": "Uppsägning", "body": "Endera part kan avsluta samarbetet med skälig varsel enligt överenskommelse vid uppstart."},
      {"id": "s10", "heading": "Övriga villkor", "body": "Eventuella tillägg eller särskilda villkor anges här."}
    ],
    "fields": [
      {"id": "f1", "label": "Program", "type": "text", "value": "Executive coaching", "options": []},
      {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "4 500", "options": []},
      {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "10", "options": []},
      {"id": "f4", "label": "Startdatum", "type": "datum", "value": "2026-09-01", "options": []},
      {"id": "f5", "label": "Rabatt", "type": "procent", "value": "10", "options": []},
      {"id": "f6", "label": "Fakturering", "type": "val", "value": "Månadsvis", "options": ["Månadsvis", "Kvartalsvis", "Vid uppstart"]}
    ]
  }'::jsonb
  where not exists (
    select 1 from public.contract_templates where coach_id = v_coach_id and name = 'Executive coaching'
  );

  insert into public.contract_templates (coach_id, name, title, content)
  select v_coach_id, 'Företagsprogram', 'Avtal – ledarskapsprogram', '{
    "sections": [
      {"id": "s1", "heading": "Syfte och mål", "body": "Programmet stärker den samlade ledningsgruppens beslutsfattande, samspel och ägarskap över gemensamma frågor."},
      {"id": "s2", "heading": "Uppdragets omfattning", "body": "Individuell coaching för deltagarna kombinerat med gemensamma programgenomgångar under avtalsperioden."},
      {"id": "s3", "heading": "Genomförande", "body": "Individuella sessioner och gemensamma workshops enligt överenskommen plan."},
      {"id": "s4", "heading": "Sekretess", "body": "Individuellt samtalsinnehåll är konfidentiellt. På organisationsnivå rapporteras endast deltagande och övergripande teman."},
      {"id": "s5", "heading": "Ansvar och roller", "body": "Coachen ansvarar för programmets struktur och process. Sponsor ansvarar för organisatoriskt stöd och prioritering."},
      {"id": "s6", "heading": "Avbokning", "body": "Avbokning av enskilda sessioner senast 24 timmar i förväg. Programgenomgångar bokas om i samråd med sponsor."},
      {"id": "s7", "heading": "Pris och betalningsvillkor", "body": "Pris och betalningsvillkor anges nedan under respektive fält."},
      {"id": "s8", "heading": "Avtalstid", "body": "Avtalet gäller under den period som anges vid programmets startdatum till dess programmet är genomfört."},
      {"id": "s9", "heading": "Uppsägning", "body": "Förändringar i programmets omfattning hanteras i samråd mellan coach och sponsor med skälig varsel."},
      {"id": "s10", "heading": "Övriga villkor", "body": "Eventuella tillägg eller särskilda villkor anges här."}
    ],
    "fields": [
      {"id": "f1", "label": "Program", "type": "text", "value": "Ledarskapsprogram", "options": []},
      {"id": "f2", "label": "Pris totalt", "type": "belopp", "value": "180 000", "options": []},
      {"id": "f3", "label": "Antal deltagare", "type": "antal", "value": "12", "options": []},
      {"id": "f4", "label": "Startdatum", "type": "datum", "value": "2026-02-01", "options": []},
      {"id": "f5", "label": "Fakturering", "type": "val", "value": "Kvartalsvis", "options": ["Månadsvis", "Kvartalsvis", "Vid uppstart"]}
    ]
  }'::jsonb
  where not exists (
    select 1 from public.contract_templates where coach_id = v_coach_id and name = 'Företagsprogram'
  );

  -- ------------------------------------------ B/C/D. Emma — SKICKAT (manual signing)

  insert into public.contracts (
    coach_id, client_id, engagement_id, title, content,
    price_amount, currency, payment_terms, status, sent_at
  )
  select
    v_coach_id, v_emma_id, v_emma_engagement,
    'Executive coaching – hösten 2026',
    '{
      "sections": [
        {"id": "s1", "heading": "Syfte och mål", "body": "Coachningen stödjer Emma i övergången från operativ grundarroll till en tydligare strategisk vd-roll under hösten 2026."},
        {"id": "s2", "heading": "Uppdragets omfattning", "body": "Executive coaching, åtta sessioner under perioden september–december 2026."},
        {"id": "s3", "heading": "Genomförande", "body": "Sessionerna genomförs digitalt enligt överenskommen kadens, cirka varannan vecka."},
        {"id": "s4", "heading": "Sekretess", "body": "Samtalens innehåll är konfidentiellt. Ingen information delas med styrelse eller uppdragsgivare utan Emmas samtycke."},
        {"id": "s5", "heading": "Pris och betalningsvillkor", "body": "Faktureras månadsvis i förskott enligt angivet pris."},
        {"id": "s6", "heading": "Avtalstid", "body": "Avtalet löper september–december 2026."}
      ],
      "fields": [
        {"id": "f1", "label": "Program", "type": "text", "value": "Executive coaching", "options": []},
        {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "4 500 SEK", "options": []},
        {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "8", "options": []},
        {"id": "f4", "label": "Startdatum", "type": "datum", "value": "2026-09-01", "options": []}
      ]
    }'::jsonb,
    36000, 'SEK', 'Faktureras månadsvis i förskott', 'skickat', '2026-08-24 09:15:00+00'
  where not exists (
    select 1 from public.contracts where coach_id = v_coach_id and client_id = v_emma_id and title = 'Executive coaching – hösten 2026'
  );

  -- --------------------------------------------------- E. Emma — KUND SIGNERAD

  select id, version_id into v_contract_id, v_version_id
  from public.contracts
  where coach_id = v_coach_id and client_id = v_emma_id and title = 'Executive coaching – vårprogrammet 2026';

  if v_contract_id is null then
    insert into public.contracts (
      coach_id, client_id, engagement_id, title, content,
      price_amount, currency, payment_terms, status, sent_at, client_signed_at
    ) values (
      v_coach_id, v_emma_id, v_emma_engagement,
      'Executive coaching – vårprogrammet 2026',
      '{
        "sections": [
          {"id": "s1", "heading": "Syfte och mål", "body": "Uppföljande program för att befästa Emmas nya sätt att prioritera och delegera efter höstens coachning."},
          {"id": "s2", "heading": "Uppdragets omfattning", "body": "Sex uppföljande sessioner under våren 2026."},
          {"id": "s3", "heading": "Sekretess", "body": "Samtalens innehåll är konfidentiellt."},
          {"id": "s4", "heading": "Pris och betalningsvillkor", "body": "Faktureras vid uppstart enligt angivet pris."}
        ],
        "fields": [
          {"id": "f1", "label": "Program", "type": "text", "value": "Executive coaching, uppföljning", "options": []},
          {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "4 500 SEK", "options": []},
          {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "6", "options": []},
          {"id": "f4", "label": "Fakturering", "type": "val", "value": "Vid uppstart", "options": ["Månadsvis", "Kvartalsvis", "Vid uppstart"]}
        ]
      }'::jsonb,
      27000, 'SEK', 'Faktureras vid uppstart', 'kund_signerad', '2026-08-10 08:30:00+00', '2026-08-12 16:42:00+00'
    )
    returning id, version_id into v_contract_id, v_version_id;
  end if;

  insert into public.contract_signatures (contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id, signed_at)
  select v_contract_id, v_emma_auth_id, 'klient', 'Emma Lind', 'emma@northlinestudio.se', v_version_id, '2026-08-12 16:42:00+00'
  where not exists (
    select 1 from public.contract_signatures
    where contract_id = v_contract_id and signer_role = 'klient' and contract_version_id = v_version_id
  );

  -- ------------------------------------------------------- F. Emma — SIGNERAT

  select id, version_id into v_contract_id, v_version_id
  from public.contracts
  where coach_id = v_coach_id and client_id = v_emma_id and title = 'Executive coaching – uppstartsavtal 2026';

  if v_contract_id is null then
    insert into public.contracts (
      coach_id, client_id, engagement_id, title, content,
      price_amount, currency, payment_terms, status, sent_at, client_signed_at, coach_signed_at, locked_at
    ) values (
      v_coach_id, v_emma_id, v_emma_engagement,
      'Executive coaching – uppstartsavtal 2026',
      '{
        "sections": [
          {"id": "s1", "heading": "Syfte och mål", "body": "Att stödja Emma i övergången från operativ grundarroll till en tydligare strategisk vd-roll när organisationen växer."},
          {"id": "s2", "heading": "Uppdragets omfattning", "body": "Åtta sessioner över cirka sex månader, mars–september 2026."},
          {"id": "s3", "heading": "Sekretess", "body": "Samtalens innehåll är konfidentiellt mellan coach och klient."},
          {"id": "s4", "heading": "Pris och betalningsvillkor", "body": "Faktureras månadsvis i förskott enligt angivet pris."},
          {"id": "s5", "heading": "Avtalstid", "body": "Avtalet löper mars–september 2026."}
        ],
        "fields": [
          {"id": "f1", "label": "Program", "type": "text", "value": "Executive coaching", "options": []},
          {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "4 500 SEK", "options": []},
          {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "8", "options": []},
          {"id": "f4", "label": "Startdatum", "type": "datum", "value": "2026-03-05", "options": []}
        ]
      }'::jsonb,
      36000, 'SEK', 'Faktureras månadsvis i förskott', 'signerat', '2026-03-02 09:00:00+00', '2026-03-04 14:20:00+00', '2026-03-05 10:05:00+00', '2026-03-05 10:05:00+00'
    )
    returning id, version_id into v_contract_id, v_version_id;
  end if;

  insert into public.contract_signatures (contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id, signed_at)
  select v_contract_id, v_emma_auth_id, 'klient', 'Emma Lind', 'emma@northlinestudio.se', v_version_id, '2026-03-04 14:20:00+00'
  where not exists (
    select 1 from public.contract_signatures
    where contract_id = v_contract_id and signer_role = 'klient' and contract_version_id = v_version_id
  );

  insert into public.contract_signatures (contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id, signed_at)
  select v_contract_id, v_coach_auth_id, 'coach', 'Carolina von Braun', 'carolina@cvbcoaching.se', v_version_id, '2026-03-05 10:05:00+00'
  where not exists (
    select 1 from public.contract_signatures
    where contract_id = v_contract_id and signer_role = 'coach' and contract_version_id = v_version_id
  );

  -- ------------------------------------------------------ Emma — ARKIVERAT

  select id, version_id into v_contract_id, v_version_id
  from public.contracts
  where coach_id = v_coach_id and client_id = v_emma_id and title = 'Executive coaching – pilotperiod 2026';

  if v_contract_id is null then
    insert into public.contracts (
      coach_id, client_id, engagement_id, title, content,
      price_amount, currency, payment_terms, status, sent_at, client_signed_at, coach_signed_at, locked_at
    ) values (
      v_coach_id, v_emma_id, v_emma_engagement,
      'Executive coaching – pilotperiod 2026',
      '{
        "sections": [
          {"id": "s1", "heading": "Syfte och mål", "body": "Kort pilotperiod inför det ordinarie coachningsavtalet, för att pröva samarbetsformen."},
          {"id": "s2", "heading": "Uppdragets omfattning", "body": "Två sessioner under januari 2026."},
          {"id": "s3", "heading": "Pris och betalningsvillkor", "body": "Faktureras vid uppstart."}
        ],
        "fields": [
          {"id": "f1", "label": "Program", "type": "text", "value": "Executive coaching, pilot", "options": []},
          {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "4 500 SEK", "options": []},
          {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "2", "options": []}
        ]
      }'::jsonb,
      9000, 'SEK', 'Faktureras vid uppstart', 'arkiverat', '2026-01-12 09:00:00+00', '2026-01-14 11:00:00+00', '2026-01-15 09:30:00+00', '2026-01-15 09:30:00+00'
    )
    returning id, version_id into v_contract_id, v_version_id;
  end if;

  insert into public.contract_signatures (contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id, signed_at)
  select v_contract_id, v_emma_auth_id, 'klient', 'Emma Lind', 'emma@northlinestudio.se', v_version_id, '2026-01-14 11:00:00+00'
  where not exists (
    select 1 from public.contract_signatures
    where contract_id = v_contract_id and signer_role = 'klient' and contract_version_id = v_version_id
  );

  insert into public.contract_signatures (contract_id, signer_auth_user_id, signer_role, signer_name, signer_email, contract_version_id, signed_at)
  select v_contract_id, v_coach_auth_id, 'coach', 'Carolina von Braun', 'carolina@cvbcoaching.se', v_version_id, '2026-01-15 09:30:00+00'
  where not exists (
    select 1 from public.contract_signatures
    where contract_id = v_contract_id and signer_role = 'coach' and contract_version_id = v_version_id
  );

  -- --------------------------------------------- G. Johan Bergström — UTKAST

  insert into public.contracts (coach_id, client_id, engagement_id, title, content, price_amount, currency, payment_terms, status)
  select
    v_coach_id, v_johan_id, v_johan_engagement,
    'Ledarutveckling – uppföljningsavtal hösten 2026',
    '{
      "sections": [
        {"id": "s1", "heading": "Syfte och mål", "body": "Fortsatt stöd i tydligare ansvarsfördelning och beslutsfattande efter tillväxtperioden."},
        {"id": "s2", "heading": "Uppdragets omfattning", "body": "Sex sessioner under hösten 2026, under utkast."},
        {"id": "s3", "heading": "Pris och betalningsvillkor", "body": "Förslag: faktureras månadsvis i förskott."}
      ],
      "fields": [
        {"id": "f1", "label": "Program", "type": "text", "value": "Ledarutveckling, uppföljning", "options": []},
        {"id": "f2", "label": "Pris per session", "type": "belopp", "value": "3 200", "options": []},
        {"id": "f3", "label": "Antal sessioner", "type": "antal", "value": "6", "options": []}
      ]
    }'::jsonb,
    19200, 'SEK', 'Faktureras månadsvis i förskott', 'utkast'
  where not exists (
    select 1 from public.contracts where coach_id = v_coach_id and client_id = v_johan_id and title = 'Ledarutveckling – uppföljningsavtal hösten 2026'
  );

  -- ------------------------------------- dashboard: recent completed sessions
  -- Existing seed data has no completed sessions after 2026-07-02, leaving the
  -- most recent weeks empty. Add a modest, unevenly spread handful so the
  -- 12-week chart and "senaste 30 dagar" reflect plausible recent activity.

  insert into public.sessions (client_id, number, date, time, duration_minutes, status, client_focus, desired_outcome, location)
  select '9457f09e-b402-57fb-bb7c-be1afb14587b', 4, '2026-07-29', '09:00', 60, 'genomford',
    'Hur HR-perspektivet ska vägas in i höstens omorganisation.', 'En tydligare linje att utgå från i planeringen.', 'Video'
  where not exists (select 1 from public.sessions where client_id = '9457f09e-b402-57fb-bb7c-be1afb14587b' and date = '2026-07-29');

  insert into public.sessions (client_id, number, date, time, duration_minutes, status, client_focus, desired_outcome, location)
  select '23e698ab-ccda-53db-9dfe-3077d6f33543', 5, '2026-08-05', '14:00', 60, 'genomford',
    'Att använda mandatet i ett läge som blivit obekvämt.', 'Ett konkret nästa steg att pröva.', 'Video'
  where not exists (select 1 from public.sessions where client_id = '23e698ab-ccda-53db-9dfe-3077d6f33543' and date = '2026-08-05');

  insert into public.sessions (client_id, number, date, time, duration_minutes, status, client_focus, desired_outcome, location)
  select v_emma_id, 6, '2026-08-11', '10:00', 60, 'genomford',
    'Hur jag förbereder mig inför samtalet med styrelseordföranden.', 'Att känna mig redo att boka in det.', 'Video'
  where not exists (select 1 from public.sessions where client_id = v_emma_id and date = '2026-08-11');

  insert into public.sessions (client_id, number, date, time, duration_minutes, status, client_focus, desired_outcome, location)
  select '628711c7-2726-533a-afa7-d23e082cd058', 6, '2026-08-13', '11:00', 60, 'genomford',
    'Vilket initiativ som väger tyngst att välja bort.', 'Ett beslutsunderlag jag litar på.', 'Video'
  where not exists (select 1 from public.sessions where client_id = '628711c7-2726-533a-afa7-d23e082cd058' and date = '2026-08-13');

  insert into public.sessions (client_id, number, date, time, duration_minutes, status, client_focus, desired_outcome, location)
  select v_johan_id, 5, '2026-08-20', '13:00', 60, 'genomford',
    'Hur det gick att låta ledningsgruppen äga frågan själva.', 'Vad som faktiskt förändrats sedan i juni.', 'Video'
  where not exists (select 1 from public.sessions where client_id = v_johan_id and date = '2026-08-20');

  -- --------------------------------------------------------- I. bookings

  insert into public.session_booking_requests (client_id, requested_by_role, date, time, duration_minutes, location, message, status)
  select v_emma_id, 'klient', '2026-09-05', '10:00', 60, 'Video', 'Skulle vilja boka in ett samtal om styrelsedialogen innan nästa möte.', 'pending'
  where not exists (
    select 1 from public.session_booking_requests where client_id = v_emma_id and date = '2026-09-05' and time = '10:00'
  );

  insert into public.session_booking_requests (client_id, requested_by_role, date, time, duration_minutes, location, message, status)
  select v_ali_id, 'coach', '2026-09-10', '13:30', 60, 'Video', 'Föreslår ett samtal inför höstens kapacitetsplanering.', 'pending'
  where not exists (
    select 1 from public.session_booking_requests where client_id = v_ali_id and date = '2026-09-10' and time = '13:30'
  );

  -- ------------------------------------------------ J. active meeting context

  insert into public.session_preparations (client_id, session_id, focus, desired_outcome, changed, follow_up)
  select
    '6d8083a0-39dc-5463-a9f8-b99c497d5efe',
    'fc824595-35c3-537a-add2-4b06237863a6',
    'Vad jag vill att teamet ska klara till våren.',
    'Att få det formulerat så att jag kan säga det högt till dem.',
    'Jag har börjat dela med mig av mer av helhetsbilden i teamet, men känner mig fortfarande otydlig i vad jag faktiskt förväntar mig.',
    'Hur jag konkretiserar förväntningarna utan att detaljstyra, och hur jag följer upp utan att tappa tilliten.'
  where not exists (
    select 1 from public.session_preparations where client_id = '6d8083a0-39dc-5463-a9f8-b99c497d5efe'
  );

  -- --------------------------------------------- H. client lifecycle: ended

  update public.clients
  set status = 'avslutad', ended_at = '2026-07-15 09:00:00+00'
  where id = v_nina_id and status = 'aktiv';

end $$;
