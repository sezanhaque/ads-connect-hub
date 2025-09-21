-- Update RLS policy to allow both owners and admins to manage members
DROP POLICY "Owners can manage members" ON public.members;

-- Create new policy allowing owners and admins to manage members
CREATE POLICY "Owners and admins can manage members" 
ON public.members 
FOR ALL 
TO authenticated
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

-- Also update the view policy to allow owners and admins to view org invites  
DROP POLICY "Users can view org invites" ON public.invites;

CREATE POLICY "Owners and admins can view org invites"
ON public.invites 
FOR SELECT 
TO authenticated
USING (org_id IN ( 
  SELECT members.org_id
  FROM members
  WHERE members.user_id = auth.uid() 
  AND members.role IN ('owner', 'admin')
));

-- Update the manage invites policy too
DROP POLICY "Owners can manage invites" ON public.invites;

CREATE POLICY "Owners and admins can manage invites"
ON public.invites 
FOR ALL 
TO authenticated
USING (org_id IN ( 
  SELECT members.org_id
  FROM members
  WHERE members.user_id = auth.uid() 
  AND members.role IN ('owner', 'admin')
))
WITH CHECK (org_id IN ( 
  SELECT members.org_id
  FROM members
  WHERE members.user_id = auth.uid() 
  AND members.role IN ('owner', 'admin')
));