# Debug: Why "Portland House" Isn't Showing

## Quick Check Steps

1. **Open Browser Console** (F12 or right-click → Inspect → Console)
2. **Go to Homepage** - You should see logs like:
   - "Featured houses fetched: X houses"
   - "House names: [...]"
   - "All houses in database (first 10): [...]"

3. **Check Your Host Dashboard**
   - Go to `/host/dashboard`
   - Check the "Houses" tab
   - See if "Portland House" appears there
   - Check what `admin_status` it shows

## Common Issues

### Issue 1: House was created before auto-approve was enabled
**Solution**: Manually approve it:
1. Go to Admin → Houses (if you have admin access)
2. Find "Portland House"
3. Click the approve button

OR run this SQL in Supabase:
```sql
UPDATE houses 
SET admin_status = 'approved' 
WHERE name = 'Portland House';
```

### Issue 2: House has no images
**Solution**: The house should still show, but make sure it has at least one image URL in the `images` array.

### Issue 3: House wasn't created successfully
**Solution**: Check the browser console when you published the house. Look for any error messages.

## Manual Check in Supabase

1. Go to Supabase Dashboard → Table Editor → `houses`
2. Search for "Portland House"
3. Check:
   - Does it exist?
   - What is `admin_status`? (should be 'approved')
   - Does it have `images`? (should be an array with at least one URL)
   - What is the `host_id`? (should match your user ID)

## If House Status is 'pending'

Run this SQL to approve it:
```sql
UPDATE houses 
SET admin_status = 'approved' 
WHERE name = 'Portland House' 
  AND admin_status = 'pending';
```

