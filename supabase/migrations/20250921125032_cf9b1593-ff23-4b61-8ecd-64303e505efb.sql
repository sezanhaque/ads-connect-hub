-- Update RLS policy to allow both owners and admins to manage members
DROP POLICY IF EXISTS "Owners can manage members" ON public.members;

CREATE POLICY "Owners and admins can manage members" 
ON public.members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.org_id = members.org_id 
    AND m.user_id = auth.uid() 
    AND m.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.org_id = members.org_id 
    AND m.user_id = auth.uid() 
    AND m.role IN ('owner', 'admin')
  )
);