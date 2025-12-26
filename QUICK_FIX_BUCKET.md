# Quick Fix: "Bucket not found" Error

## The Problem
You're getting "Bucket not found" errors when uploading images. This means the Supabase storage bucket hasn't been created yet.

## The Solution (2 minutes)

1. **Go to your Supabase Dashboard**
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Run the Fix Script**
   - Open the file: `supabase/storage_fix_and_update.sql`
   - Copy **ALL** the contents (Cmd+A, Cmd+C)
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd+Enter)

4. **Verify It Worked**
   - Go to **Storage** in the left sidebar
   - You should see a bucket named `house-images`
   - Check that it shows "20MB" as the file size limit

5. **Try Uploading Again**
   - Go back to your app
   - Try editing your house and uploading images
   - It should work now!

## Alternative: Manual Setup

If the SQL script doesn't work, create the bucket manually:

1. Go to **Storage** → **New Bucket**
2. Name: `house-images`
3. Public bucket: **Yes** (toggle ON)
4. File size limit: `20971520` (20MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/jpg`
6. Click **Create bucket**

Then run the policies section from `supabase/storage_fix_and_update.sql` (the part starting with "STORAGE POLICIES").

## Still Having Issues?

- Make sure you're using the correct Supabase project
- Check that your project is active (not paused)
- Verify your environment variables are set correctly in Vercel

