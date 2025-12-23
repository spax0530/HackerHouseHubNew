# HackerHouseHub Deployment Guide

This guide will walk you through deploying HackerHouseHub to production, including Supabase setup and Vercel deployment.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- A GitHub account (for Vercel deployment)
- Node.js and npm installed locally

## Step 1: Supabase Project Setup

1. **Create a new Supabase project**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details:
     - Name: `hackerhousehub` (or your preferred name)
     - Database Password: Choose a strong password (save this!)
     - Region: Choose closest to your users
   - Wait for the project to be created (2-3 minutes)

2. **Get your Supabase credentials**
   - Once created, go to **Settings** → **API**
   - Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy your **anon/public key** (long string starting with `eyJ...`)

## Step 2: Database Setup

1. **Run the database migrations**
   - In your Supabase dashboard, go to **SQL Editor**
   - Click **New Query**

2. **Run migrations in order:**
   
   **Migration 1: Initial Schema**
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - Verify success: You should see "Success. No rows returned"

   **Migration 2: RLS Policies**
   - Open `supabase/migrations/002_rls_policies.sql`
   - Copy the entire contents
   - Paste into a new SQL Editor query
   - Click **Run**
   - Verify success

   **Migration 3: Functions & Triggers**
   - Open `supabase/migrations/003_functions_triggers.sql`
   - Copy the entire contents
   - Paste into a new SQL Editor query
   - Click **Run**
   - Verify success

3. **Verify tables were created**
   - Go to **Table Editor** in Supabase dashboard
   - You should see: `profiles`, `houses`, `applications`, `saved_houses`

## Step 3: Storage Buckets Setup

1. **Create storage buckets**
   - In Supabase dashboard, go to **Storage**
   - Click **New Bucket**
   - Create bucket: `house-images`
     - Name: `house-images`
     - Public bucket: **Yes** (toggle on)
     - File size limit: 5MB
     - Allowed MIME types: `image/jpeg, image/png, image/webp, image/jpg`
   - Click **Create bucket**
   
   - Create second bucket: `avatars`
     - Name: `avatars`
     - Public bucket: **Yes** (toggle on)
     - File size limit: 2MB
     - Allowed MIME types: `image/jpeg, image/png, image/webp, image/jpg`
   - Click **Create bucket**

2. **Set up storage policies (Alternative method)**
   - If you prefer using SQL, run `supabase/storage_setup.sql` in the SQL Editor
   - This will create buckets and policies automatically
   - Go to **Storage** → **Policies** to verify policies were created

## Step 4: Local Environment Setup

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**
   - Open `.env` in your editor
   - Replace `your_supabase_project_url` with your actual Supabase Project URL
   - Replace `your_supabase_anon_key` with your actual Supabase anon key
   - Save the file

3. **Test locally**
   ```bash
   npm install
   npm run dev
   ```
   - Visit `http://localhost:3000`
   - Try signing up a new user
   - Verify you can see the app running

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click **Add New Project**
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Configure environment variables**
   - In Vercel project settings, go to **Environment Variables**
   - Add the following:
     - `VITE_SUPABASE_URL` = Your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - Make sure to add them for **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked about environment variables, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Step 6: Configure Supabase Auth Settings

1. **Set up authentication redirect URLs**
   - In Supabase dashboard, go to **Authentication** → **URL Configuration**
   - Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
   - Add to **Redirect URLs**:
     - `https://your-project.vercel.app/**`
     - `http://localhost:3000/**` (for local development)

2. **Configure email templates (optional)**
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails if desired

## Step 7: Testing Your Deployment

After deployment, test the following:

- [ ] **Homepage loads** - Visit your Vercel URL
- [ ] **User registration** - Sign up as both applicant and host
- [ ] **User login** - Sign in with created account
- [ ] **Host dashboard** - Create a house listing
- [ ] **Public browsing** - View houses (should only show approved ones)
- [ ] **Application submission** - Submit an application as an applicant
- [ ] **Image uploads** - Upload house images and profile avatars
- [ ] **Favorites** - Save houses to favorites
- [ ] **Search & filters** - Test search and filtering functionality

## Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure you've added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel environment variables and redeployed.

### Issue: "Failed to fetch" errors
**Solution:** 
- Check Supabase project is active
- Verify API keys are correct
- Check Supabase project URL is correct
- Ensure RLS policies are set up correctly

### Issue: Images not uploading
**Solution:**
- Verify storage buckets exist (`house-images`, `avatars`)
- Check storage bucket policies allow authenticated uploads
- Verify bucket is set to public

### Issue: Can't see houses after creating them
**Solution:**
- Houses default to `admin_status = 'pending'`
- Only houses with `admin_status = 'approved'` are visible to public
- Update a house's `admin_status` to `'approved'` in Supabase Table Editor for testing

### Issue: Authentication redirects not working
**Solution:**
- Add your Vercel URL to Supabase Auth → URL Configuration
- Ensure redirect URLs include both production and localhost URLs

### Issue: Build fails on Vercel
**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18 by default)

## Production Checklist

Before going live, ensure:

- [ ] Environment variables are set in Vercel
- [ ] Supabase auth URLs are configured
- [ ] Storage buckets are created and policies set
- [ ] Database migrations are run
- [ ] RLS policies are active
- [ ] Test user registration/login
- [ ] Test house creation and viewing
- [ ] Test application submission
- [ ] Test image uploads
- [ ] Set up custom domain (optional)
- [ ] Enable Supabase backups (recommended)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check Vercel build logs
4. Verify all environment variables are set correctly

