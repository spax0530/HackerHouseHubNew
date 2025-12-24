-- Demo Data for HackerHouseHub
-- Run this in your Supabase SQL Editor after running the initial schema migrations
-- This will populate your database with sample houses, users, and applications

-- Note: This creates demo profiles. In production, profiles are created via auth signup.
-- For demo purposes, we'll insert profiles directly (you'll need to create auth users separately if you want to test login)

-- ============================================
-- DEMO PROFILES (Hosts and Applicants)
-- ============================================

-- Insert demo host profiles
-- Note: These UUIDs are placeholders. In real usage, profiles are created when users sign up via auth.
-- For demo, you can either:
-- 1. Sign up users through the app first, then update their profiles
-- 2. Create auth users manually and use their UUIDs here

-- For now, we'll create some demo profiles with placeholder UUIDs
-- You can replace these with actual user IDs after creating auth users

INSERT INTO profiles (id, email, full_name, role, bio, linkedin_url, github_url, created_at, updated_at)
VALUES
  -- Host 1
  (gen_random_uuid(), 'sarah.chen@example.com', 'Sarah Chen', 'host', 
   'Tech entrepreneur and startup founder. Passionate about building communities for builders.', 
   'https://linkedin.com/in/sarahchen', 'https://github.com/sarahchen', NOW(), NOW()),
  
  -- Host 2
  (gen_random_uuid(), 'mike.rodriguez@example.com', 'Mike Rodriguez', 'host',
   'AI researcher and serial entrepreneur. Founded 3 startups in the AI space.',
   'https://linkedin.com/in/mikerodriguez', 'https://github.com/mikerodriguez', NOW(), NOW()),
  
  -- Host 3
  (gen_random_uuid(), 'jessica.kim@example.com', 'Jessica Kim', 'host',
   'Climate tech advocate and startup advisor. Building the future of sustainable technology.',
   'https://linkedin.com/in/jessicakim', 'https://github.com/jessicakim', NOW(), NOW()),
  
  -- Host 4
  (gen_random_uuid(), 'david.patel@example.com', 'David Patel', 'host',
   'Crypto and blockchain developer. Building decentralized applications.',
   'https://linkedin.com/in/davidpatel', 'https://github.com/davidpatel', NOW(), NOW()),
  
  -- Host 5
  (gen_random_uuid(), 'emma.wilson@example.com', 'Emma Wilson', 'host',
   'Hardware engineer and maker. Passionate about IoT and smart devices.',
   'https://linkedin.com/in/emmawilson', 'https://github.com/emmawilson', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Get the host IDs we just created (we'll use these for houses)
-- We'll use a subquery approach instead

-- ============================================
-- DEMO HOUSES
-- ============================================

-- Insert demo houses
-- Note: We need to get actual host_id values. Let's use a subquery to get the first host
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
FROM profiles p
WHERE p.role = 'host' AND p.email = 'sarah.chen@example.com'
LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'Climate Tech Hub' as name,
  'Austin' as city,
  'TX' as state,
  'Climate' as theme,
  950.00 as price_per_month,
  '6–12 months' as duration,
  8 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'Join a community of climate tech founders and engineers building solutions for a sustainable future. Solar-powered house with EV charging stations.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Coffee station'] as amenities,
  ARRAY['Climate tech networking events', 'Access to impact investors', 'Sustainability workshops', 'Green tech mentorship'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ] as images,
  true as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'jessica.kim@example.com'
LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'Crypto Builders House' as name,
  'Miami' as city,
  'FL' as state,
  'Crypto' as theme,
  1100.00 as price_per_month,
  '3–6 months' as duration,
  10 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'A beachside hacker house for crypto and Web3 builders. Perfect for DeFi developers, NFT creators, and blockchain entrepreneurs.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Rooftop terrace'] as amenities,
  ARRAY['Crypto meetups', 'Blockchain workshops', 'DeFi hackathons', 'Web3 investor connections'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop'
  ] as images,
  false as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'david.patel@example.com'
LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'Hardware Lab' as name,
  'San Francisco' as city,
  'CA' as state,
  'Hardware' as theme,
  1350.00 as price_per_month,
  '6–12 months' as duration,
  15 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'State-of-the-art hardware makerspace with 3D printers, CNC machines, and electronics lab. Perfect for IoT developers and hardware startups.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Gym access'] as amenities,
  ARRAY['Hardware prototyping lab', '3D printing access', 'Electronics workshop', 'Hardware mentorship'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ] as images,
  true as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'emma.wilson@example.com'
LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'General Startup House' as name,
  'New York' as city,
  'NY' as state,
  'General Startup' as theme,
  1500.00 as price_per_month,
  '3–6 months' as duration,
  20 as capacity,
  'Full' as status,
  'approved' as admin_status,
  'A diverse community of founders building across all industries. Great networking opportunities and access to NYC startup ecosystem.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Coffee station'] as amenities,
  ARRAY['NYC startup events', 'Investor connections', 'Co-working space access', 'Founder mentorship'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ] as images,
  false as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'mike.rodriguez@example.com'
LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'AI Research Lab' as name,
  'Seattle' as city,
  'WA' as state,
  'AI' as theme,
  1000.00 as price_per_month,
  '12+ months' as duration,
  6 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'Long-term research-focused house for AI PhD students and researchers. Quiet environment perfect for deep work.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms'] as amenities,
  ARRAY['Research collaboration', 'Academic connections', 'Paper writing support', 'Conference access'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ] as images,
  false as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'sarah.chen@example.com'
LIMIT 1;

-- Add a few more houses for variety
INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'Climate Solutions House' as name,
  'Los Angeles' as city,
  'CA' as state,
  'Climate' as theme,
  800.00 as price_per_month,
  '1–3 months' as duration,
  7 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'Short-term stays for climate tech founders. Perfect for those in between funding rounds or pivoting their startup.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace'] as amenities,
  ARRAY['Climate tech network', 'Impact investor intros', 'Sustainability workshops'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ] as images,
  false as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'jessica.kim@example.com'
LIMIT 1;

INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'Crypto Innovation Hub' as name,
  'Austin' as city,
  'TX' as state,
  'Crypto' as theme,
  1250.00 as price_per_month,
  '3–6 months' as duration,
  14 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'Vibrant crypto community in the heart of Austin. Great for DeFi protocols, NFT marketplaces, and blockchain infrastructure.' as description,
  ARRAY['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Coffee station'] as amenities,
  ARRAY['Crypto meetups', 'DeFi workshops', 'Blockchain hackathons', 'Web3 investor network'] as highlights,
  NULL as application_link,
  ARRAY[
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ] as images,
  false as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'david.patel@example.com'
LIMIT 1;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Demo data inserted successfully!';
  RAISE NOTICE 'You now have sample houses in your database.';
  RAISE NOTICE 'Note: To test user authentication, sign up through the app first.';
END $$;

