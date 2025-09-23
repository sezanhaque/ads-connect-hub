-- Add user_id column to integrations table
ALTER TABLE public.integrations 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing integrations to use the owner's user_id
UPDATE public.integrations 
SET user_id = (
  SELECT m.user_id 
  FROM public.members m 
  WHERE m.org_id = integrations.org_id 
  AND m.role = 'owner' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Create index for better performance
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_org_user ON public.integrations(org_id, user_id);