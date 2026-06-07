-- LULUCAP, SUPABASE COMPLETO
-- Rode tudo no SQL Editor.

drop table if exists public.lulucap_draws cascade;
drop table if exists public.lulucap_people cascade;

create table public.lulucap_people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'pending' check (status in ('pending','winner','removed')),
  sort_order integer default 0,
  winner_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index lulucap_people_name_unique
on public.lulucap_people (lower(name));

create table public.lulucap_draws (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.lulucap_people(id) on delete set null,
  winner_name text not null,
  created_at timestamptz default now()
);

create or replace function public.set_lulucap_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_lulucap_people_updated_at
before update on public.lulucap_people
for each row
execute function public.set_lulucap_updated_at();

alter table public.lulucap_people enable row level security;
alter table public.lulucap_draws enable row level security;

create policy "lulucap_people_select"
on public.lulucap_people
for select
using (true);

create policy "lulucap_people_insert"
on public.lulucap_people
for insert
with check (true);

create policy "lulucap_people_update"
on public.lulucap_people
for update
using (true)
with check (true);

create policy "lulucap_people_delete"
on public.lulucap_people
for delete
using (true);

create policy "lulucap_draws_select"
on public.lulucap_draws
for select
using (true);

create policy "lulucap_draws_insert"
on public.lulucap_draws
for insert
with check (true);

create policy "lulucap_draws_delete"
on public.lulucap_draws
for delete
using (true);

insert into public.lulucap_people (name,status,winner_at)
values
('Theresa','winner',now()),
('Rubens 1','winner',now()),
('Bruna','winner',now()),
('Frank','winner',now()),
('Manoel','winner',now()),
('Lucimara','winner',now()),
('Dariel','pending',null),
('Brêndon','pending',null),
('Rubens 2','pending',null),
('Fernando','pending',null),
('Sthefany','pending',null),
('Ranno','pending',null),
('Ellys','pending',null),
('Luciane','pending',null);
