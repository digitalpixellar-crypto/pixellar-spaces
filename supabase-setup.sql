-- PIXELLAR SPACES — UPDATE 2 DATABASE
-- Run this entire file in Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  property_code text not null unique,
  title text not null,
  city text not null check (city in ('Hyderabad','Bengaluru')),
  property_type text not null check (property_type in ('Home','Office')),
  locality text not null,
  rent text not null,
  specs text[] not null default '{}',
  badge text not null default 'Verified',
  availability text not null default 'Ready now',
  image_url text,
  status text not null default 'active' check (status in ('active','draft','rented')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null check (lead_type in ('visit','requirement','owner')),
  property_id uuid references public.properties(id) on delete set null,
  property_title text,
  full_name text not null,
  phone text not null,
  city text not null,
  space_type text not null,
  locality_budget text,
  details text,
  status text not null default 'new' check (status in ('new','contacted','visit_scheduled','qualified','closed','lost')),
  visit_date timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;

drop policy if exists "admin can read own profile" on public.admin_users;
create policy "admin can read own profile" on public.admin_users
for select to authenticated using (user_id = auth.uid());

drop policy if exists "public can view active properties" on public.properties;
create policy "public can view active properties" on public.properties
for select to anon, authenticated using (
  status = 'active' or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "admins can insert properties" on public.properties;
create policy "admins can insert properties" on public.properties for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins can update properties" on public.properties;
create policy "admins can update properties" on public.properties for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins can delete properties" on public.properties;
create policy "admins can delete properties" on public.properties for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "public can create leads" on public.leads;
create policy "public can create leads" on public.leads for insert to anon, authenticated with check (true);
drop policy if exists "admins can read leads" on public.leads;
create policy "admins can read leads" on public.leads for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins can update leads" on public.leads;
create policy "admins can update leads" on public.leads for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins can delete leads" on public.leads;
create policy "admins can delete leads" on public.leads for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create index if not exists properties_city_type_idx on public.properties(city, property_type, status);
create index if not exists leads_created_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);

-- AFTER creating your admin in Authentication > Users, replace the two values below,
-- uncomment the statement and run it once.
-- insert into public.admin_users (user_id, email, full_name)
-- values ('PASTE-AUTH-USER-UUID', 'YOUR-ADMIN-EMAIL', 'Yeswanth Reddy');

-- Optional starter records. The admin dashboard can also add properties.
insert into public.properties (property_code,title,city,property_type,locality,rent,specs,badge,availability,status)
values
('PS-001','Serene 2 BHK in a gated community','Hyderabad','Home','Kondapur, Hyderabad','₹36,000/mo',array['2 Beds','2 Baths','1,180 sq.ft'],'Verified','Ready now','active'),
('PS-002','Plug-and-play studio office','Bengaluru','Office','HSR Layout, Bengaluru','₹58,000/mo',array['12 Seats','1 Cabin','850 sq.ft'],'Managed','Ready now','active'),
('PS-003','Premium workspace with skyline views','Hyderabad','Office','Financial District, Hyderabad','₹1.25L/mo',array['24 Seats','2 Cabins','1,650 sq.ft'],'Exclusive','From Aug 15','active')
on conflict (property_code) do nothing;
