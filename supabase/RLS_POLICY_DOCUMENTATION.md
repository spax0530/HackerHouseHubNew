# Row Level Security (RLS) Policy Documentation

This document explains the RLS policies implemented in the HackerHouseHub database, including how multiple policies interact and their precedence.

## Policy Evaluation in PostgreSQL

PostgreSQL evaluates RLS policies using **OR logic** - if ANY policy allows an operation, the operation is permitted. Multiple policies on the same table are evaluated independently and combined with OR.

## Policy Precedence and Interactions

### PROFILES Table

#### SELECT Policies
1. **"Authenticated users can view profiles"** (`002_rls_policies.sql`)
   - Allows: All authenticated users can view all profiles
   - Purpose: Enable viewing host information on house listings
   - Security: Prevents email enumeration from unauthenticated users

2. **"Admins can view all profiles"** (`004_admin_role.sql`)
   - Allows: Admins can view all profiles OR users can view their own profile
   - Note: This policy is redundant with policy #1 for authenticated users, but provides explicit admin access
   - Combined Result: All authenticated users (including admins) can view all profiles

#### UPDATE Policies
1. **"Users can update own profile"** (`002_rls_policies.sql`)
   - Allows: Users to update their own profile (any field)
   - Restriction: Database trigger `prevent_role_self_update_trigger` prevents non-admins from updating the `role` field
   - Security: Prevents privilege escalation via role changes

2. **"Admins can update any profile"** (`004_admin_role.sql`)
   - Allows: Admins to update any profile (including role changes)
   - Combined Result: Users can update their own profile (except role), admins can update any profile

#### INSERT Policies
1. **"Users can insert own profile"** (`002_rls_policies.sql`)
   - Allows: Users to insert their own profile (typically handled by trigger)

2. **"Admins can insert profiles"** (`004_admin_role.sql`)
   - Allows: Admins to insert any profile
   - Combined Result: Users can insert their own profile, admins can insert any profile

#### DELETE Policies
1. **"Admins can delete profiles"** (`004_admin_role.sql`)
   - Allows: Only admins can delete profiles
   - Note: Regular users cannot delete profiles (intentional design)

---

### HOUSES Table

#### SELECT Policies
1. **"Public can view approved houses"** (`002_rls_policies.sql`)
   - Allows: Unauthenticated users to view houses with `admin_status = 'approved'`
   - Purpose: Enable public browsing of approved houses

2. **"Hosts can view own houses"** (`002_rls_policies.sql`)
   - Allows: Authenticated hosts to view their own houses (any status)
   - Purpose: Enable hosts to manage their listings

3. **"Admins can view all houses"** (`004_admin_role.sql`)
   - Allows: Admins to view all houses regardless of status
   - Combined Result: Public sees approved houses, hosts see their own houses, admins see all houses

#### UPDATE Policies
1. **"Hosts can update own houses"** (`002_rls_policies.sql`)
   - Allows: Hosts to update their own houses
   - Restriction: Hosts cannot change `admin_status` (only admins can via separate policy)

2. **"Admins can update any house"** (`004_admin_role.sql`)
   - Allows: Admins to update any house (including `admin_status`)
   - Combined Result: Hosts can update their own houses, admins can update any house

#### INSERT Policies
1. **"Hosts can create own houses"** (`002_rls_policies.sql`)
   - Allows: Authenticated hosts to create houses with themselves as host
   - Note: Admins can create houses if they have host role or by temporarily setting host_id (requires separate admin INSERT policy if needed)
   - Current behavior: Admins must have host role to create houses

#### DELETE Policies
1. **"Hosts can delete own houses"** (`002_rls_policies.sql`)
   - Allows: Hosts to delete their own houses

2. **"Admins can delete any house"** (`004_admin_role.sql`)
   - Allows: Admins to delete any house
   - Combined Result: Hosts can delete their own houses, admins can delete any house

---

### APPLICATIONS Table

#### SELECT Policies
1. **"Applicants can view own applications"** (`002_rls_policies.sql`)
   - Allows: Applicants to view their own applications

2. **"Hosts can view applications for their houses"** (`002_rls_policies.sql`)
   - Allows: Hosts to view applications for houses they own

3. **"Admins can view all applications"** (`004_admin_role.sql`)
   - Allows: Admins OR applicants OR hosts (see policy for details)
   - Note: This policy is comprehensive and includes applicant/host access, making it redundant with policies #1 and #2
   - Combined Result: Applicants see their own applications, hosts see applications for their houses, admins see all applications

#### UPDATE Policies
1. **"Hosts can update applications for their houses"** (`002_rls_policies.sql`)
   - Allows: Hosts to update applications for their houses (e.g., status changes)

2. **"Applicants can update own applications"** (`002_rls_policies.sql`)
   - Allows: Applicants to update their own applications
   - Note: Potential conflict if both host and applicant try to update - last write wins

3. **"Admins can update any application"** (`004_admin_role.sql`)
   - Allows: Admins to update any application
   - Combined Result: Applicants can update their own, hosts can update for their houses, admins can update any

#### INSERT Policies
1. **"Authenticated users can create applications"** (`002_rls_policies.sql`)
   - Allows: Authenticated users to create applications with themselves as applicant
   - Note: No admin-specific INSERT policy needed - admins are authenticated users

#### DELETE Policies
1. **"Hosts can delete applications for their houses"** (`002_rls_policies.sql`)
   - Allows: Hosts to delete applications for their houses
   - Note: Policy exists but may not be used in application logic

2. **"Admins can delete any application"** (`004_admin_role.sql`)
   - Allows: Admins to delete any application
   - Combined Result: Hosts can delete applications for their houses, admins can delete any

---

### SAVED_HOUSES Table

#### SELECT Policies
1. **"Users can view own saved houses"** (`002_rls_policies.sql`)
   - Allows: Users to view their own saved houses

2. **"Admins can view all saved houses"** (`004_admin_role.sql`)
   - Allows: Admins OR users (see policy for details)
   - Combined Result: Users see their own saved houses, admins see all

#### INSERT Policies
1. **"Users can save houses"** (`002_rls_policies.sql`)
   - Allows: Authenticated users to save houses

#### DELETE Policies
1. **"Users can unsave houses"** (`002_rls_policies.sql`)
   - Allows: Users to delete their own saved houses

---

## Security Considerations

### Protected Operations

1. **Role Updates**: Protected by database trigger `prevent_role_self_update_trigger` - only admins can change user roles
2. **Profile Emails**: Not visible to unauthenticated users (prevents enumeration)
3. **House Admin Status**: Only admins can change `admin_status` via admin UPDATE policy
4. **Storage Access**: House images can only be updated/deleted by the owner (user ID in file path) or admins

### Potential Policy Improvements

1. **Application Updates**: Consider restricting applicants from updating applications after submission to prevent conflicts with host status changes
2. **House Creation**: Consider adding explicit admin INSERT policy for houses if admins need to create houses for other users
3. **Profile DELETE**: Current design prevents user self-deletion (only admins can delete) - ensure this aligns with business requirements

### Policy Redundancy Notes

- Some admin policies include user access (e.g., "Admins can view all applications" includes applicant/host access), making base policies redundant
- This redundancy is acceptable and provides defense-in-depth, but could be simplified for clarity
- The redundant policies do not create security issues due to OR logic

---

## Migration Order

RLS policies must be applied in this order:
1. `001_initial_schema.sql` - Create tables
2. `002_rls_policies.sql` - Base RLS policies
3. `003_functions_triggers.sql` - Functions and triggers (including role update prevention)
4. `004_admin_role.sql` - Admin-specific policies

---

## Testing Recommendations

1. Test that regular users cannot update their own role field
2. Test that unauthenticated users cannot query profiles
3. Test that hosts can only update their own houses
4. Test that admins can perform all administrative operations
5. Test that storage policies restrict image access to owners
6. Test that applicants and hosts cannot see each other's applications inappropriately

