-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member',
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update existing jobs table to use org_id
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vacancy_url TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update existing campaigns table to use org_id and job_id
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS targeting JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS creatives JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS destination_url TEXT;

-- Rename metrics to campaign_metrics and update structure
DROP TABLE IF EXISTS public.campaign_metrics;
CREATE TABLE public.campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  leads BIGINT DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  cpl NUMERIC DEFAULT 0,
  raw JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" ON public.organizations
FOR SELECT USING (
  id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their organization" ON public.organizations
FOR UPDATE USING (
  id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid() AND role = 'owner')
);

-- RLS Policies for members
CREATE POLICY "Users can view org members" ON public.members
FOR SELECT USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
);

CREATE POLICY "Owners can manage members" ON public.members
FOR ALL USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid() AND role = 'owner')
);

-- RLS Policies for invites
CREATE POLICY "Users can view org invites" ON public.invites
FOR SELECT USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid() AND role = 'owner')
);

CREATE POLICY "Owners can manage invites" ON public.invites
FOR ALL USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid() AND role = 'owner')
);

-- Update RLS policies for jobs
DROP POLICY IF EXISTS "Jobs: view own or org jobs" ON public.jobs;
DROP POLICY IF EXISTS "Jobs: insert by creator within org" ON public.jobs;
DROP POLICY IF EXISTS "Jobs: update own or org jobs" ON public.jobs;
DROP POLICY IF EXISTS "Jobs: delete own or org jobs" ON public.jobs;

CREATE POLICY "Users can view org jobs" ON public.jobs
FOR SELECT USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage org jobs" ON public.jobs
FOR ALL USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
);

-- Update RLS policies for campaigns
DROP POLICY IF EXISTS "Campaigns: view own or org campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns: insert by creator within org" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns: update own or org campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns: delete own or org campaigns" ON public.campaigns;

CREATE POLICY "Users can view org campaigns" ON public.campaigns
FOR SELECT USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage org campaigns" ON public.campaigns
FOR ALL USING (
  org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid())
);

-- RLS Policies for campaign_metrics
CREATE POLICY "Users can view org campaign metrics" ON public.campaign_metrics
FOR SELECT USING (
  campaign_id IN (
    SELECT c.id FROM public.campaigns c 
    JOIN public.members m ON c.org_id = m.org_id 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage org campaign metrics" ON public.campaign_metrics
FOR ALL USING (
  campaign_id IN (
    SELECT c.id FROM public.campaigns c 
    JOIN public.members m ON c.org_id = m.org_id 
    WHERE m.user_id = auth.uid()
  )
);

-- Create RPC function: app_create_org_if_missing
CREATE OR REPLACE FUNCTION public.app_create_org_if_missing(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_existing_org_id UUID;
BEGIN
  -- Check if user is already member of an organization
  SELECT org_id INTO v_existing_org_id
  FROM public.members 
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF v_existing_org_id IS NOT NULL THEN
    RETURN v_existing_org_id;
  END IF;
  
  -- Create new organization
  INSERT INTO public.organizations (name)
  VALUES (p_name)
  RETURNING id INTO v_org_id;
  
  -- Add user as owner
  INSERT INTO public.members (org_id, user_id, role)
  VALUES (v_org_id, p_user_id, 'owner');
  
  RETURN v_org_id;
END;
$$;

-- Create RPC function: create_campaign
CREATE OR REPLACE FUNCTION public.create_campaign(
  p_org_id UUID,
  p_job_id UUID,
  p_name TEXT,
  p_objective TEXT,
  p_budget NUMERIC,
  p_currency TEXT DEFAULT 'USD',
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_targeting JSONB DEFAULT '{}'::jsonb,
  p_creatives JSONB DEFAULT '{}'::jsonb,
  p_ad_copy TEXT DEFAULT NULL,
  p_cta TEXT DEFAULT NULL,
  p_destination_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  -- Verify user has access to the organization
  IF NOT EXISTS (
    SELECT 1 FROM public.members 
    WHERE org_id = p_org_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to organization';
  END IF;
  
  -- Create campaign
  INSERT INTO public.campaigns (
    org_id, job_id, name, objective, budget, currency,
    start_date, end_date, targeting, creatives, ad_copy,
    cta_button, destination_url, status, created_by
  ) VALUES (
    p_org_id, p_job_id, p_name, p_objective, p_budget, p_currency,
    p_start_date, p_end_date, p_targeting, p_creatives, p_ad_copy,
    p_cta, p_destination_url, 'draft', auth.uid()
  )
  RETURNING id INTO v_campaign_id;
  
  RETURN v_campaign_id;
END;
$$;

-- Create RPC function: publish_campaign
CREATE OR REPLACE FUNCTION public.publish_campaign(
  p_campaign_id UUID,
  p_requester UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to the campaign
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.members m ON c.org_id = m.org_id
    WHERE c.id = p_campaign_id AND m.user_id = p_requester
  ) THEN
    RAISE EXCEPTION 'Access denied to campaign';
  END IF;
  
  -- Update campaign status to published
  UPDATE public.campaigns 
  SET status = 'active', updated_at = now()
  WHERE id = p_campaign_id;
  
  RETURN TRUE;
END;
$$;