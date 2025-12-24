-- HackerHouseHub Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('applicant', 'host')),
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Houses table
CREATE TABLE IF NOT EXISTS houses (
  id SERIAL PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  theme TEXT NOT NULL,
  price_per_month NUMERIC(10, 2) NOT NULL,
  duration TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status TEXT NOT NULL DEFAULT 'Recruiting Now' CHECK (status IN ('Recruiting Now', 'Full', 'Closed')),
  admin_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected', 'paused')),
  description TEXT,
  amenities TEXT[],
  highlights TEXT[],
  application_link TEXT,
  images TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  impressions INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  portfolio TEXT,
  "current_role" TEXT,
  company TEXT,
  skills TEXT,
  years_experience INTEGER,
  building_what TEXT,
  why_this_house TEXT,
  duration_preference TEXT,
  move_in_date DATE,
  custom_answers JSONB,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved houses (favorites/bookmarks)
CREATE TABLE IF NOT EXISTS saved_houses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  house_id INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, house_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_houses_host_id ON houses(host_id);
CREATE INDEX IF NOT EXISTS idx_houses_admin_status ON houses(admin_status);
CREATE INDEX IF NOT EXISTS idx_houses_city_state ON houses(city, state);
CREATE INDEX IF NOT EXISTS idx_houses_theme ON houses(theme);
CREATE INDEX IF NOT EXISTS idx_houses_featured ON houses(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_applications_house_id ON applications(house_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_saved_houses_user_id ON saved_houses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_houses_house_id ON saved_houses(house_id);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE houses IS 'Hacker house listings created by hosts';
COMMENT ON TABLE applications IS 'Applications submitted by applicants for houses';
COMMENT ON TABLE saved_houses IS 'User favorites/bookmarked houses';

