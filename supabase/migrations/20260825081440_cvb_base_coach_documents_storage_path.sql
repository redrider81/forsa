-- CVB Base — feature acceptance correction: coach-documents Storage path
-- now carries a coach_id prefix: {coach_id}/clients/{client_id}/{document_id}/{file_name}
-- (only the client-document form of the approved path is implemented — no
-- engagement-document upload capability exists in this build).
--
-- Also corrects the klient SELECT policy: the previous `visibility <> 'coach'`
-- condition would have also matched visibility = 'organisation', which a
-- klient must never receive Storage access to. Tightened to the exact
-- klient-visible value, `coach_klient`.

drop policy if exists coach_documents_coach_select on storage.objects;
drop policy if exists coach_documents_coach_insert on storage.objects;
drop policy if exists coach_documents_coach_update on storage.objects;
drop policy if exists coach_documents_coach_delete on storage.objects;
drop policy if exists coach_documents_klient_select on storage.objects;

create policy coach_documents_coach_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'clients'
    and public.client_owned_by_current_coach((storage.foldername(name))[3]::uuid)
  );

create policy coach_documents_coach_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'clients'
    and public.client_owned_by_current_coach((storage.foldername(name))[3]::uuid)
  );

create policy coach_documents_coach_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'clients'
    and public.client_owned_by_current_coach((storage.foldername(name))[3]::uuid)
  )
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'clients'
    and public.client_owned_by_current_coach((storage.foldername(name))[3]::uuid)
  );

create policy coach_documents_coach_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_coach_id()
    and (storage.foldername(name))[2] = 'clients'
    and public.client_owned_by_current_coach((storage.foldername(name))[3]::uuid)
  );

create policy coach_documents_klient_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[2] = 'clients'
    and (storage.foldername(name))[3]::uuid = public.current_client_id()
    and exists (
      select 1 from public.documents d
      where d.id = (storage.foldername(name))[4]::uuid
        and d.owner_type = 'klient'
        and d.owner_id = public.current_client_id()
        and d.visibility = 'coach_klient'
    )
  );
