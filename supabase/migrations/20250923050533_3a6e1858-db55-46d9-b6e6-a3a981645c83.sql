-- Add ad_account_id field to invites table
ALTER TABLE public.invites 
ADD COLUMN ad_account_id TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.invites.ad_account_id IS 'Meta ad account ID for the invited user';