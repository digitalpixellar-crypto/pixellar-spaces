-- Safe additive migration. Existing properties, leads and owners are preserved.
alter table public.properties add column if not exists featured boolean not null default false;
alter table public.properties add column if not exists featured_until timestamptz;
alter table public.properties add column if not exists listing_expires_at timestamptz;
alter table public.properties add column if not exists subscription_id uuid;
create table if not exists public.subscription_checkouts (id uuid primary key default gen_random_uuid(),plan_code text not null,account_type text not null check(account_type in('owner','broker')),customer_name text not null,customer_phone text not null,customer_email text not null,amount_paise integer not null check(amount_paise>0),status text not null default 'created',razorpay_order_id text unique,razorpay_payment_id text unique,paid_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.subscriptions (id uuid primary key default gen_random_uuid(),checkout_id uuid references public.subscription_checkouts(id),plan_code text not null,account_type text not null,customer_name text not null,customer_phone text not null,customer_email text not null,status text not null default 'active',starts_at timestamptz not null default now(),expires_at timestamptz not null,created_at timestamptz not null default now());
alter table public.properties drop constraint if exists properties_subscription_id_fkey;
alter table public.properties add constraint properties_subscription_id_fkey foreign key(subscription_id) references public.subscriptions(id) on delete set null;
create index if not exists properties_featured_idx on public.properties(featured,featured_until);
create index if not exists properties_listing_expiry_idx on public.properties(listing_expires_at);
create index if not exists subscriptions_status_expiry_idx on public.subscriptions(status,expires_at);
alter table public.subscription_checkouts enable row level security;
alter table public.subscriptions enable row level security;
drop policy if exists "admins read checkouts" on public.subscription_checkouts;
create policy "admins read checkouts" on public.subscription_checkouts for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "admins read subscriptions" on public.subscriptions;
create policy "admins read subscriptions" on public.subscriptions for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
notify pgrst, 'reload schema';
