-- AutoPilot — fuel
--
-- NOT APPLIED. Run this in the Supabase SQL editor; the fuel screen cannot
-- read or write until it has run. It is the fuel portion of 001_app_gap.sql
-- lifted out so it can go on its own, and `apis/repositories/fuel.ts` is
-- written against the columns it adds.
--
-- Re-runnable: every statement is idempotent.

begin;

-- `gas_consumption` is the only app table without table privileges, so every
-- request fails before its RLS policy is consulted:
--
--   permission denied for table gas_consumption   (SQLSTATE 42501)
--
-- The existing "consumption to vehicle" policy already scopes rows to the
-- owner's vehicles, so the grant is all that is missing.
grant select, insert, update, delete on public.gas_consumption to authenticated;

-- The table records distance and volume only. The app asks for the odometer
-- at each fill-up and derives distance from consecutive readings, so without
-- `odometer` it has nothing to subtract from; the rest is what cost tracking
-- and the full-tank rule in `calculateFuelStatistics` read.
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

commit;
