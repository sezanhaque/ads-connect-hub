CREATE POLICY "App admins can view all integrations"
ON public.integrations
FOR SELECT
TO authenticated
USING (public.is_app_admin(auth.uid()));