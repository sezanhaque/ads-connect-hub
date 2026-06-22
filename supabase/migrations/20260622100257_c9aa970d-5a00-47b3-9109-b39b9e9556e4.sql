ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON public.campaigns(company_id);

CREATE OR REPLACE FUNCTION public.create_campaign(
  p_org_id uuid,
  p_job_id uuid,
  p_name text,
  p_objective text,
  p_budget numeric,
  p_currency text DEFAULT 'USD'::text,
  p_start_date date DEFAULT NULL::date,
  p_end_date date DEFAULT NULL::date,
  p_targeting jsonb DEFAULT '{}'::jsonb,
  p_creatives jsonb DEFAULT '{}'::jsonb,
  p_ad_copy text DEFAULT NULL::text,
  p_cta text DEFAULT NULL::text,
  p_destination_url text DEFAULT NULL::text,
  p_company_id uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_campaign_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.members
    WHERE org_id = p_org_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to organization';
  END IF;

  INSERT INTO public.campaigns (
    org_id, job_id, name, objective, budget, currency,
    start_date, end_date, targeting, creatives, ad_copy,
    cta_button, destination_url, status, created_by, company_id
  ) VALUES (
    p_org_id, p_job_id, p_name, p_objective, p_budget, p_currency,
    p_start_date, p_end_date, p_targeting, p_creatives, p_ad_copy,
    p_cta, p_destination_url, 'draft', auth.uid(), p_company_id
  )
  RETURNING id INTO v_campaign_id;

  RETURN v_campaign_id;
END;
$function$;