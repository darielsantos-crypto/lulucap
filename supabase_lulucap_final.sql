-- LULUCAP, SQL COMPLETO FINAL
-- Rode no Supabase SQL Editor.

create table if not exists public.lulucap_people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'pending' check (status in ('pending','winner','removed')),
  sort_order integer default 0,
  winner_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists lulucap_people_name_unique
on public.lulucap_people (lower(name));

create table if not exists public.lulucap_draws (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.lulucap_people(id) on delete set null,
  winner_name text not null,
  created_at timestamptz default now()
);

alter table public.lulucap_people enable row level security;
alter table public.lulucap_draws enable row level security;

drop policy if exists "lulucap_people_select" on public.lulucap_people;
drop policy if exists "lulucap_people_insert" on public.lulucap_people;
drop policy if exists "lulucap_people_update" on public.lulucap_people;
drop policy if exists "lulucap_people_delete" on public.lulucap_people;

create policy "lulucap_people_select" on public.lulucap_people for select using (true);
create policy "lulucap_people_insert" on public.lulucap_people for insert with check (true);
create policy "lulucap_people_update" on public.lulucap_people for update using (true) with check (true);
create policy "lulucap_people_delete" on public.lulucap_people for delete using (true);

drop policy if exists "lulucap_draws_select" on public.lulucap_draws;
drop policy if exists "lulucap_draws_insert" on public.lulucap_draws;
drop policy if exists "lulucap_draws_delete" on public.lulucap_draws;

create policy "lulucap_draws_select" on public.lulucap_draws for select using (true);
create policy "lulucap_draws_insert" on public.lulucap_draws for insert with check (true);
create policy "lulucap_draws_delete" on public.lulucap_draws for delete using (true);
