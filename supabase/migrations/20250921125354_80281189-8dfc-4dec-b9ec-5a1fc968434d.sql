-- Fix infinite recursion by using security definer function
-- First, create a security definer function to check user role safely
CREATE OR REPLACE FUNCTION public.get_user_org_role(p_org_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.members 
  WHERE org_id = p_org_id AND user_id = p_user_id;
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Owners and admins can view org invites" ON public.invites;
DROP POLICY IF EXISTS "Owners and admins can manage invites" ON public.invites;

-- Recreate members policies using the function to avoid recursion
CREATE POLICY "Owners and admins can manage members" 
ON public.members 
FOR ALL 
TO authenticated
USING (
  public.get_user_org_role(org_id) IN ('owner', 'admin')
)
WITH CHECK (
  public.get_user_org_role(org_id) IN ('owner', 'admin')
);

-- Keep the existing safe policies for members
-- Users can view org members
CREATE POLICY "Users can view org members" 
ON public.members 
FOR SELECT 
TO authenticated
USING (is_org_member(org_id));

-- Users can insert themselves as members (for invite acceptance)
CREATE POLICY "Users can insert themselves as members" 
ON public.members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recreate invites policies using safe queries
CREATE POLICY "Owners and admins can view org invites"
ON public.invites 
FOR SELECT 
TO authenticated
USING (
  public.get_user_org_role(org_id) IN ('owner', 'admin')
);

CREATE POLICY "Owners and admins can manage invites"
ON public.invites 
FOR ALL 
TO authenticated
USING (
  public.get_user_org_role(org_id) IN ('owner', 'admin')
)
WITH CHECK (
  public.get_user_org_role(org_id) IN ('owner', 'admin')
);