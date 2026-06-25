
-- Stop auto-creating companies on signup. Admins assign manually.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_email text;
  v_first text;
  v_last text;
  v_company text;
  v_name_candidate text;
  v_domain text;
  v_is_internal boolean;
  v_member_role text;
BEGIN
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_first := NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), '');
  v_last  := NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), '');
  v_company := NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), '');
  v_domain := lower(split_part(COALESCE(v_email,''), '@', 2));
  v_is_internal := (v_domain = 'twentytwentysolutions.io');
  v_member_role := CASE WHEN v_is_internal THEN 'admin' ELSE 'owner' END;

  -- Block personal email domains
  IF v_domain IS NOT NULL AND v_domain <> '' AND public.is_personal_domain(v_domain) THEN
    RAISE EXCEPTION 'Personal email domains are not allowed. Please sign up with your company email address.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (NEW.id, v_email, v_first, v_last)
  ON CONFLICT (user_id) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, public.profiles.email),
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name);

  IF v_company IS NOT NULL THEN
    v_name_candidate := v_company;
  ELSIF v_first IS NOT NULL OR v_last IS NOT NULL THEN
    v_name_candidate := trim(concat_ws(' ', v_first, v_last)) || ' Organization';
  ELSIF v_email IS NOT NULL THEN
    v_name_candidate := split_part(v_email, '@', 1) || ' Organization';
  ELSE
    v_name_candidate := 'New Organization';
  END IF;

  INSERT INTO public.organizations (name) VALUES (v_name_candidate)
  RETURNING id INTO v_org_id;

  INSERT INTO public.members (org_id, user_id, role)
  VALUES (v_org_id, NEW.id, v_member_role)
  ON CONFLICT DO NOTHING;

  -- NOTE: company + company_members assignment is now MANUAL via admin UI.
  RETURN NEW;
END;
$function$;

-- Admin write policies for companies / company_members / company_credits
CREATE POLICY "Admins can insert companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (public.is_app_admin(auth.uid()));
CREATE POLICY "Admins can update companies" ON public.companies
  FOR UPDATE TO authenticated USING (public.is_app_admin(auth.uid())) WITH CHECK (public.is_app_admin(auth.uid()));
CREATE POLICY "Admins can delete companies" ON public.companies
  FOR DELETE TO authenticated USING (public.is_app_admin(auth.uid()));

CREATE POLICY "Admins can insert company members" ON public.company_members
  FOR INSERT TO authenticated WITH CHECK (public.is_app_admin(auth.uid()));
CREATE POLICY "Admins can delete company members" ON public.company_members
  FOR DELETE TO authenticated USING (public.is_app_admin(auth.uid()));

CREATE POLICY "Admins can insert company credits" ON public.company_credits
  FOR INSERT TO authenticated WITH CHECK (public.is_app_admin(auth.uid()));
