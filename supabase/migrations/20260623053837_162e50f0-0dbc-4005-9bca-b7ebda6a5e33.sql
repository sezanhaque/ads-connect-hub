
-- 1. Role column on company_members
DO $$ BEGIN
  CREATE TYPE public.company_role AS ENUM ('owner','admin','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.company_members
  ADD COLUMN IF NOT EXISTS role public.company_role NOT NULL DEFAULT 'member';

-- 2. Backfill: earliest member of each company becomes owner
WITH firsts AS (
  SELECT DISTINCT ON (company_id) id
  FROM public.company_members
  ORDER BY company_id, created_at ASC
)
UPDATE public.company_members cm
SET role = 'owner'
FROM firsts f
WHERE cm.id = f.id AND cm.role = 'member';

-- 3. Updated admin check (covers both legacy org admins and new company admins)
CREATE OR REPLACE FUNCTION public.is_app_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = p_user_id AND role IN ('owner','admin')
  )
  OR EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = p_user_id AND role IN ('owner','admin')
  );
$$;
