-- Supabase Storage Buckets Setup
-- Run this in your Supabase SQL Editor to create storage buckets

-- Create house-images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-images',
  'house-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for house-images bucket
-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public Access for house-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'house-images');

-- Allow authenticated users to upload house images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload house images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'house-images' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own house images
CREATE POLICY IF NOT EXISTS "Users can update own house images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'house-images' AND
  auth.role() = 'authenticated'
);

-- Allow users to delete their own house images
CREATE POLICY IF NOT EXISTS "Users can delete own house images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'house-images' AND
  auth.role() = 'authenticated'
);

-- Storage policies for avatars bucket
-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public Access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

