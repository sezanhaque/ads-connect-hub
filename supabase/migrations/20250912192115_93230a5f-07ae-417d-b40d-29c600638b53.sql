-- Add external_id column to campaigns table for Meta Ads integration
ALTER TABLE public.campaigns 
ADD COLUMN external_id TEXT;

-- Create index for external_id for faster lookups
CREATE INDEX idx_campaigns_external_id ON public.campaigns(external_id);

-- Add some additional columns for better campaign tracking
ALTER TABLE public.campaigns 
ADD COLUMN tags TEXT[],
ADD COLUMN performance_data JSONB DEFAULT '{}'::jsonb;