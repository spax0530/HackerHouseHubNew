-- Admin Role Support Migration
-- Run this migration after 001_initial_schema.sql, 002_rls_policies.sql, and 003_functions_triggers.sql

-- ============================================
-- PART 1: UPDATE PROFILES TABLE FOR ADMIN ROLE
-- ============================================

-- Drop existing role constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint that includes 'admin' role
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('applicant', 'host', 'admin'));

-- ============================================
-- PART 2: ADMIN RLS POLICIES
-- ============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = user_id
    AND profiles.role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- HOUSES POLICIES FOR ADMINS
-- ============================================

-- Admins can view all houses (regardless of status)
DROP POLICY IF EXISTS "Admins can view all houses" ON houses;
CREATE POLICY "Admins can view all houses"
ON houses FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update any house (including admin_status)
DROP POLICY IF EXISTS "Admins can update any house" ON houses;
CREATE POLICY "Admins can update any house"
ON houses FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Admins can delete any house
DROP POLICY IF EXISTS "Admins can delete any house" ON houses;
CREATE POLICY "Admins can delete any house"
ON houses FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- PROFILES POLICIES FOR ADMINS
-- ============================================

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  is_admin(auth.uid())
  OR auth.uid() = id
);

-- Admins can update any profile (including role)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Admins can insert profiles (for manual user creation if needed)
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admins can delete profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- APPLICATIONS POLICIES FOR ADMINS
-- ============================================

-- Admins can view all applications
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
CREATE POLICY "Admins can view all applications"
ON applications FOR SELECT
USING (
  is_admin(auth.uid())
  OR applicant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM houses
    WHERE houses.id = applications.house_id
    AND houses.host_id = auth.uid()
  )
);

-- Admins can update any application
DROP POLICY IF EXISTS "Admins can update any application" ON applications;
CREATE POLICY "Admins can update any application"
ON applications FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Admins can delete any application
DROP POLICY IF EXISTS "Admins can delete any application" ON applications;
CREATE POLICY "Admins can delete any application"
ON applications FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- SAVED_HOUSES POLICIES FOR ADMINS
-- ============================================

-- Admins can view all saved houses
DROP POLICY IF EXISTS "Admins can view all saved houses" ON saved_houses;
CREATE POLICY "Admins can view all saved houses"
ON saved_houses FOR SELECT
USING (
  is_admin(auth.uid())
  OR user_id = auth.uid()
);

-- ============================================
-- NOTES
-- ============================================
-- To make a user an admin, run this SQL (replace USER_EMAIL with the user's email):
-- UPDATE profiles SET role = 'admin' WHERE email = 'USER_EMAIL';
--
-- Or by user ID:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID';

