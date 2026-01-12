-- Fix Admin Access to Applications
-- This script ensures admins can view all applications
-- Run this in your Supabase SQL Editor

-- ============================================
-- PART 1: Verify and Fix is_admin() Function
-- ============================================

-- Ensure the is_admin() function exists and works correctly
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = user_id
    AND profiles.role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PART 2: Fix Applications RLS Policies
-- ============================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;

-- Create a more explicit admin policy for applications
-- This ensures admins can view ALL applications regardless of other conditions
CREATE POLICY "Admins can view all applications"
ON applications FOR SELECT
USING (
  -- Admin can see everything
  is_admin(auth.uid())
  -- OR applicant can see their own
  OR applicant_id = auth.uid()
  -- OR host can see applications for their houses
  OR EXISTS (
    SELECT 1 FROM houses
    WHERE houses.id = applications.house_id
    AND houses.host_id = auth.uid()
  )
);

-- Ensure admins can update any application
DROP POLICY IF EXISTS "Admins can update any application" ON applications;
CREATE POLICY "Admins can update any application"
ON applications FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Ensure admins can delete any application
DROP POLICY IF EXISTS "Admins can delete any application" ON applications;
CREATE POLICY "Admins can delete any application"
ON applications FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- PART 3: Ensure slug column exists (if migration 005 wasn't run)
-- ============================================

-- Add slug column if it doesn't exist
ALTER TABLE houses 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing houses if they don't have one
UPDATE houses
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name || '-' || city || '-' || state, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- ============================================
-- PART 4: Verify Admin Access
-- ============================================

-- Test query to check if admin policies are working
-- Replace 'YOUR_ADMIN_EMAIL' with your admin email to test
-- This will show you if the is_admin() function works for your account
SELECT 
  id,
  email,
  role,
  is_admin(id) as is_admin_check
FROM profiles
WHERE email = 'admin@gmail.com'; -- Replace with your admin email

-- Check existing applications count
SELECT COUNT(*) as total_applications FROM applications;

-- Check applications with house details (this is what the admin page queries)
-- Note: This will only work if you're logged in as an admin
SELECT 
  a.*,
  h.name as house_name,
  h.city,
  h.state
FROM applications a
LEFT JOIN houses h ON h.id = a.house_id
ORDER BY a.created_at DESC
LIMIT 10;

