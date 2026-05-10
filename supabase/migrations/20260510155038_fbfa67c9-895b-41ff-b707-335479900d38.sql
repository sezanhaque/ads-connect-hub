DROP POLICY IF EXISTS "Org members view org topups" ON public.topups;

DROP POLICY IF EXISTS "Users view own topups" ON public.topups;

CREATE POLICY "Users view own topups"
ON public.topups
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);