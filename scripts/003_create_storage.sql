-- Create storage bucket for images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up RLS policies for the images bucket
-- Allow authenticated users to upload images
create policy "images_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'images');

-- Allow authenticated users to update their own images
create policy "images_update_own"
on storage.objects for update
to authenticated
using (bucket_id = 'images' AND auth.uid() = owner);

-- Allow authenticated users to delete their own images
create policy "images_delete_own"
on storage.objects for delete
to authenticated
using (bucket_id = 'images' AND auth.uid() = owner);

-- Allow public access to read images (since bucket is public)
create policy "images_select_public"
on storage.objects for select
to public
using (bucket_id = 'images');

-- Create a table to track image processing jobs
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_url text not null,
  processed_url text,
  status text not null default 'pending', -- pending, processing, completed, failed
  file_name text,
  file_size integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on images table
alter table public.images enable row level security;

-- RLS policies for images
create policy "images_select_own" on public.images for select using (auth.uid() = user_id);
create policy "images_insert_own" on public.images for insert with check (auth.uid() = user_id);
create policy "images_update_own" on public.images for update using (auth.uid() = user_id);
create policy "images_delete_own" on public.images for delete using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists idx_images_user_id on public.images(user_id);
create index if not exists idx_images_status on public.images(status);
