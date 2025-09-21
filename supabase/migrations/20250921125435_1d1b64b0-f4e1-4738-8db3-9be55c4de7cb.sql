-- Fix infinite recursion by using a SECURITY DEFINER helper
CREATE OR REPLACE FUNCTION public.get_user_org_role(p_org_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.members 
  WHERE org_id = p_org_id AND user_id = p_user_id
  LIMIT 1;
$$;

-- Clean up any prior admin/owner policies to avoid recursion
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Owners can manage members" ON public.members;

DROP POLICY IF EXISTS "Owners and admins can view org invites" ON public.invites;
DROP POLICY IF EXISTS "Owners and admins can manage invites" ON public.invites;

-- Recreate safe policies using the helper function
CREATE POLICY "Owners and admins can manage members"
ON public.members
FOR ALL
TO authenticated
USING (public.get_user_org_role(org_id) IN ('owner','admin'))
WITH CHECK (public.get_user_org_role(org_id) IN ('owner','admin'));

CREATE POLICY "Owners and admins can view org invites"
ON public.invites
FOR SELECT
TO authenticated
USING (public.get_user_org_role(org_id) IN ('owner','admin'));

CREATE POLICY "Owners and admins can manage invites"
ON public.invites
FOR ALL
TO authenticated
USING (public.get_user_org_role(org_id) IN ('owner','admin'))
WITH CHECK (public.get_user_org_role(org_id) IN ('owner','admin'));
