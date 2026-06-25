
CREATE POLICY "Company members can view shared jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  company_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Company members can view shared campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  company_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = campaigns.company_id AND cm.user_id = auth.uid()
  )
);
