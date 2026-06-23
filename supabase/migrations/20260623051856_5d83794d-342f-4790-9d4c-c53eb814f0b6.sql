
CREATE OR REPLACE FUNCTION public.is_app_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id AND role = 'admin');
$$;

CREATE POLICY "Admins can view all companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (public.is_app_admin(auth.uid()));

CREATE POLICY "Admins can view all company members"
  ON public.company_members FOR SELECT
  TO authenticated
  USING (public.is_app_admin(auth.uid()));

CREATE POLICY "Admins can view all company credits"
  ON public.company_credits FOR SELECT
  TO authenticated
  USING (public.is_app_admin(auth.uid()));

CREATE POLICY "Admins can view all company integrations"
  ON public.company_integrations FOR SELECT
  TO authenticated
  USING (public.is_app_admin(auth.uid()));
