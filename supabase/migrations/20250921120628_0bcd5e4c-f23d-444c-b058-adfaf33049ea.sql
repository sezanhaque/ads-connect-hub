-- Ensure uniqueness and robust user bootstrap to prevent null profiles and odd org names
-- 1) Add unique constraints/indexes if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_profiles_user_id_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_profiles_user_id_unique ON public.profiles(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_members_org_user_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_members_org_user_unique ON public.members(org_id, user_id);
  END IF;
END$$;

-- 2) Recreate the trigger function with safer fallbacks and idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_email text;
  v_first text;
  v_last text;
  v_company text;
  v_name_candidate text;
BEGIN
  -- Extract and sanitize values
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_first := NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), '');
  v_last := NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), '');
  v_company := NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), '');

  -- Idempotent profile upsert (avoid duplicate/empty profiles)
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (NEW.id, v_email, v_first, v_last)
  ON CONFLICT (user_id) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, public.profiles.email),
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name);

  -- Determine organization name with sane defaults (no "'s")
  IF v_company IS NOT NULL THEN
    v_name_candidate := v_company;
  ELSIF v_first IS NOT NULL OR v_last IS NOT NULL THEN
    v_name_candidate := trim(concat_ws(' ', v_first, v_last)) || ' Organization';
  ELSIF v_email IS NOT NULL THEN
    v_name_candidate := split_part(v_email, '@', 1) || ' Organization';
  ELSE
    v_name_candidate := 'New Organization';
  END IF;

  -- Create org and add owner membership (idempotent)
  INSERT INTO public.organizations (name) VALUES (v_name_candidate)
  RETURNING id INTO v_org_id;

  INSERT INTO public.members (org_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Backfill any existing profiles missing email/name using auth data
SELECT public.sync_profile_data();