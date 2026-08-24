-- CVB Base — storage foundation for coaching materials.
-- Path convention: {owner_client_id}/{material_id}/{file_name}
-- Bucket is private; access is scoped through the same ownership rules as
-- the `materials` table.

insert into storage.buckets (id, name, public)
values ('coaching-materials', 'coaching-materials', false)
on conflict (id) do nothing;

-- Klient reads/writes only under their own owner_client_id prefix.

create policy coaching_materials_klient_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coaching-materials'
    and (storage.foldername(name))[1]::uuid = public.current_client_id()
  );

create policy coaching_materials_klient_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coaching-materials'
    and (storage.foldername(name))[1]::uuid = public.current_client_id()
  );

create policy coaching_materials_klient_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'coaching-materials'
    and (storage.foldername(name))[1]::uuid = public.current_client_id()
  )
  with check (
    bucket_id = 'coaching-materials'
    and (storage.foldername(name))[1]::uuid = public.current_client_id()
  );

create policy coaching_materials_klient_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'coaching-materials'
    and (storage.foldername(name))[1]::uuid = public.current_client_id()
  );

-- Coach reads only objects belonging to materials shared with them, for
-- clients they own. Coach never uploads real file bytes in this pass (the
-- existing coach-shared material flow is metadata-only), so no write
-- policies are granted here.

create policy coaching_materials_coach_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coaching-materials'
    and public.client_owned_by_current_coach((storage.foldername(name))[1]::uuid)
    and exists (
      select 1 from public.materials m
      where m.id = (storage.foldername(name))[2]::uuid
        and (m.sharing_level = 'shared_coach' or m.source = 'coach_shared')
    )
  );
