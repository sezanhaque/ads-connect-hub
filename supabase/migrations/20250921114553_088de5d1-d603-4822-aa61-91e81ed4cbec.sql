-- First, let's update profiles with missing email data from auth.users
-- Note: This is a one-time cleanup operation

-- Drop the unused organization_id column from profiles since we use members table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS organization_id;

-- Create a function to sync missing profile data from auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Update profiles with missing email using auth data
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        JOIN public.profiles p ON au.id = p.user_id
        WHERE p.email IS NULL OR p.email = '' OR p.first_name IS NULL
    LOOP
        UPDATE public.profiles 
        SET 
            email = COALESCE(email, user_record.email),
            first_name = COALESCE(first_name, user_record.raw_user_meta_data->>'first_name'),
            last_name = COALESCE(last_name, user_record.raw_user_meta_data->>'last_name')
        WHERE user_id = user_record.id;
    END LOOP;
END;
$$;

-- Execute the sync function
SELECT public.sync_profile_data();

-- Create a better RLS policy for profiles that allows org members to see each other
DROP POLICY IF EXISTS "Users can view profiles of org members" ON public.profiles;

CREATE POLICY "Users can view profiles of org members"
ON public.profiles 
FOR SELECT 
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM public.members m1, public.members m2
        WHERE m1.user_id = auth.uid() 
        AND m2.user_id = profiles.user_id 
        AND m1.org_id = m2.org_id
    )
);

-- Add a policy for admins to see all profiles for invite functionality
CREATE POLICY "Admins can view all profiles for invites"
ON public.profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.members
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
);