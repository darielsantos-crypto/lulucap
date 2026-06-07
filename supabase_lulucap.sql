-- LULUCAP, BASE COMPLETA PARA PARTICIPANTES, CONTEMPLADOS, REMOÇÃO E HISTÓRICO

-- Status:
-- pending = ainda participa dos próximos sorteios
-- winner  = já foi contemplado
-- removed = removido/desligado do consórcio

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

create or replace function public.set_lulucap_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lulucap_people_updated_at on public.lulucap_people;

create trigger trg_lulucap_people_updated_at
before update on public.lulucap_people
for each row
execute function public.set_lulucap_updated_at();

alter table public.lulucap_people enable row level security;
alter table public.lulucap_draws enable row level security;

drop policy if exists "lulucap people select" on public.lulucap_people;
drop policy if exists "lulucap people insert" on public.lulucap_people;
drop policy if exists "lulucap people update" on public.lulucap_people;
drop policy if exists "lulucap people delete" on public.lulucap_people;

create policy "lulucap people select"
on public.lulucap_people
for select
using (true);

create policy "lulucap people insert"
on public.lulucap_people
for insert
with check (true);

create policy "lulucap people update"
on public.lulucap_people
for update
using (true)
with check (true);

create policy "lulucap people delete"
on public.lulucap_people
for delete
using (true);

drop policy if exists "lulucap draws select" on public.lulucap_draws;
drop policy if exists "lulucap draws insert" on public.lulucap_draws;
drop policy if exists "lulucap draws delete" on public.lulucap_draws;

create policy "lulucap draws select"
on public.lulucap_draws
for select
using (true);

create policy "lulucap draws insert"
on public.lulucap_draws
for insert
with check (true);

create policy "lulucap draws delete"
on public.lulucap_draws
for delete
using (true);

-- Carga inicial, rode apenas uma vez se quiser começar com essa base.
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
('Luciane','pending',null)
on conflict (lower(name)) do nothing;
