-- Fix existing data: Set all owner roles to member by default
-- This ensures no one has admin access unless explicitly granted from backend
UPDATE public.members 
SET role = 'member' 
WHERE role = 'owner';

-- Add a comment to document that admin roles must be set manually from backend
COMMENT ON COLUMN public.members.role IS 'Role of the member in the organization. Admin roles can only be set from backend, never from frontend.';