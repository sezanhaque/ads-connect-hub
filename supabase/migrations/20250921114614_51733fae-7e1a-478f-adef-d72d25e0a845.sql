-- First, update the metrics table RLS policies to use members table instead of profiles.organization_id
DROP POLICY IF EXISTS "Metrics: view via campaign access" ON public.metrics;
DROP POLICY IF EXISTS "Metrics: insert via campaign access" ON public.metrics;
DROP POLICY IF EXISTS "Metrics: update via campaign access" ON public.metrics;
DROP POLICY IF EXISTS "Metrics: delete via campaign access" ON public.metrics;

-- Create new metrics policies using members table
CREATE POLICY "Metrics: view via campaign access"
ON public.metrics 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.campaigns c, public.members m
        WHERE c.id = metrics.campaign_id 
        AND c.org_id = m.org_id 
        AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Metrics: insert via campaign access"
ON public.metrics 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.campaigns c, public.members m
        WHERE c.id = metrics.campaign_id 
        AND c.org_id = m.org_id 
        AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Metrics: update via campaign access"
ON public.metrics 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.campaigns c, public.members m
        WHERE c.id = metrics.campaign_id 
        AND c.org_id = m.org_id 
        AND m.user_id = auth.uid()
    )
) 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.campaigns c, public.members m
        WHERE c.id = metrics.campaign_id 
        AND c.org_id = m.org_id 
        AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Metrics: delete via campaign access"
ON public.metrics 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.campaigns c, public.members m
        WHERE c.id = metrics.campaign_id 
        AND c.org_id = m.org_id 
        AND m.user_id = auth.uid()
    )
);