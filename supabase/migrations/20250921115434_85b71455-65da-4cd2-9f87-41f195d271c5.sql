-- Fix the handle_new_user trigger to properly create profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function that handles organization creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_org_name TEXT;
BEGIN
  -- Insert profile with proper data
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Create organization name
  v_org_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL AND NEW.raw_user_meta_data->>'first_name' != '' 
      THEN (NEW.raw_user_meta_data->>'first_name') || '''s Organization'
      WHEN NEW.email IS NOT NULL 
      THEN split_part(NEW.email, '@', 1) || '''s Organization'
      ELSE 'My Organization'
    END
  );

  -- Create organization
  INSERT INTO public.organizations (name)
  VALUES (v_org_name)
  RETURNING id INTO v_org_id;

  -- Add user as owner of the organization
  INSERT INTO public.members (org_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();