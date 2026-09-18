-- AutoPilot — Supabase schema
--
-- Run this once in the Supabase SQL editor, then set
-- EXPO_PUBLIC_USE_MOCK_DATA=false in .env.
--
-- Column names are snake_case; the repository layer maps them to the app's
-- camelCase models automatically (see apis/repositories/helpers.ts).
--
-- Every user-owned table carries `user_id` and is protected by row level
-- security, so a client holding the anon key can only ever read or write its
-- own rows.

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────────────────────
-- One row per auth user, created automatically by the trigger below.
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
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Vehicles ────────────────────────────────────────────────────────────────
create table if not exists public.vehicles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users on delete cascade,
  make                text not null,
  model               text not null,
  year                int  not null,
  nickname            text,
  plate_number        text,
  vin                 text,
  color               text,
  fuel_type           text not null default 'petrol',
  transmission        text,
  odometer            int  not null default 0,
  odometer_updated_at timestamptz,
  tank_capacity       numeric,
  photo_url           text,
  is_primary          boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists vehicles_user_id_idx on public.vehicles (user_id);

-- ── Maintenance ─────────────────────────────────────────────────────────────
create table if not exists public.maintenance_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade default auth.uid(),
  vehicle_id      uuid not null references public.vehicles on delete cascade,
  service_type    text not null,
  custom_title    text,
  date            date not null,
  odometer        int,
  cost            numeric,
  currency        text default 'EGP',
  interval_km     int,
  interval_months int,
  workshop        text,
  notes           text,
  status          text not null default 'completed',
  created_at      timestamptz not null default now()
);

create index if not exists maintenance_vehicle_idx on public.maintenance_records (vehicle_id, date desc);

-- ── Service reminders ───────────────────────────────────────────────────────
create table if not exists public.service_reminders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users on delete cascade default auth.uid(),
  vehicle_id          uuid not null references public.vehicles on delete cascade,
  title               text not null,
  service_type        text not null,
  trigger             text not null default 'both',
  due_date            date,
  due_odometer        int,
  repeat_every_months int,
  repeat_every_km     int,
  notes               text,
  is_active           boolean not null default true,
  status              text not null default 'active',
  created_at          timestamptz not null default now()
);

create index if not exists reminders_vehicle_idx on public.service_reminders (vehicle_id, due_date);

-- ── Fuel ────────────────────────────────────────────────────────────────────
create table if not exists public.fuel_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade default auth.uid(),
  vehicle_id       uuid not null references public.vehicles on delete cascade,
  date             date not null,
  odometer         int  not null,
  distance_km      int  not null default 0,
  liters           numeric not null,
  price_per_liter  numeric,
  total_cost       numeric,
  currency         text default 'EGP',
  station_name     text,
  is_full_tank     boolean not null default true,
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists fuel_vehicle_idx on public.fuel_entries (vehicle_id, date desc);

-- ── Documents ───────────────────────────────────────────────────────────────
create table if not exists public.vehicle_documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade default auth.uid(),
  vehicle_id  uuid not null references public.vehicles on delete cascade,
  title       text not null,
  type        text not null default 'other',
  issue_date  date,
  expiry_date date,
  file_uri    text,
  file_name   text,
  file_size   bigint,
  mime_type   text,
  notes       text,
  status      text not null default 'noExpiry',
  created_at  timestamptz not null default now()
);

create index if not exists documents_vehicle_idx on public.vehicle_documents (vehicle_id, expiry_date);

-- ── Climate & comfort ───────────────────────────────────────────────────────
create table if not exists public.climate_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade default auth.uid(),
  vehicle_id      uuid not null references public.vehicles on delete cascade,
  type            text not null,
  date            date not null,
  odometer        int,
  cost            numeric,
  currency        text default 'EGP',
  notes           text,
  interval_months int not null default 12,
  created_at      timestamptz not null default now()
);

create index if not exists climate_vehicle_idx on public.climate_records (vehicle_id, date desc);

-- ── Trips ───────────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users on delete cascade default auth.uid(),
  vehicle_id           uuid not null references public.vehicles on delete cascade,
  name                 text not null,
  origin               text not null,
  destination          text not null,
  distance_km          numeric not null,
  is_round_trip        boolean not null default true,
  departure_date       date not null,
  return_date          date,
  fuel_price_per_liter numeric not null default 0,
  currency             text default 'EGP',
  travellers           int not null default 1,
  notes                text,
  checklist            jsonb not null default '[]'::jsonb,
  created_at           timestamptz not null default now()
);

create index if not exists trips_vehicle_idx on public.trips (vehicle_id, departure_date);

-- ── Notifications ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade default auth.uid(),
  kind       text not null default 'system',
  title      text not null,
  body       text not null default '',
  href       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ── Diagnostic codes ────────────────────────────────────────────────────────
-- Shared reference data, readable by any signed-in user and owned by nobody.
create table if not exists public.diagnostic_codes (
  code                text primary key,
  system              text not null,
  title               text not null,
  description         text not null,
  severity            text not null,
  common_causes       text[] not null default '{}',
  suggested_actions   text[] not null default '{}',
  safe_to_drive       boolean not null default true,
  estimated_cost_band text not null default 'medium'
);

-- ── Row level security ──────────────────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.vehicles            enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.service_reminders   enable row level security;
alter table public.fuel_entries        enable row level security;
alter table public.vehicle_documents   enable row level security;
alter table public.climate_records     enable row level security;
alter table public.trips               enable row level security;
alter table public.notifications       enable row level security;
alter table public.diagnostic_codes    enable row level security;

-- Profiles: a user sees and edits only their own row.
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Owned tables: identical policy shape on each.
do $$
declare
  owned_table text;
begin
  foreach owned_table in array array[
    'vehicles',
    'maintenance_records',
    'service_reminders',
    'fuel_entries',
    'vehicle_documents',
    'climate_records',
    'trips',
    'notifications'
  ]
  loop
    execute format('drop policy if exists "%1$s_owner" on public.%1$I', owned_table);
    execute format(
      'create policy "%1$s_owner" on public.%1$I for all
         using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      owned_table
    );
  end loop;
end;
$$;

-- Diagnostic codes are reference data: readable by all, writable by nobody.
drop policy if exists "diagnostic_codes_read" on public.diagnostic_codes;
create policy "diagnostic_codes_read" on public.diagnostic_codes
  for select using (true);

-- ── Storage buckets ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('vehicle-documents', 'vehicle-documents', false),
  ('avatars', 'avatars', true),
  ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

-- Private document bucket: each user is scoped to their own folder.
drop policy if exists "documents_owner" on storage.objects;
create policy "documents_owner" on storage.objects
  for all
  using (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1]);
