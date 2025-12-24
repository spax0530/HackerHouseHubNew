# Adding Demo Content to HackerHouseHub

This guide will help you populate your Supabase database with demo houses and content so you can see the app in action.

## Quick Start

1. **Go to your Supabase SQL Editor**
   - Navigate to: https://supabase.com/dashboard/project/dwgowbbzvncolxsnvmvp
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Run the demo data script**
   - Open the file: `supabase/migrations/004_demo_data.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify the data**
   - Go to **Table Editor** → **houses**
   - You should see 8 demo houses with various themes, cities, and statuses

## What Gets Added

The demo data script adds:

- **5 Host Profiles** (Sarah Chen, Mike Rodriguez, Jessica Kim, David Patel, Emma Wilson)
- **8 Demo Houses** across different cities and themes:
  - AI Innovation House (San Francisco) - Featured
  - Climate Tech Hub (Austin) - Featured
  - Crypto Builders House (Miami)
  - Hardware Lab (San Francisco) - Featured
  - General Startup House (New York) - Full
  - AI Research Lab (Seattle)
  - Climate Solutions House (Los Angeles)
  - Crypto Innovation Hub (Austin)

All houses are set to `admin_status = 'approved'` so they'll be visible on your site.

## Important Notes

### About User Profiles

The demo script creates profile records, but **these won't work for authentication** because:
- Profiles are normally created when users sign up through the app
- The demo profiles use placeholder UUIDs that don't match real auth users

**To test authentication:**
1. Sign up through your app at `/auth/sign-up`
2. Choose either "Builder" (applicant) or "Host" (host) role
3. Your profile will be created automatically

### Testing the App

After adding demo data:

1. **View houses** - Go to the homepage or `/search` to see all demo houses
2. **Filter by theme** - Try filtering by AI, Climate, Crypto, Hardware, or General Startup
3. **Filter by city** - Filter by San Francisco, Austin, Miami, etc.
4. **View house details** - Click on any house to see full details

### Adding More Demo Data

You can modify `004_demo_data.sql` to add more houses. Just follow the same pattern:

```sql
INSERT INTO houses (
  host_id, name, city, state, theme, price_per_month, duration, capacity,
  status, admin_status, description, amenities, highlights, application_link,
  images, featured, impressions, applications_count, created_at, updated_at
)
SELECT 
  p.id as host_id,
  'Your House Name' as name,
  'City' as city,
  'ST' as state,
  'Theme' as theme,
  1000.00 as price_per_month,
  '3–6 months' as duration,
  10 as capacity,
  'Recruiting Now' as status,
  'approved' as admin_status,
  'Your description here' as description,
  ARRAY['Amenity 1', 'Amenity 2'] as amenities,
  ARRAY['Highlight 1', 'Highlight 2'] as highlights,
  NULL as application_link,
  ARRAY['image-url-1', 'image-url-2'] as images,
  false as featured,
  0 as impressions,
  0 as applications_count,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'host' AND p.email = 'sarah.chen@example.com'
LIMIT 1;
```

## Troubleshooting

**No houses showing up?**
- Make sure `admin_status = 'approved'` (the demo script sets this)
- Check that you ran the SQL script successfully
- Refresh your browser

**Want to clear demo data?**
```sql
-- Delete all houses (be careful!)
DELETE FROM houses;

-- Delete all profiles (be careful!)
DELETE FROM profiles;
```

**Want to reset and start fresh?**
You can re-run the demo data script - it uses `ON CONFLICT DO NOTHING` so it won't create duplicates.

## Next Steps

After adding demo data:
1. ✅ Test viewing houses on the homepage
2. ✅ Test search and filtering
3. ✅ Sign up as a user to test authentication
4. ✅ Sign up as a host to create your own house
5. ✅ Test submitting an application

Enjoy exploring your HackerHouseHub app!

