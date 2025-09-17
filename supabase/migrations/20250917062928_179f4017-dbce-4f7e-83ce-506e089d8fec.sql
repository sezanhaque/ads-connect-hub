-- Add google_sheet_id column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS google_sheet_id TEXT;