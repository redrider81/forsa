-- CVB Base — internal coach document library: RLS for owner_type = 'coach'
-- rows on the existing documents table, and Storage policies for the
-- internal path {coach_id}/internal/{document_id}/{file_name} in the
-- existing coach-documents bucket. Existing 'klient'/'uppdrag' document
-- policies and existing coach-documents client-path policies are untouched
-- (they already exclude owner_type = 'coach' by construction) and no klient
-- policy is added here, so internal documents stay coach-only by default deny.

create policy documents_select_coach_internal on public.documents
  for select to authenticated
  using (owner_type = 'coach' and owner_id = public.current_coach_id());

create policy documents_insert_coach_internal on public.documents
  for insert to authenticated
  with check (
    owner_type = 'coach'
    and owner_id = public.current_coach_id()
    and uploaded_by_coach_id = public.current_coach_id()
    and visibility = 'coach'
  );

create policy documents_update_coach_internal on public.documents
  for update to authenticated
  using (owner_type = 'coach' and owner_id = public.current_coach_id())
  with check (owner_type = 'coach' and owner_id = public.current_coach_id() and visibility = 'coach');

create policy documents_delete_coach_internal on public.documents
  for delete to authenticated
  using (owner_type = 'coach' and owner_id = public.current_coach_id());

create policy coach_documents_internal_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'internal'
  );

create policy coach_documents_internal_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'internal'
  );

create policy coach_documents_internal_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'internal'
  )
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'internal'
  );

create policy coach_documents_internal_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'internal'
  );
