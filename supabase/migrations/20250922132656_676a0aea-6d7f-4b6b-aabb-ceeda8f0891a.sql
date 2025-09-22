-- Create integrations table to store Meta and other integration credentials
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('meta', 'google')),
  access_token TEXT NOT NULL,
  ad_account_id TEXT,
  account_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, integration_type, ad_account_id)
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations
CREATE POLICY "Users can manage org integrations"
ON public.integrations
FOR ALL
USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view org integrations"
ON public.integrations
FOR SELECT
USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();