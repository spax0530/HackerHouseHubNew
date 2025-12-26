-- Quick Fix: Approve "Portland House" (or any house by name)
-- Run this in Supabase SQL Editor

-- Option 1: Approve by exact name
UPDATE houses 
SET admin_status = 'approved' 
WHERE name = 'Portland House';

-- Option 2: Approve all pending houses (use with caution)
-- UPDATE houses 
-- SET admin_status = 'approved' 
-- WHERE admin_status = 'pending';

-- Verify the update
SELECT id, name, admin_status, city, state, created_at 
FROM houses 
WHERE name = 'Portland House';

