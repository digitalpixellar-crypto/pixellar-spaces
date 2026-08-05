-- PIXELLAR SPACES — OWNER SUBMISSION UPDATE
-- Run this once in Supabase SQL Editor before uploading the website files.

create table if not exists public.owner_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  owner_phone text not null,
  owner_email text,
  city text not null check (city in ('Hyderabad','Bengaluru')),
  property_type text not null check (property_type in ('Home','Office')),
  locality text not null,
  address text,
  expected_rent text not null,
  deposit text,
  maintenance text,
  bedrooms integer,
  bathrooms integer,
  area_sqft integer,
  furnishing text,
  available_from date,
  amenities text[] not null default '{}',
  description text,
  image_urls text[] not null default '{}',
  consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','contacted','approved','rejected')),
  approved_property_id uuid references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.owner_submissions enable row level security;

drop policy if exists "public can create owner submissions" on public.owner_submissions;
create policy "public can create owner submissions" on public.owner_submissions
for insert to anon, authenticated with check (consent = true and status = 'pending');

drop policy if exists "admins can read owner submissions" on public.owner_submissions;
create policy "admins can read owner submissions" on public.owner_submissions for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admins can update owner submissions" on public.owner_submissions;
create policy "admins can update owner submissions" on public.owner_submissions for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admins can delete owner submissions" on public.owner_submissions;
create policy "admins can delete owner submissions" on public.owner_submissions for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create index if not exists owner_submissions_status_idx on public.owner_submissions(status, created_at desc);

-- Permit public photo uploads while keeping file changes/removal admin-only.
drop policy if exists "public can upload property images" on storage.objects;
create policy "public can upload property images" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'property-images');

