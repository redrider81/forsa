-- CVB Base — DEMO DATA ONLY: classify the seeded demo contracts.
--
-- This is not a product rule. 20260930090000 deliberately leaves every
-- existing contract unclassified. The contracts below are the fictitious
-- demo contracts seeded by 20260826180000, identified exactly by client id
-- and title. All belong to
-- organisation engagements (Northline Studio AB, Bergström Logistik AB)
-- and are invoiced to the company, so they are business contracts.
--
-- Any other contract — including any real one — is left untouched.

update public.contracts
set counterparty_type = 'business', updated_at = now()
where counterparty_type is null
  and coach_id = '289fc70a-53be-5bda-87de-d2fcc55f79c5'
  and (
    (client_id = 'ddc48239-c366-55dd-90fb-3a33134b6055' and title in (
      'Executive coaching – hösten 2026',
      'Executive coaching – vårprogrammet 2026',
      'Executive coaching – uppstartsavtal 2026',
      'Executive coaching – pilotperiod 2026'
    ))
    or (client_id = 'e6fa23cd-a855-5764-b459-ba4c44cf5c94' and title = 'Ledarutveckling – uppföljningsavtal hösten 2026')
  );
