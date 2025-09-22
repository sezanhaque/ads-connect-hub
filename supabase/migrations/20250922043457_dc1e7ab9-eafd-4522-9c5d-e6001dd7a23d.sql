-- Clean up duplicate memberships to ensure complete data isolation
-- Remove memberships where users are members of other users' organizations

-- First, identify and remove cross-organization memberships
-- Keep only the membership where the user is the owner
DELETE FROM public.members 
WHERE id IN (
  SELECT m1.id 
  FROM public.members m1
  JOIN public.members m2 ON m1.user_id = m2.user_id 
  WHERE m1.role = 'member' 
    AND m2.role = 'owner' 
    AND m1.org_id != m2.org_id
);

-- Add a comment explaining the data isolation policy
COMMENT ON TABLE public.members IS 'Organization memberships. Each user should only be a member of their own organization for complete data isolation.';