-- Row Level Security (RLS) Policies
-- Run this migration after 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_houses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Authenticated users can read profiles (for displaying host info, etc.)
-- Restricted to authenticated users to prevent email enumeration and protect privacy
CREATE POLICY IF NOT EXISTS "Authenticated users can view profiles"
ON profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but good to have)
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- HOUSES POLICIES
-- ============================================

-- Public can view approved houses only
CREATE POLICY IF NOT EXISTS "Public can view approved houses"
ON houses FOR SELECT
USING (admin_status = 'approved');

-- Hosts can view their own houses (including pending/rejected)
CREATE POLICY IF NOT EXISTS "Hosts can view own houses"
ON houses FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  host_id = auth.uid()
);

-- Hosts can insert their own houses
CREATE POLICY IF NOT EXISTS "Hosts can create own houses"
ON houses FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  host_id = auth.uid()
);

-- Hosts can update their own houses
CREATE POLICY IF NOT EXISTS "Hosts can update own houses"
ON houses FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  host_id = auth.uid()
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  host_id = auth.uid()
);

-- Hosts can delete their own houses
CREATE POLICY IF NOT EXISTS "Hosts can delete own houses"
ON houses FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  host_id = auth.uid()
);

-- ============================================
-- APPLICATIONS POLICIES
-- ============================================

-- Applicants can view their own applications
CREATE POLICY IF NOT EXISTS "Applicants can view own applications"
ON applications FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  applicant_id = auth.uid()
);

-- Hosts can view applications for their houses
CREATE POLICY IF NOT EXISTS "Hosts can view applications for their houses"
ON applications FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM houses
    WHERE houses.id = applications.house_id
    AND houses.host_id = auth.uid()
  )
);

-- Authenticated users can create applications
CREATE POLICY IF NOT EXISTS "Authenticated users can create applications"
ON applications FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  applicant_id = auth.uid()
);

-- Hosts can update applications for their houses
CREATE POLICY IF NOT EXISTS "Hosts can update applications for their houses"
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

-- Applicants can update their own applications (for status changes, etc.)
CREATE POLICY IF NOT EXISTS "Applicants can update own applications"
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
-- SAVED_HOUSES POLICIES
-- ============================================

-- Users can view their own saved houses
CREATE POLICY IF NOT EXISTS "Users can view own saved houses"
ON saved_houses FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
);

-- Users can insert their own saved houses
CREATE POLICY IF NOT EXISTS "Users can save houses"
ON saved_houses FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
);

-- Users can delete their own saved houses
CREATE POLICY IF NOT EXISTS "Users can unsave houses"
ON saved_houses FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
);

