-- Create organizations table
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table linked to organizations
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT NOT NULL DEFAULT 'traffic',
    status TEXT NOT NULL DEFAULT 'draft',
    budget DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    location_targeting JSONB DEFAULT '{}',
    audience_targeting JSONB DEFAULT '{}',
    creative_assets JSONB DEFAULT '{}',
    ad_copy TEXT,
    cta_button TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table
CREATE TABLE public.integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL, -- 'google_sheets', 'meta_ads'
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, integration_type)
);

-- Create jobs table (for Google Sheets sync)
CREATE TABLE public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    external_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create metrics table (for Meta API data)
CREATE TABLE public.metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend DECIMAL(10,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    cpc DECIMAL(10,2) DEFAULT 0,
    cpl DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, campaign_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" 
ON public.organizations FOR SELECT 
USING (id = public.get_user_organization_id());

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organization" 
ON public.profiles FOR SELECT 
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Users can view campaigns in their organization" 
ON public.campaigns FOR SELECT 
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create campaigns in their organization" 
ON public.campaigns FOR INSERT 
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update campaigns in their organization" 
ON public.campaigns FOR UPDATE 
USING (organization_id = public.get_user_organization_id());

-- RLS Policies for integrations
CREATE POLICY "Users can view integrations in their organization" 
ON public.integrations FOR SELECT 
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage integrations in their organization" 
ON public.integrations FOR ALL 
USING (organization_id = public.get_user_organization_id());

-- RLS Policies for jobs
CREATE POLICY "Users can view jobs in their organization" 
ON public.jobs FOR SELECT 
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage jobs in their organization" 
ON public.jobs FOR ALL 
USING (organization_id = public.get_user_organization_id());

-- RLS Policies for metrics
CREATE POLICY "Users can view metrics in their organization" 
ON public.metrics FOR SELECT 
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage metrics in their organization" 
ON public.metrics FOR ALL 
USING (organization_id = public.get_user_organization_id());

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Create organization if user is signing up
    INSERT INTO public.organizations (name, slug)
    VALUES (
        COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Organization'),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'my-organization'), ' ', '-'))
    )
    RETURNING id INTO org_id;
    
    -- Create user profile
    INSERT INTO public.profiles (user_id, organization_id, first_name, last_name, email, role)
    VALUES (
        NEW.id,
        org_id,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        NEW.email,
        'admin'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();