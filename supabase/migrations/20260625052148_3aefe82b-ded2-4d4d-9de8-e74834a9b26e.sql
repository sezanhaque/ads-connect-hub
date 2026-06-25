
-- Detach data when a member is removed from a company
CREATE OR REPLACE FUNCTION public.detach_user_data_from_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
     SET company_id = NULL
   WHERE company_id = OLD.company_id
     AND created_by = OLD.user_id;

  UPDATE public.campaigns
     SET company_id = NULL
   WHERE company_id = OLD.company_id
     AND created_by = OLD.user_id;

  UPDATE public.topups
     SET company_id = NULL
   WHERE company_id = OLD.company_id
     AND user_id = OLD.user_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_detach_user_data_from_company ON public.company_members;
CREATE TRIGGER trg_detach_user_data_from_company
AFTER DELETE ON public.company_members
FOR EACH ROW EXECUTE FUNCTION public.detach_user_data_from_company();

-- Backfill: detach orphan rows whose creator/owner is no longer in the company
UPDATE public.jobs j
   SET company_id = NULL
 WHERE j.company_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = j.company_id
        AND cm.user_id = j.created_by
   );

UPDATE public.campaigns c
   SET company_id = NULL
 WHERE c.company_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = c.company_id
        AND cm.user_id = c.created_by
   );

UPDATE public.topups t
   SET company_id = NULL
 WHERE t.company_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = t.company_id
        AND cm.user_id = t.user_id
   );
