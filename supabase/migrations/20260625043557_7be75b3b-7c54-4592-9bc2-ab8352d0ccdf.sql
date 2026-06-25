DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Backfill: only users that still exist in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(split_part(u.email, '@', 2)) = 'twentytwentysolutions.io'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT m.user_id, 'admin'::public.app_role
FROM public.members m
JOIN auth.users u ON u.id = m.user_id
WHERE m.role = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT cm.user_id, 'admin'::public.app_role
FROM public.company_members cm
JOIN auth.users u ON u.id = cm.user_id
WHERE cm.role = 'admin'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_app_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(p_user_id, 'admin'); $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_email text;
  v_first text;
  v_last text;
  v_company text;
  v_name_candidate text;
  v_domain text;
  v_is_internal boolean;
BEGIN
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_first := NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), '');
  v_last  := NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), '');
  v_company := NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), '');
  v_domain := lower(split_part(COALESCE(v_email,''), '@', 2));
  v_is_internal := (v_domain = 'twentytwentysolutions.io');

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
  VALUES (v_org_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;

  IF v_is_internal THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;