-- CVB Base — storage foundation for coach-managed client documents.
-- Path convention: {client_id}/{document_id}/{file_name}
-- Bucket is private. Coach access is scoped through the same ownership
-- chain as the `documents` table writes (client_owned_by_current_coach).
-- Klient access is mediated through document visibility, mirroring
-- documents_select_klient — a klient never uploads or removes files here.

insert into storage.buckets (id, name, public)
values ('coach-documents', 'coach-documents', false)
on conflict (id) do nothing;

create policy coach_documents_coach_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and public.client_owned_by_current_coach((storage.foldername(name))[1]::uuid)
  );

create policy coach_documents_coach_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coach-documents'
    and public.client_owned_by_current_coach((storage.foldername(name))[1]::uuid)
  );

create policy coach_documents_coach_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'coach-documents'
    and public.client_owned_by_current_coach((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'coach-documents'
    and public.client_owned_by_current_coach((storage.foldername(name))[1]::uuid)
  );

create policy coach_documents_coach_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'coach-documents'
    and public.client_owned_by_current_coach((storage.foldername(name))[1]::uuid)
  );

create policy coach_documents_klient_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1]::uuid = public.current_client_id()
    and exists (
      select 1 from public.documents d
      where d.id = (storage.foldername(name))[2]::uuid
        and d.owner_type = 'klient'
        and d.owner_id = public.current_client_id()
        and d.visibility <> 'coach'
    )
  );
