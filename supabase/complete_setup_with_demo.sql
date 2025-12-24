-- Complete Setup Script: Schema + Demo Data
-- Run this ENTIRE script in your Supabase SQL Editor
-- This will create all tables AND add demo content

-- ============================================
-- PART 1: CREATE SCHEMA (if not exists)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
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

-- Saved houses table
CREATE TABLE IF NOT EXISTS saved_houses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  house_id INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, house_id)
);

-- Create indexes
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

-- ============================================
-- PART 2: ENABLE RLS AND POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_houses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Houses policies
DROP POLICY IF EXISTS "Public can view approved houses" ON houses;
CREATE POLICY "Public can view approved houses" ON houses FOR SELECT USING (admin_status = 'approved');

DROP POLICY IF EXISTS "Hosts can view own houses" ON houses;
CREATE POLICY "Hosts can view own houses" ON houses FOR SELECT USING (auth.role() = 'authenticated' AND host_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can create own houses" ON houses;
CREATE POLICY "Hosts can create own houses" ON houses FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND host_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can update own houses" ON houses;
CREATE POLICY "Hosts can update own houses" ON houses FOR UPDATE USING (auth.role() = 'authenticated' AND host_id = auth.uid()) WITH CHECK (auth.role() = 'authenticated' AND host_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can delete own houses" ON houses;
CREATE POLICY "Hosts can delete own houses" ON houses FOR DELETE USING (auth.role() = 'authenticated' AND host_id = auth.uid());

-- Applications policies
DROP POLICY IF EXISTS "Applicants can view own applications" ON applications;
CREATE POLICY "Applicants can view own applications" ON applications FOR SELECT USING (auth.role() = 'authenticated' AND applicant_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can view applications for their houses" ON applications;
CREATE POLICY "Hosts can view applications for their houses" ON applications FOR SELECT USING (
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM houses WHERE houses.id = applications.house_id AND houses.host_id = auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can create applications" ON applications;
CREATE POLICY "Authenticated users can create applications" ON applications FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND applicant_id = auth.uid());

-- Saved houses policies
DROP POLICY IF EXISTS "Users can view own saved houses" ON saved_houses;
CREATE POLICY "Users can view own saved houses" ON saved_houses FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can save houses" ON saved_houses;
CREATE POLICY "Users can save houses" ON saved_houses FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave houses" ON saved_houses;
CREATE POLICY "Users can unsave houses" ON saved_houses FOR DELETE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- ============================================
-- PART 3: FUNCTIONS AND TRIGGERS
-- ============================================

-- Update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_houses_updated_at ON houses;
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile function
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Application count functions
CREATE OR REPLACE FUNCTION increment_house_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE houses SET applications_count = applications_count + 1 WHERE id = NEW.house_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_created ON applications;
CREATE TRIGGER on_application_created AFTER INSERT ON applications FOR EACH ROW EXECUTE FUNCTION increment_house_applications_count();

CREATE OR REPLACE FUNCTION decrement_house_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE houses SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = OLD.house_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_deleted ON applications;
CREATE TRIGGER on_application_deleted AFTER DELETE ON applications FOR EACH ROW EXECUTE FUNCTION decrement_house_applications_count();

-- ============================================
-- PART 4: DEMO DATA
-- ============================================

-- Create demo host profiles (using generated UUIDs)
-- These are placeholder profiles for demo houses
INSERT INTO profiles (id, email, full_name, role, bio, linkedin_url, github_url, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'sarah.chen@example.com', 'Sarah Chen', 'host', 
   'Tech entrepreneur and startup founder. Passionate about building communities for builders.', 
   'https://linkedin.com/in/sarahchen', 'https://github.com/sarahchen', NOW(), NOW()),
  (gen_random_uuid(), 'mike.rodriguez@example.com', 'Mike Rodriguez', 'host',
   'AI researcher and serial entrepreneur. Founded 3 startups in the AI space.',
   'https://linkedin.com/in/mikerodriguez', 'https://github.com/mikerodriguez', NOW(), NOW()),
  (gen_random_uuid(), 'jessica.kim@example.com', 'Jessica Kim', 'host',
   'Climate tech advocate and startup advisor. Building the future of sustainable technology.',
   'https://linkedin.com/in/jessicakim', 'https://github.com/jessicakim', NOW(), NOW()),
  (gen_random_uuid(), 'david.patel@example.com', 'David Patel', 'host',
   'Crypto and blockchain developer. Building decentralized applications.',
   'https://linkedin.com/in/davidpatel', 'https://github.com/davidpatel', NOW(), NOW()),
  (gen_random_uuid(), 'emma.wilson@example.com', 'Emma Wilson', 'host',
   'Hardware engineer and maker. Passionate about IoT and smart devices.',
   'https://linkedin.com/in/emmawilson', 'https://github.com/emmawilson', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo houses (using separate INSERT statements to avoid UNION ALL issues)
INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'AI Innovation House' as name,
  'San Francisco' as city,
  'CA' as state,
  'AI' as theme,
  1200.00 as price_per_month,
  '3–6 months' as duration,
  12 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'A vibrant community of AI researchers, ML engineers, and startup founders working on the next generation of AI products. Located in the heart of SOMA, walking distance to major tech companies.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Coffee station', 'Gym access'] as amenities,
  ARRAY['Weekly AI meetups', 'Access to GPU clusters', 'Mentorship from AI founders', 'Demo day opportunities'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop'
  ] as images,
  true as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p WHERE p.email = 'sarah.chen@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'Climate Tech Hub',
  'Austin',
  'TX',
  'Climate',
  950.00,
  '6–12 months',
  8,
  'Recruiting Now',
  'approved',
  'Join a community of climate tech founders and engineers building solutions for a sustainable future. Solar-powered house with EV charging stations.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Coffee station'],
  ARRAY['Climate tech networking events', 'Access to impact investors', 'Sustainability workshops', 'Green tech mentorship'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  true,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'jessica.kim@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'Crypto Builders House',
  'Miami',
  'FL',
  'Crypto',
  1100.00,
  '3–6 months',
  10,
  'Recruiting Now',
  'approved',
  'A beachside hacker house for crypto and Web3 builders. Perfect for DeFi developers, NFT creators, and blockchain entrepreneurs.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Rooftop terrace'],
  ARRAY['Crypto meetups', 'Blockchain workshops', 'DeFi hackathons', 'Web3 investor connections'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop'
  ],
  false,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'david.patel@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'Hardware Lab',
  'San Francisco',
  'CA',
  'Hardware',
  1350.00,
  '6–12 months',
  15,
  'Recruiting Now',
  'approved',
  'State-of-the-art hardware makerspace with 3D printers, CNC machines, and electronics lab. Perfect for IoT developers and hardware startups.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Gym access'],
  ARRAY['Hardware prototyping lab', '3D printing access', 'Electronics workshop', 'Hardware mentorship'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  true,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'emma.wilson@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'General Startup House',
  'New York',
  'NY',
  'General Startup',
  1500.00,
  '3–6 months',
  20,
  'Full',
  'approved',
  'A diverse community of founders building across all industries. Great networking opportunities and access to NYC startup ecosystem.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Coffee station'],
  ARRAY['NYC startup events', 'Investor connections', 'Co-working space access', 'Founder mentorship'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  false,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'mike.rodriguez@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'AI Research Lab',
  'Seattle',
  'WA',
  'AI',
  1000.00,
  '12+ months',
  6,
  'Recruiting Now',
  'approved',
  'Long-term research-focused house for AI PhD students and researchers. Quiet environment perfect for deep work.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms'],
  ARRAY['Research collaboration', 'Academic connections', 'Paper writing support', 'Conference access'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  false,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'sarah.chen@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'Climate Solutions House',
  'Los Angeles',
  'CA',
  'Climate',
  800.00,
  '1–3 months',
  7,
  'Recruiting Now',
  'approved',
  'Short-term stays for climate tech founders. Perfect for those in between funding rounds or pivoting their startup.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace'],
  ARRAY['Climate tech network', 'Impact investor intros', 'Sustainability workshops'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  false,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'jessica.kim@example.com' LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id,
  'Crypto Innovation Hub',
  'Austin',
  'TX',
  'Crypto',
  1250.00,
  '3–6 months',
  14,
  'Recruiting Now',
  'approved',
  'Vibrant crypto community in the heart of Austin. Great for DeFi protocols, NFT marketplaces, and blockchain infrastructure.',
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Coffee station'],
  ARRAY['Crypto meetups', 'DeFi workshops', 'Blockchain hackathons', 'Web3 investor network'],
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  false,
  0,
  0,
  NOW(),
  NOW()
FROM profiles p WHERE p.email = 'david.patel@example.com' LIMIT 1;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE '✅ Database schema created';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Demo data added (8 houses)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your HackerHouseHub is ready!';
  RAISE NOTICE 'Visit your app to see the demo houses.';
END $$;
