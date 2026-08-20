create table if not exists public.about_content (
  id integer primary key default 1 check (id = 1),
  left_text text not null default '',
  right_text text not null default '',
  image_path text,
  updated_at timestamptz not null default now()
);

insert into public.about_content (id, left_text, right_text)
values (1, '', '')
on conflict (id) do nothing;

alter table public.about_content enable row level security;

create policy "about is public" on public.about_content for select using (true);
create policy "admins manage about" on public.about_content for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists about_content_updated_at on public.about_content;
create trigger about_content_updated_at before update on public.about_content for each row execute procedure public.set_updated_at();
