-- CVB Base — internal coach document library. Adds 'coach' as a third
-- owner_type for the existing documents table (alongside 'klient' and
-- 'uppdrag', both left unchanged). A new enum value cannot be used in the
-- same transaction it is added in, so this is a separate migration from the
-- RLS/Storage policies that reference it.

alter type public.document_owner_type add value 'coach';
