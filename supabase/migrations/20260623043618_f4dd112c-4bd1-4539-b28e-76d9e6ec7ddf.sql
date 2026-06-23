-- Allow company members to read campaigns linked to their company
CREATE POLICY "Company members can view company campaigns"
ON public.campaigns FOR SELECT
TO authenticated
USING (
  company_id IS NOT NULL
  AND public.is_company_member(company_id, auth.uid())
);

-- Allow company members to read metrics for those campaigns
CREATE POLICY "Company members can view company campaign metrics"
ON public.campaign_metrics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_metrics.campaign_id
      AND c.company_id IS NOT NULL
      AND public.is_company_member(c.company_id, auth.uid())
  )
);

-- Allow company members to read legacy metrics rows for those campaigns
CREATE POLICY "Company members can view company metrics"
ON public.metrics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = metrics.campaign_id
      AND c.company_id IS NOT NULL
      AND public.is_company_member(c.company_id, auth.uid())
  )
);