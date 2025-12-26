# Fix Storage Bucket "Bucket not found" Error

If you're getting "Bucket not found" errors when uploading images, follow these steps:

## Quick Fix (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to **SQL Editor**
   - Click **New Query**

2. **Run the fix script**
   - Open `supabase/storage_fix_and_update.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

3. **Verify the bucket was created**
   - Go to **Storage** in your Supabase dashboard
   - You should see a bucket named `house-images`
   - Check that it shows "20MB" as the file size limit

## Alternative: Manual Setup via UI

If you prefer using the Supabase UI:

1. **Go to Storage**
   - In your Supabase dashboard, click **Storage**
   - Click **New Bucket**

2. **Create house-images bucket**
   - Name: `house-images`
   - Public bucket: **Yes** (toggle ON)
   - File size limit: `20971520` (20MB)
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/jpg`
   - Click **Create bucket**

3. **Set up policies**
   - After creating the bucket, go to **Storage** → **Policies**
   - Or run the policies section from `supabase/storage_fix_and_update.sql`

## What Changed

- **File size limit increased**: From 5MB to **20MB**
- **Bucket creation**: Script now creates the bucket if it doesn't exist
- **Bucket update**: Script updates existing buckets with the new 20MB limit

## After Running the Fix

1. Try uploading images again
2. Files up to 20MB should now work
3. The "Bucket not found" error should be resolved

## Troubleshooting

**Still getting "Bucket not found"?**
- Make sure you ran the SQL script completely
- Check that the bucket appears in Storage → Buckets
- Verify you're using the correct Supabase project

**Still getting file size errors?**
- Make sure the bucket's file_size_limit is set to 20971520 (20MB)
- Check in Storage → Buckets → house-images → Settings

**Upload still failing?**
- Check the browser console for detailed error messages
- Verify your Supabase project is active (not paused)
- Make sure you're signed in as an authenticated user

