-- Ensure Admin Access to All Applications
-- Run this in your Supabase SQL Editor to fix admin access issues
-- This script ensures admins can view ALL applications and ALL fields

-- ============================================
-- PART 1: Ensure is_admin() function exists
-- ============================================

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = user_id
    AND profiles.role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PART 2: Drop ALL existing application policies
-- ============================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Applicants can view own applications" ON applications;
DROP POLICY IF EXISTS "Hosts can view applications for their houses" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
DROP POLICY IF EXISTS "Applications SELECT policy" ON applications;
DROP POLICY IF EXISTS "Admins can update any application" ON applications;
DROP POLICY IF EXISTS "Admins can delete any application" ON applications;
DROP POLICY IF EXISTS "Hosts can update applications for their houses" ON applications;
DROP POLICY IF EXISTS "Applicants can update own applications" ON applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON applications;

-- ============================================
-- PART 3: Create comprehensive SELECT policy
-- ============================================

-- Note: SELECT policies are already dropped in PART 2

-- Single comprehensive SELECT policy that handles all cases
-- Admins can see everything, applicants see their own, hosts see their house applications
CREATE POLICY "Applications SELECT policy"
ON applications FOR SELECT
USING (
  -- Admins can see ALL applications
  is_admin(auth.uid())
  -- OR applicants can see their own
  OR applicant_id = auth.uid()
  -- OR hosts can see applications for their houses
  OR EXISTS (
    SELECT 1 FROM houses
    WHERE houses.id = applications.house_id
    AND houses.host_id = auth.uid()
  )
);

-- ============================================
-- PART 4: Create UPDATE policies
-- ============================================

-- Note: UPDATE policies are already dropped in PART 2, but we ensure they're dropped here too
DROP POLICY IF EXISTS "Admins can update any application" ON applications;
DROP POLICY IF EXISTS "Hosts can update applications for their houses" ON applications;
DROP POLICY IF EXISTS "Applicants can update own applications" ON applications;

-- Admins can update any application
CREATE POLICY "Admins can update any application"
ON applications FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Hosts can update applications for their houses
CREATE POLICY "Hosts can update applications for their houses"
ON applications FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM houses
    WHERE houses.id = applications.house_id
    AND houses.host_id = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM houses
    WHERE houses.id = applications.house_id
    AND houses.host_id = auth.uid()
  )
);

-- Applicants can update their own applications (limited - usually just status)
CREATE POLICY "Applicants can update own applications"
ON applications FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  applicant_id = auth.uid()
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  applicant_id = auth.uid()
);

-- ============================================
-- PART 5: Create DELETE policy (admins only)
-- ============================================

-- Note: DELETE policies are already dropped in PART 2

CREATE POLICY "Admins can delete any application"
ON applications FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- PART 6: Create INSERT policy
-- ============================================

-- Note: INSERT policies are already dropped in PART 2

-- Authenticated users can create applications
CREATE POLICY "Authenticated users can create applications"
ON applications FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  applicant_id = auth.uid()
);

-- ============================================
-- PART 7: Verify admin access
-- ============================================

-- Test query - replace with your admin email
-- This should return true if you're an admin
SELECT 
  id,
  email,
  role,
  is_admin(id) as is_admin_check
FROM profiles
WHERE role = 'admin'
LIMIT 5;

-- Count total applications (should work for admins)
SELECT COUNT(*) as total_applications FROM applications;

