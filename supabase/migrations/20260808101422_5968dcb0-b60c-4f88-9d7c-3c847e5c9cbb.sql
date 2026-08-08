alter type public.visit_state add value if not exists 'pending';
alter type public.visit_state add value if not exists 'declined';

alter table public.visits
  add column if not exists visit_date text not null default '',
  add column if not exists visit_time text not null default '',
  add column if not exists who text not null default '',
  add column if not exists who_avatar text not null default '',
  add column if not exists counter_of uuid,
  add column if not exists proposed_by_side text not null default 'seeker',
  add column if not exists seeker_confirmed_done boolean not null default false,
  add column if not exists landlord_confirmed_done boolean not null default false;

alter table public.listings
  add column if not exists owner_card jsonb not null default '{}'::jsonb;

alter table public.matches
  add column if not exists candidate jsonb not null default '{}'::jsonb,
  add column if not exists chat_id uuid;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target text not null,
  target_id text not null,
  reason text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports_own" on public.reports for select to authenticated using (reporter_id = auth.uid());
create policy "reports_insert_own" on public.reports for insert to authenticated with check (reporter_id = auth.uid());