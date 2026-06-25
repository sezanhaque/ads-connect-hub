
-- 1. Add company_id to topups
ALTER TABLE public.topups
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_topups_company_id ON public.topups(company_id);

-- 2. RLS: company members can view shared topups
DROP POLICY IF EXISTS "Company members view company topups" ON public.topups;
CREATE POLICY "Company members view company topups"
ON public.topups
FOR SELECT
TO authenticated
USING (company_id IS NOT NULL AND public.is_company_member(company_id, auth.uid()));

-- 3. Trigger function: when a user joins a company, attach their existing
--    jobs / campaigns / topups (currently unshared) to that company.
CREATE OR REPLACE FUNCTION public.attach_user_data_to_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
     SET company_id = NEW.company_id
   WHERE created_by = NEW.user_id
     AND company_id IS NULL;

  UPDATE public.campaigns
     SET company_id = NEW.company_id
   WHERE created_by = NEW.user_id
     AND company_id IS NULL;

  UPDATE public.topups
     SET company_id = NEW.company_id
   WHERE user_id = NEW.user_id
     AND company_id IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attach_user_data_to_company ON public.company_members;
CREATE TRIGGER trg_attach_user_data_to_company
AFTER INSERT ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.attach_user_data_to_company();

-- 4. Backfill: for every existing company membership, attach data that
--    the member already owned and that isn't yet linked to any company.
UPDATE public.jobs j
   SET company_id = cm.company_id
  FROM public.company_members cm
 WHERE j.created_by = cm.user_id
   AND j.company_id IS NULL;

UPDATE public.campaigns c
   SET company_id = cm.company_id
  FROM public.company_members cm
 WHERE c.created_by = cm.user_id
   AND c.company_id IS NULL;

UPDATE public.topups t
   SET company_id = cm.company_id
  FROM public.company_members cm
 WHERE t.user_id = cm.user_id
   AND t.company_id IS NULL;
