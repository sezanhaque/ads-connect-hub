-- Add unique constraint for upsert operations on integrations table
ALTER TABLE public.integrations 
ADD CONSTRAINT integrations_org_user_type_unique 
UNIQUE (org_id, integration_type, user_id);