-- Drop the existing constraint and add one that includes 'tiktok'
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_integration_type_check;

-- Add the new constraint that allows both 'meta' and 'tiktok'
ALTER TABLE public.integrations ADD CONSTRAINT integrations_integration_type_check 
  CHECK (integration_type IN ('meta', 'tiktok', 'google'));