-- Run this only if schema.sql reports that a policy already exists.
-- It safely replaces the access rules without deleting projects or artwork.

drop policy if exists "published projects are public" on public.projects;
drop policy if exists "admins manage projects" on public.projects;
drop policy if exists "published project images are public" on public.project_images;
drop policy if exists "admins manage images" on public.project_images;

alter table public.projects enable row level security;
alter table public.project_images enable row level security;

create policy "published projects are public" on public.projects
for select using (published or public.is_admin());
create policy "admins manage projects" on public.projects
for all using (public.is_admin()) with check (public.is_admin());
create policy "published project images are public" on public.project_images
for select using (public.is_admin() or exists (
  select 1 from public.projects p where p.id = project_id and p.published
));
create policy "admins manage images" on public.project_images
for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artwork', 'artwork', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 20971520, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view artwork" on storage.objects;
drop policy if exists "admins upload artwork" on storage.objects;
drop policy if exists "admins update artwork" on storage.objects;
drop policy if exists "admins delete artwork" on storage.objects;

create policy "public can view artwork" on storage.objects for select using (bucket_id = 'artwork');
create policy "admins upload artwork" on storage.objects for insert to authenticated with check (bucket_id = 'artwork' and public.is_admin());
create policy "admins update artwork" on storage.objects for update to authenticated using (bucket_id = 'artwork' and public.is_admin());
create policy "admins delete artwork" on storage.objects for delete to authenticated using (bucket_id = 'artwork' and public.is_admin());
