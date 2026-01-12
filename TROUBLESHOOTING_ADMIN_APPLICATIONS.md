# Troubleshooting: Admin Applications Page Not Loading

If you're seeing "Failed to load applications" error, follow these steps:

## Step 1: Clear Browser Cache

The error `column houses_1.slug does not exist` suggests the browser is using cached JavaScript.

**Option A: Hard Refresh**
- **Mac**: Press `Cmd + Shift + R`
- **Windows/Linux**: Press `Ctrl + Shift + R`
- Or: `Ctrl + F5` (Windows)

**Option B: Clear Cache Completely**
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Use Incognito/Private Mode**
- Open a new incognito/private window
- Navigate to your app
- This bypasses all cache

## Step 2: Restart Dev Server

Stop and restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 3: Run SQL Fix Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/fix_admin_applications_access.sql`
3. Copy and paste the entire contents
4. **Important**: Make sure the email `'admin@gmail.com'` matches your admin email (or update it)
5. Click **Run**

This script will:
- ✅ Ensure the `is_admin()` function works
- ✅ Fix RLS policies for admin access
- ✅ Add the `slug` column to houses table if missing
- ✅ Generate slugs for existing houses

## Step 4: Verify Your Admin Role

Run this in Supabase SQL Editor to verify:

```sql
SELECT 
  id,
  email,
  role,
  is_admin(id) as is_admin_check
FROM profiles
WHERE email = 'admin@gmail.com'; -- Replace with your email
```

- `role` should be `'admin'`
- `is_admin_check` should be `true`

If not, update your role:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@gmail.com'; -- Replace with your email
```

## Step 5: Sign Out and Sign Back In

1. Sign out of the application
2. Clear browser cache (see Step 1)
3. Sign back in with your admin account
4. Navigate to `/admin/applications`

## Step 6: Check Browser Console

Open Developer Tools (F12) → Console tab and look for:

- **Error Code `42703`**: Column doesn't exist → Run SQL fix script (Step 3)
- **Error Code `PGRST116`**: No rows returned → Check RLS policies
- **"Permission denied"**: Admin role not set correctly → Verify Step 4
- **`houses_1.slug` error**: Browser cache issue → Do Step 1

## Step 7: Verify Applications Exist

Check if you have applications in the database:

```sql
SELECT COUNT(*) as total_applications FROM applications;
```

If this returns 0, there are no applications to display.

## Still Not Working?

1. **Check Network Tab**: 
   - Open Developer Tools → Network tab
   - Refresh the page
   - Look for the applications request
   - Check the response - it will show the exact error

2. **Verify All Migrations Ran**:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_admin_role.sql`
   - `005_add_slug_to_houses.sql` ← **This is likely missing!**

3. **Manual Slug Column Fix**:
   ```sql
   ALTER TABLE houses ADD COLUMN IF NOT EXISTS slug TEXT;
   
   UPDATE houses
   SET slug = LOWER(
     REGEXP_REPLACE(
       REGEXP_REPLACE(name || '-' || city || '-' || state, '[^a-zA-Z0-9\s-]', '', 'g'),
       '\s+', '-', 'g'
     )
   )
   WHERE slug IS NULL;
   ```

## Quick Test

After completing all steps, test with this query in Supabase SQL Editor (while logged in as admin):

```sql
SELECT 
  a.*,
  h.name as house_name,
  h.city,
  h.state
FROM applications a
LEFT JOIN houses h ON h.id = a.house_id
ORDER BY a.created_at DESC
LIMIT 10;
```

This should return applications without errors. If it errors, the issue is in the database/RLS policies. If it works, the issue is in the frontend code/cache.

