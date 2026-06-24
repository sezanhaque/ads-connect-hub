CREATE OR REPLACE FUNCTION public.create_campaign_v2(
  p_org_id uuid,
  p_job_id uuid,
  p_name text,
  p_objective text,
  p_budget numeric,
  p_currency text DEFAULT 'USD'::text,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_targeting jsonb DEFAULT '{}'::jsonb,
  p_creatives jsonb DEFAULT '{}'::jsonb,
  p_ad_copy text DEFAULT NULL,
  p_cta text DEFAULT NULL,
  p_destination_url text DEFAULT NULL,
  p_company_id uuid DEFAULT NULL
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

GRANT EXECUTE ON FUNCTION public.create_campaign_v2(uuid, uuid, text, text, numeric, text, date, date, jsonb, jsonb, text, text, text, uuid) TO authenticated, service_role;