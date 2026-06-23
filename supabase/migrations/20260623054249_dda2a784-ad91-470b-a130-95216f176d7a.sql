
CREATE POLICY "Admins can update company members"
  ON public.company_members
  FOR UPDATE
  TO authenticated
  USING (public.is_app_admin(auth.uid()))
  WITH CHECK (public.is_app_admin(auth.uid()));
