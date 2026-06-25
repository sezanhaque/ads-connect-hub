
CREATE OR REPLACE FUNCTION public.autofill_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_company uuid;
BEGIN
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'topups' THEN
    v_user := NEW.user_id;
  ELSE
    v_user := NEW.created_by;
  END IF;

  IF v_user IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT company_id INTO v_company
    FROM public.company_members
   WHERE user_id = v_user
   LIMIT 1;

  IF v_company IS NOT NULL THEN
    NEW.company_id := v_company;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_autofill_company_id_jobs ON public.jobs;
CREATE TRIGGER trg_autofill_company_id_jobs
BEFORE INSERT ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.autofill_company_id();

DROP TRIGGER IF EXISTS trg_autofill_company_id_campaigns ON public.campaigns;
CREATE TRIGGER trg_autofill_company_id_campaigns
BEFORE INSERT ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.autofill_company_id();

DROP TRIGGER IF EXISTS trg_autofill_company_id_topups ON public.topups;
CREATE TRIGGER trg_autofill_company_id_topups
BEFORE INSERT ON public.topups
FOR EACH ROW EXECUTE FUNCTION public.autofill_company_id();
