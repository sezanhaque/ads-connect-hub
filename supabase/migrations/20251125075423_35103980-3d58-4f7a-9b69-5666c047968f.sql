-- Add platform field to campaigns table to distinguish between Meta and TikTok
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS platform text DEFAULT 'meta';

-- Add comment to document the column
COMMENT ON COLUMN public.campaigns.platform IS 'Platform where campaign is published: meta or tiktok';

-- Update existing campaigns to have platform = 'meta'
UPDATE public.campaigns 
SET platform = 'meta' 
WHERE platform IS NULL;