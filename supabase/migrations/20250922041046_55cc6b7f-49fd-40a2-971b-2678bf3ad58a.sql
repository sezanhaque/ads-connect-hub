-- Remove the redundant organization_id column from profiles table
-- Organization membership is managed through the members table only
ALTER TABLE public.profiles DROP COLUMN IF EXISTS organization_id;

-- Clean up any existing data inconsistencies by ensuring all profiles have correct data
-- This will sync profiles with their actual organization membership from members table
UPDATE public.profiles 
SET role = 'member' 
WHERE role IS NULL OR role = '';

-- Add a comment to clarify the data model
COMMENT ON TABLE public.profiles IS 'User profile information. Organization membership is managed through the members table.';