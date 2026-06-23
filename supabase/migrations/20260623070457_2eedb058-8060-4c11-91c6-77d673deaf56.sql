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
  v_company_id uuid;
  v_member_role text;
  v_display text;
BEGIN
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_first := NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), '');
  v_last  := NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), '');
  v_company := NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), '');
  v_domain := lower(split_part(COALESCE(v_email,''), '@', 2));
  v_is_internal := (v_domain = 'twentytwentysolutions.io');
  v_member_role := CASE WHEN v_is_internal THEN 'admin' ELSE 'owner' END;

  -- Block personal email domains (applies to manual + OAuth signups)
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

  IF v_email IS NOT NULL AND v_domain <> '' THEN
    BEGIN
      SELECT id INTO v_company_id FROM public.companies WHERE domain = v_domain;
      IF v_company_id IS NULL THEN
        v_display := initcap(split_part(v_domain, '.', 1));
        INSERT INTO public.companies (domain, display_name)
        VALUES (v_domain, v_display)
        RETURNING id INTO v_company_id;

        INSERT INTO public.company_credits (company_id) VALUES (v_company_id)
        ON CONFLICT DO NOTHING;
      END IF;

      INSERT INTO public.company_members (company_id, user_id, email, role)
      VALUES (v_company_id, NEW.id, v_email, v_member_role::company_role)
      ON CONFLICT (company_id, user_id) DO UPDATE
        SET role = CASE
          WHEN v_is_internal THEN 'admin'::company_role
          ELSE public.company_members.role
        END,
        email = COALESCE(public.company_members.email, EXCLUDED.email);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'company seeding failed for user %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;