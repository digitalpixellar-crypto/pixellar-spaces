-- Pixellar Spaces Update 4: safe additive migration
alter table public.leads add column if not exists scheduled_at timestamptz;
alter table public.leads add column if not exists visit_notes text;
alter table public.leads add column if not exists cancellation_reason text;
alter table public.properties add column if not exists verified boolean not null default false;
alter table public.properties add column if not exists verified_at timestamptz;
create index if not exists leads_scheduled_at_idx on public.leads (scheduled_at);
create index if not exists leads_city_status_idx on public.leads (city, status);
create index if not exists properties_verified_idx on public.properties (verified);
update public.properties set verified=true, verified_at=coalesce(verified_at,now()) where lower(coalesce(badge,''))='verified' and verified=false;
