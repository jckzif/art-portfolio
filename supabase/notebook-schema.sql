alter table public.projects add column if not exists is_notebook boolean not null default false;
