-- PIXELLAR SPACES — UPDATE 3 SAFE MIGRATION
-- Run once in Supabase SQL Editor BEFORE deploying Update 3.
-- Existing properties, leads and admin users are preserved.

alter table public.properties add column if not exists deposit text;
alter table public.properties add column if not exists maintenance text;
alter table public.properties add column if not exists bedrooms integer;
alter table public.properties add column if not exists bathrooms integer;
alter table public.properties add column if not exists furnishing text;
alter table public.properties add column if not exists area_sqft integer;
alter table public.properties add column if not exists available_from date;
alter table public.properties add column if not exists address text;
alter table public.properties add column if not exists address_visibility text not null default 'approximate';
alter table public.properties add column if not exists map_url text;
alter table public.properties add column if not exists amenities text[] not null default '{}';
alter table public.properties add column if not exists restrictions text[] not null default '{}';
alter table public.properties add column if not exists description text;
alter table public.properties add column if not exists image_urls text[] not null default '{}';

update public.properties
set image_urls = array[image_url]
where image_url is not null and cardinality(image_urls) = 0;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view property images" on storage.objects;
create policy "public can view property images" on storage.objects
for select to anon, authenticated
using (bucket_id = 'property-images');

drop policy if exists "admins can upload property images" on storage.objects;
create policy "admins can upload property images" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'property-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "admins can update property images" on storage.objects;
create policy "admins can update property images" on storage.objects
for update to authenticated
using (
  bucket_id = 'property-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'property-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "admins can delete property images" on storage.objects;
create policy "admins can delete property images" on storage.objects
for delete to authenticated
using (
  bucket_id = 'property-images'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);
