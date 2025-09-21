-- Fix RLS policies to allow organization and profile creation during signup

-- Allow users to create organizations (needed for signup)
CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Update the profile insert policy to handle signup scenarios better
DROP POLICY IF EXISTS "Profiles: users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also allow service role to create profiles (for edge functions if needed)
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO service_role
WITH CHECK (true);

-- Allow service role to manage organizations (for edge functions if needed)  
CREATE POLICY "Service role can manage organizations" 
ON public.organizations 
FOR ALL 
TO service_role
WITH CHECK (true);