-- Fix members table RLS policies to allow signup

-- Allow users to insert themselves as members (needed for signup)
CREATE POLICY "Users can insert themselves as members" 
ON public.members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also allow service role to manage members (for edge functions if needed)
CREATE POLICY "Service role can manage members" 
ON public.members 
FOR ALL 
TO service_role
WITH CHECK (true);