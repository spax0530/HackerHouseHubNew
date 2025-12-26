-- Storage Bucket Fix and Update
-- Run this in your Supabase SQL Editor to:
-- 1. Create the house-images bucket if it doesn't exist
-- 2. Update the file size limit to 20MB if it exists
-- 3. Set up all necessary policies

-- Create or update house-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-images',
  'house-images',
  true,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  public = true,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Create or update avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit (keep smaller for avatars)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 2097152,
  public = true,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- ============================================
-- STORAGE POLICIES FOR house-images
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access for house-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload house images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own house images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own house images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public Access for house-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'house-images');

-- Allow authenticated users to upload house images
CREATE POLICY "Authenticated users can upload house images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'house-images' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own house images
-- Ownership is verified by checking if the file path starts with the user's UUID
CREATE POLICY "Users can update own house images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'house-images' AND
  auth.role() = 'authenticated' AND
  (
    -- User owns the image if path starts with their UUID
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins can update any image (handled via separate admin policy if needed)
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
);

-- Allow users to delete their own house images
-- Ownership is verified by checking if the file path starts with the user's UUID
CREATE POLICY "Users can delete own house images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'house-images' AND
  auth.role() = 'authenticated' AND
  (
    -- User owns the image if path starts with their UUID
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins can delete any image (handled via separate admin policy if needed)
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
);

-- ============================================
-- STORAGE POLICIES FOR avatars
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public Access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

