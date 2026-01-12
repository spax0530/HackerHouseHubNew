# Fix Admin Applications Access

If you're not able to see applications in the Admin Applications Management page, follow these steps:

## Quick Fix

1. **Run the admin applications fix SQL script:**
   - Go to your Supabase SQL Editor
   - Open `supabase/fix_admin_applications_access.sql`
   - Copy and paste the contents
   - **Important:** Replace `'YOUR_ADMIN_EMAIL'` with your actual admin email address
   - Click **Run**

2. **Verify your admin role:**
   - In Supabase, go to **Table Editor** → **profiles**
   - Find your profile (search by your email)
   - Verify that the `role` column is set to `'admin'`
   - If not, update it:
     ```sql
     UPDATE profiles 
     SET role = 'admin' 
     WHERE email = 'your-email@example.com';
     ```

3. **Sign out and sign back in:**
   - The app caches your user role, so you may need to refresh your session
   - Sign out from the app
   - Sign back in with your admin account
   - Navigate to `/admin/applications`

## Verification

After running the fix script, you can verify it worked by running these queries in Supabase SQL Editor:

```sql
-- Check if you're recognized as an admin
SELECT 
  id,
  email,
  role,
  is_admin(id) as is_admin_check
FROM profiles
WHERE email = 'your-admin-email@example.com';
-- Should show is_admin_check = true

-- Check total applications count
SELECT COUNT(*) as total_applications FROM applications;

-- Test query (this is what the admin page does)
SELECT 
  a.*,
  h.name as house_name,
  h.city,
  h.state
FROM applications a
LEFT JOIN houses h ON h.id = a.house_id
ORDER BY a.created_at DESC;
```

## Common Issues

### Issue: "No applications found" but applications exist in database
**Solution:** The RLS (Row Level Security) policies might not be properly set up. Run the fix SQL script.

### Issue: "Permission denied" error
**Solution:** 
1. Verify your role is `'admin'` in the profiles table
2. Sign out and sign back in
3. Run the fix SQL script again

### Issue: Applications show but house details are missing
**Solution:** The join with the houses table might be failing. Check that:
- Houses exist for the applications
- Admin has permission to view all houses (should be automatic if admin policies are correct)

## Debugging

The AdminApplicationsPage now includes better error logging. Check your browser's console (F12) for detailed error messages when trying to load applications.

Error codes to watch for:
- `PGRST116`: No rows returned (might be RLS issue)
- `42501`: Permission denied (RLS policy blocking access)

## Need More Help?

If you're still having issues:
1. Check the browser console for errors
2. Verify all migrations have been run:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_admin_role.sql`
3. Make sure the `is_admin()` function exists and works:
   ```sql
   SELECT is_admin('your-user-id-here');
   ```

