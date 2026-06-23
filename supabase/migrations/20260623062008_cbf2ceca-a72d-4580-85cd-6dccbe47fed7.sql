-- Auto-promote @twentytwentysolutions.io users to admin on signup
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
BEGIN
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_first := NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), '');
  v_last  := NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), '');
  v_company := NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), '');
  v_domain := lower(split_part(COALESCE(v_email,''), '@', 2));
  v_is_internal := (v_domain = 'twentytwentysolutions.io');
  v_member_role := CASE WHEN v_is_internal THEN 'admin' ELSE 'owner' END;

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

  -- Company mode: also enroll in companies/company_members
  IF v_email IS NOT NULL THEN
    BEGIN
      v_company_id := public.get_or_create_company_for_email(v_email);
      INSERT INTO public.company_members (company_id, user_id, role)
      VALUES (v_company_id, NEW.id, v_member_role)
      ON CONFLICT (company_id, user_id) DO UPDATE
        SET role = CASE
          WHEN v_is_internal THEN 'admin'
          ELSE public.company_members.role
        END;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- don't block signup if company seeding fails
    END;
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill: promote existing @twentytwentysolutions.io users to admin
UPDATE public.members m
SET role = 'admin'
FROM public.profiles p
WHERE m.user_id = p.user_id
  AND lower(split_part(COALESCE(p.email,''), '@', 2)) = 'twentytwentysolutions.io'
  AND m.role <> 'admin';

UPDATE public.company_members cm
SET role = 'admin'
FROM public.profiles p
WHERE cm.user_id = p.user_id
  AND lower(split_part(COALESCE(p.email,''), '@', 2)) = 'twentytwentysolutions.io'
  AND cm.role <> 'admin';
