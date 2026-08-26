-- Sara's 14:00–15:00 session on the public-calendar demo date blocks the
-- whole 13:00–15:00 fixed block. Move it so all four demo blocks show.
-- Idempotent.

update public.sessions
set date = '2026-08-29', time = '09:00'
where client_id = '23e698ab-ccda-53db-9dfe-3077d6f33543'
  and date = '2026-08-28'
  and time = '14:00';
