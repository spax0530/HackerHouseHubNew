# Admin Portal Setup Guide

This guide explains how to set up and use the admin portal for HackerHouseHub.

## Prerequisites

1. **Run the admin migration**: You must run the database migration that adds admin role support:
   - Go to your Supabase SQL Editor
   - Run `supabase/migrations/004_admin_role.sql`
   - This adds the `admin` role to the profiles table and creates RLS policies for admin access

## Making a User an Admin

To make a user an admin, you need to update their role in the database. There are two ways to do this:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find the user you want to make an admin (search by email or user ID)
4. Click on the row to edit it
5. Change the `role` field from `applicant` or `host` to `admin`
6. Save the changes

### Option 2: Using SQL

Run this SQL query in your Supabase SQL Editor:

```sql
-- Replace 'user@example.com' with the actual email of the user you want to make admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

Or by user ID:

```sql
-- Replace 'USER_UUID' with the actual user ID (UUID)
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_UUID';
```

## Admin Portal Features

Once a user has the `admin` role, they will have access to:

### 1. Admin Dashboard (`/admin/dashboard`)
- Platform overview with key statistics
- Quick actions for common tasks
- Pending house approvals counter

### 2. House Management (`/admin/houses`)
- View all houses (regardless of approval status)
- Approve/reject/pause houses
- Feature/unfeature houses
- Search and filter houses by status
- View house details and metrics

### 3. User Management (`/admin/users`)
- View all users (applicants, hosts, and admins)
- Change user roles (including making other admins)
- Search and filter users by role
- View user profiles and activity

### 4. Applications Management (`/admin/applications`)
- Coming soon: View all applications across all houses
- Monitor application trends

### 5. Analytics (`/admin/analytics`)
- Coming soon: Platform analytics and metrics

## Security Notes

⚠️ **Important Security Considerations:**

1. **Limited Admin Accounts**: Only grant admin role to trusted users who need platform management access.

2. **Role Changes**: Admins can change user roles, including making other users admins. Be careful who you grant admin access to.

3. **Database Access**: Admins can view and modify all houses and user data through the portal. Ensure proper authentication and authorization.

4. **RLS Policies**: The admin RLS policies use a secure helper function `is_admin()` that checks the user's role. Admins bypass normal RLS restrictions.

5. **No Self-Promotion**: Regular users cannot promote themselves to admin through the UI - this must be done in the database.

## Navigation

Admins will see an "Admin" link in the navigation bar that takes them to `/admin/dashboard`. The admin portal uses a sidebar navigation similar to the host dashboard.

## Troubleshooting

**User can't access admin portal:**
- Verify the user's role is set to `admin` in the profiles table
- Check that the migration `004_admin_role.sql` has been run
- Ensure the user is signed in with the correct account

**Admin can't modify houses/users:**
- Verify RLS policies were created correctly by running the migration again
- Check that the `is_admin()` function exists in your database

**Changes not reflecting:**
- The user may need to sign out and sign back in to refresh their session
- Check browser console for any errors

## Next Steps

For future enhancements, consider:
- Audit logging for admin actions
- Admin activity dashboard
- Bulk actions for houses and users
- Advanced analytics and reporting
- Content moderation tools

