-- Fix recursive RLS on members by using SECURITY DEFINER helpers
-- 1) Helper functions
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.org_id = p_org_id AND m.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_owner(p_org_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members m
    WHERE m.org_id = p_org_id AND m.user_id = p_user_id AND m.role = 'owner'
  );
$$;

-- 2) Replace problematic RLS policies on members
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'members' AND policyname = 'Owners can manage members'
  ) THEN
    EXECUTE 'DROP POLICY "Owners can manage members" ON public.members';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'members' AND policyname = 'Users can view org members'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view org members" ON public.members';
  END IF;
END$$;

-- Recreate safe policies
CREATE POLICY "Users can view org members"
ON public.members
FOR SELECT
USING (public.is_org_member(org_id));

CREATE POLICY "Owners can manage members"
ON public.members
FOR ALL
USING (public.is_org_owner(org_id))
WITH CHECK (public.is_org_owner(org_id));