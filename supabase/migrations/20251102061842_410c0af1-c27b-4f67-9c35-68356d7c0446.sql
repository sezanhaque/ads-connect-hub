-- Change ad_account_id to support multiple IDs using array
ALTER TABLE public.invites 
ALTER COLUMN ad_account_id TYPE text[] USING CASE 
  WHEN ad_account_id IS NULL THEN NULL 
  ELSE ARRAY[ad_account_id] 
END;

ALTER TABLE public.integrations 
ALTER COLUMN ad_account_id TYPE text[] USING CASE 
  WHEN ad_account_id IS NULL THEN NULL 
  ELSE ARRAY[ad_account_id] 
END;

COMMENT ON COLUMN public.invites.ad_account_id IS 'Array of Meta Ad Account IDs';
COMMENT ON COLUMN public.integrations.ad_account_id IS 'Array of Meta Ad Account IDs';