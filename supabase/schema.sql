create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false); $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), title text not null check (char_length(trim(title)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), description text, project_date date,
  cover_image_id uuid, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique, alt_text text not null default '', caption text, sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.projects drop constraint if exists projects_cover_image_id_fkey;
alter table public.projects add constraint projects_cover_image_id_fkey foreign key (cover_image_id) references public.project_images(id) on delete set null;
create index if not exists projects_public_order on public.projects (published, project_date desc);
create index if not exists project_images_project_order on public.project_images (project_id, sort_order);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists projects_updated_at on public.projects; create trigger projects_updated_at before update on public.projects for each row execute procedure public.set_updated_at();
drop trigger if exists project_images_updated_at on public.project_images; create trigger project_images_updated_at before update on public.project_images for each row execute procedure public.set_updated_at();

alter table public.projects enable row level security; alter table public.project_images enable row level security;
create policy "published projects are public" on public.projects for select using (published or public.is_admin());
create policy "admins manage projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy "published project images are public" on public.project_images for select using (public.is_admin() or exists (select 1 from public.projects p where p.id = project_id and p.published));
create policy "admins manage images" on public.project_images for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artwork', 'artwork', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 20971520, allowed_mime_types = excluded.allowed_mime_types;
create policy "public can view artwork" on storage.objects for select using (bucket_id = 'artwork');
create policy "admins upload artwork" on storage.objects for insert to authenticated with check (bucket_id = 'artwork' and public.is_admin());
create policy "admins update artwork" on storage.objects for update to authenticated using (bucket_id = 'artwork' and public.is_admin());
create policy "admins delete artwork" on storage.objects for delete to authenticated using (bucket_id = 'artwork' and public.is_admin());

-- After creating a Supabase Auth user, make that user an administrator:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb where email = 'you@example.com';
-- Sign out and back in after applying this role.
