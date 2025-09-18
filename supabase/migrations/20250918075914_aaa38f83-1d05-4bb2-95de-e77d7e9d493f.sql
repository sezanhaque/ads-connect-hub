-- Create storage bucket for campaign assets
INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-assets', 'campaign-assets', false);

-- Create policies for campaign assets bucket
CREATE POLICY "Users can upload campaign assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their organization's campaign assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their organization's campaign assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their organization's campaign assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

-- Add campaign_assets column to campaigns table to store file URLs
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_assets JSONB DEFAULT '[]'::jsonb;