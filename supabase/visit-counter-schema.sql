create table if not exists public.visit_stats (
  id int primary key check (id = 1),
  visit_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Insert initial row if it doesn't exist
insert into public.visit_stats (id, visit_count) values (1, 0) on conflict do nothing;

-- Allow public reads and updates via function
alter table public.visit_stats enable row level security;

-- Drop existing policies if they exist and recreate
drop policy if exists "Anyone can read visit stats" on public.visit_stats;
drop policy if exists "Anyone can update visit stats" on public.visit_stats;

create policy "Anyone can read visit stats" on public.visit_stats for select using (true);
create policy "Anyone can update visit stats" on public.visit_stats for update using (true);

-- Create a function to increment visit count (security definer so it works with anon key)
drop function if exists increment_visit_count();
create or replace function increment_visit_count()
returns bigint
language sql
security definer
as $$
  update public.visit_stats
  set visit_count = visit_count + 1, updated_at = now()
  where id = 1
  returning visit_count;
$$;
