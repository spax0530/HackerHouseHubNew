-- Database Functions and Triggers
-- Run this migration after 001_initial_schema.sql and 002_rls_policies.sql

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at
  BEFORE UPDATE ON houses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Prevent non-admins from updating role field
-- ============================================
CREATE OR REPLACE FUNCTION prevent_role_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed, check if user has permission
  -- RLS policies ensure users can only update their own profile (unless admin)
  -- This trigger prevents non-admins from changing the role field
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Check if the user is an admin (admins can change any role)
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    ) THEN
      -- User is not an admin - revert role to old value
      -- This prevents privilege escalation
      NEW.role := OLD.role;
    END IF;
    -- If user is admin, allow the role change (do nothing)
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent role self-updates
DROP TRIGGER IF EXISTS prevent_role_self_update_trigger ON profiles;
CREATE TRIGGER prevent_role_self_update_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_update();

-- ============================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Increment applications_count on application insert
-- ============================================
CREATE OR REPLACE FUNCTION increment_house_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE houses
  SET applications_count = applications_count + 1
  WHERE id = NEW.house_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment applications_count
CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION increment_house_applications_count();

-- ============================================
-- FUNCTION: Decrement applications_count on application delete
-- ============================================
CREATE OR REPLACE FUNCTION decrement_house_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE houses
  SET applications_count = GREATEST(applications_count - 1, 0)
  WHERE id = OLD.house_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to decrement applications_count
CREATE TRIGGER on_application_deleted
  AFTER DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION decrement_house_applications_count();

-- ============================================
-- FUNCTION: Increment impressions when house is viewed
-- ============================================
CREATE OR REPLACE FUNCTION increment_house_impressions(house_id_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE houses
  SET impressions = impressions + 1
  WHERE id = house_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_house_impressions(INTEGER) TO authenticated;

-- ============================================
-- FUNCTION: Get house with host profile (useful for joins)
-- ============================================
CREATE OR REPLACE FUNCTION get_house_with_host(house_id_param INTEGER)
RETURNS TABLE (
  house_data JSONB,
  host_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    row_to_json(h.*)::JSONB as house_data,
    row_to_json(p.*)::JSONB as host_data
  FROM houses h
  JOIN profiles p ON h.host_id = p.id
  WHERE h.id = house_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_house_with_host(INTEGER) TO authenticated;

