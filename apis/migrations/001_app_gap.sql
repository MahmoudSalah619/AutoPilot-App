-- AutoPilot — schema gap migration
--
-- NOT APPLIED. This file is a proposal: it is the difference between the
-- project's live schema and what the app's domain models need. Review it,
-- then run it yourself in the Supabase SQL editor (or via the CLI). Nothing
-- in the app depends on it having run — every domain it touches works, more
-- narrowly, without it.
--
-- After applying, flip the matching entries in `apis/config.ts`:
--   BACKENDS.profile        'partial'  -> 'supabase'
--   BACKENDS.vehicles       'partial'  -> 'supabase'
--   BACKENDS.maintenance    'partial'  -> 'supabase'
--   BACKENDS.reminders      'partial'  -> 'supabase'
--   BACKENDS.fuel           'partial'  -> 'supabase'
--   BACKENDS.documents      'partial'  -> 'supabase'
--   BACKENDS.climate        'mock'     -> 'supabase'
--   BACKENDS.trips          'mock'     -> 'supabase'
--   BACKENDS.notifications  'mock'     -> 'supabase'
--   BACKENDS.diagnostics    'mock'     -> 'supabase'
-- and move `climate_records`, `trips`, `notifications`, `diagnostic_codes`
-- and `profiles` from `PLANNED_TABLES` into `TABLES`.
--
-- Written to be re-runnable: every statement is `if not exists` or
-- `or replace`, so a partial application can be re-run safely.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Grant table access on gas_consumption          ← apply this one first
-- ─────────────────────────────────────────────────────────────────────────────
-- `gas_consumption` is the only table in the schema without SELECT/INSERT/
-- UPDATE/DELETE granted to `anon` and `authenticated`. Its RLS policy is
-- fine; the grant underneath it is missing, so every request fails before
-- the policy is ever evaluated:
--
--   permission denied for table gas_consumption   (SQLSTATE 42501)
--
-- The whole fuel feature is dark until this runs. It is independent of
-- everything else in this file and safe to apply on its own.

grant select, insert, update, delete on public.gas_consumption to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Widen the tables that already exist
-- ─────────────────────────────────────────────────────────────────────────────

-- Vehicles: the app collects all of this at onboarding and has nowhere to
-- put it, so plate, VIN, fuel type and tank capacity are silently dropped
-- today.
alter table public.vehicles
  add column if not exists nickname            text,
  add column if not exists plate_number        text,
  add column if not exists vin                 text,
  add column if not exists color               text,
  add column if not exists fuel_type           text not null default 'petrol',
  add column if not exists transmission        text,
  add column if not exists odometer_updated_at timestamptz,
  add column if not exists tank_capacity       numeric,
  add column if not exists photo_url           text;

-- `useActiveVehicle` assumes at most one primary vehicle per user; nothing
-- enforces it today, so the app has to demote by hand on every write.
create unique index if not exists vehicles_one_primary_per_user
  on public.vehicles (user_id)
  where is_primary;

create index if not exists vehicles_user_id_idx on public.vehicles (user_id);

-- Maintenance. `interval` already holds kilometers, so it keeps that meaning
-- and the months counterpart is added alongside it.
alter table public.maintenance
  add column if not exists custom_title    text,
  add column if not exists currency        text default 'EGP',
  add column if not exists interval_months int,
  add column if not exists workshop        text;

comment on column public.maintenance.interval is 'Service interval in kilometers.';

create index if not exists maintenance_vehicle_idx
  on public.maintenance (vehicle_id, date desc);

-- Service reminders. The table is date-only today: no title of its own (the
-- app stores it in `notes`), no service type, no distance trigger and no
-- recurrence, so "remind me every 10,000 km" cannot be expressed at all.
alter table public.service_reminders
  add column if not exists title               text,
  add column if not exists service_type        bigint references public.services_types (id),
  add column if not exists trigger             text not null default 'date',
  add column if not exists due_odometer        int,
  add column if not exists repeat_every_months int,
  add column if not exists repeat_every_km     int,
  add column if not exists is_active           boolean not null default true;

-- Carry the titles the app has been writing into `notes` across to the new
-- column, then leave `notes` free for actual notes.
update public.service_reminders
   set title = notes
 where title is null
   and notes is not null;

create index if not exists reminders_vehicle_idx
  on public.service_reminders (vehicle_id, date);

-- Fuel. `gas_consumption` records distance and volume only, so the app can
-- show efficiency but not a single figure about cost.
alter table public.gas_consumption
  add column if not exists odometer        int,
  add column if not exists price_per_liter numeric,
  add column if not exists total_cost      numeric,
  add column if not exists currency        text default 'EGP',
  add column if not exists station_name    text,
  add column if not exists is_full_tank    boolean not null default true,
  add column if not exists notes           text;

create index if not exists gas_consumption_vehicle_idx
  on public.gas_consumption (vehicle_id, date desc);

-- The generated `efficiency` column divides km/L by 1000, which puts every
-- value three orders of magnitude out (a car doing 12 km/L stores 0.0). The
-- app ignores the column and recomputes, but anything reading the table
-- directly — a dashboard, a report — gets the wrong number.
alter table public.gas_consumption drop column if exists efficiency;
alter table public.gas_consumption
  add column efficiency numeric
  generated always as (
    case
      when liters_consumed > 0 then round(kilometers_driven / liters_consumed, 1)
      else null
    end
  ) stored;

-- Documents. Expiry tracking is the point of the documents screen and there
-- is currently nowhere to record an expiry date.
alter table public.vehicle_documents
  add column if not exists type        text not null default 'other',
  add column if not exists issue_date  date,
  add column if not exists expiry_date date,
  add column if not exists file_name   text,
  add column if not exists file_size   bigint,
  add column if not exists mime_type   text,
  add column if not exists notes       text;

-- A document can be recorded before its scan is attached.
alter table public.vehicle_documents alter column image drop not null;

create index if not exists documents_vehicle_idx
  on public.vehicle_documents (vehicle_id, expiry_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Cascade deletes
-- ─────────────────────────────────────────────────────────────────────────────
-- Every foreign key into `vehicles` is `no action`, so deleting a vehicle
-- that has any history fails on a constraint violation. The app works around
-- it by deleting children first, which is four extra round trips and is not
-- atomic — a failure halfway through leaves the vehicle with partial history.

alter table public.maintenance
  drop constraint if exists maintenance_vehicle_id_fkey,
  add  constraint maintenance_vehicle_id_fkey
       foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

alter table public.service_reminders
  drop constraint if exists service_reminders_vehicle_id_fkey,
  add  constraint service_reminders_vehicle_id_fkey
       foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

alter table public.gas_consumption
  drop constraint if exists gas_consumption_vehicle_id_fkey,
  add  constraint gas_consumption_vehicle_id_fkey
       foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

alter table public.vehicle_documents
  drop constraint if exists vehicle_documents_vehicle_id_fkey,
  add  constraint vehicle_documents_vehicle_id_fkey
       foreign key (vehicle_id) references public.vehicles (id) on delete cascade;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Profiles
-- ─────────────────────────────────────────────────────────────────────────────
-- Name, phone, address and unit preferences currently live in
-- `auth.users.user_metadata`, which works but cannot be queried or joined.

create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  first_name    text        not null default '',
  last_name     text        not null default '',
  email         text        not null,
  phone         text,
  avatar_url    text,
  date_of_birth date,
  address       text,
  preferences   jsonb       not null default
                  '{"distanceUnit":"km","volumeUnit":"liter","currency":"EGP","reminderLeadDays":7}'::jsonb,
  created_at    timestamptz not null default now()
);

-- Keeps profiles in step with auth.users without a round trip from the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before this ran, out of the metadata the app
-- has been writing.
insert into public.profiles (id, email, first_name, last_name, preferences)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', ''),
  coalesce(
    u.raw_user_meta_data -> 'preferences',
    '{"distanceUnit":"km","volumeUnit":"liter","currency":"EGP","reminderLeadDays":7}'::jsonb
  )
from auth.users u
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Tables the app has screens for and the project has no home for
-- ─────────────────────────────────────────────────────────────────────────────

-- Climate & comfort.
create table if not exists public.climate_records (
  id              bigint generated by default as identity primary key,
  vehicle_id      bigint  not null references public.vehicles on delete cascade,
  type            text    not null,
  date            date    not null,
  odometer        int,
  cost            numeric,
  currency        text default 'EGP',
  notes           text,
  interval_months int     not null default 12,
  created_at      timestamptz not null default now()
);

create index if not exists climate_vehicle_idx
  on public.climate_records (vehicle_id, date desc);

-- Roadtrip planner.
create table if not exists public.trips (
  id                   bigint generated by default as identity primary key,
  vehicle_id           bigint  not null references public.vehicles on delete cascade,
  name                 text    not null,
  origin               text    not null,
  destination          text    not null,
  distance_km          numeric not null,
  is_round_trip        boolean not null default true,
  departure_date       date    not null,
  return_date          date,
  fuel_price_per_liter numeric not null default 0,
  currency             text default 'EGP',
  travellers           int     not null default 1,
  notes                text,
  checklist            jsonb   not null default '[]'::jsonb,
  created_at           timestamptz not null default now()
);

create index if not exists trips_vehicle_idx on public.trips (vehicle_id, departure_date);

-- Notifications. Owned by the user rather than a vehicle, so this one
-- carries `user_id` directly.
create table if not exists public.notifications (
  id         bigint generated by default as identity primary key,
  user_id    uuid    not null references auth.users on delete cascade default auth.uid(),
  kind       text    not null default 'system',
  title      text    not null,
  body       text    not null default '',
  href       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- OBD-II reference data for the Errors Guide. Shared, owned by nobody.
create table if not exists public.diagnostic_codes (
  code                text primary key,
  system              text    not null,
  title               text    not null,
  description         text    not null,
  severity            text    not null,
  common_causes       text[]  not null default '{}',
  suggested_actions   text[]  not null default '{}',
  safe_to_drive       boolean not null default true,
  estimated_cost_band text    not null default 'medium'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Row level security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles         enable row level security;
alter table public.climate_records  enable row level security;
alter table public.trips            enable row level security;
alter table public.notifications    enable row level security;
alter table public.diagnostic_codes enable row level security;

drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Vehicle-owned tables reuse the existing shape: ownership flows through
-- `vehicles.user_id`.
drop policy if exists "climate to vehicle" on public.climate_records;
create policy "climate to vehicle" on public.climate_records
  for all to authenticated
  using (vehicle_id in (select id from public.vehicles where user_id = auth.uid()))
  with check (vehicle_id in (select id from public.vehicles where user_id = auth.uid()));

drop policy if exists "trips to vehicle" on public.trips;
create policy "trips to vehicle" on public.trips
  for all to authenticated
  using (vehicle_id in (select id from public.vehicles where user_id = auth.uid()))
  with check (vehicle_id in (select id from public.vehicles where user_id = auth.uid()));

drop policy if exists "notifications_owner" on public.notifications;
create policy "notifications_owner" on public.notifications
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "diagnostic_codes_read" on public.diagnostic_codes;
create policy "diagnostic_codes_read" on public.diagnostic_codes
  for select using (true);

-- The reminders policy has `using` but no `with check`, so for an `all`
-- policy Postgres reuses `using` on writes. That works, but it is implicit —
-- spelling it out keeps it from being read as an oversight later.
drop policy if exists "reminders to vehicle" on public.service_reminders;
create policy "reminders to vehicle" on public.service_reminders
  for all to authenticated
  using (vehicle_id in (select id from public.vehicles where user_id = auth.uid()))
  with check (vehicle_id in (select id from public.vehicles where user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Storage
-- ─────────────────────────────────────────────────────────────────────────────
-- The `storage` bucket has no policies at all, so every document upload is
-- refused. The app writes to `<user id>/<timestamp>-<filename>`, which is
-- what this policy scopes on.

drop policy if exists "vehicle_documents_owner" on storage.objects;
create policy "vehicle_documents_owner" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'storage'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'storage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Fill the gaps in the service catalogue
-- ─────────────────────────────────────────────────────────────────────────────
-- `car_makes` (65 rows) and `services_types` (11 rows) are already seeded;
-- nothing here re-seeds them. These three are services the app offers and
-- the catalogue does not have, so today they all save as "Other".
--
-- Spellings must stay in step with SERVICE_TYPE_ALIASES in
-- apis/repositories/reference.ts.

insert into public.services_types (name, interval)
select v.name, v.interval
from (values
  ('Cabin Filter Replacement', 15000::numeric),
  ('Wheel Alignment',          20000::numeric),
  ('AC Service',               20000::numeric)
) as v (name, interval)
where not exists (
  select 1 from public.services_types s where lower(s.name) = lower(v.name)
);

-- `car_models` is seeded separately, by 003_car_models.sql.

commit;
