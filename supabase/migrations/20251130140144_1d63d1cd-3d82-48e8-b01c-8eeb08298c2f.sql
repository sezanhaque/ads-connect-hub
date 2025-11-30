-- Create table to track daily campaign spend
CREATE TABLE IF NOT EXISTS public.daily_campaign_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  spend_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_id, spend_date)
);

-- Enable RLS
ALTER TABLE public.daily_campaign_spend ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own spend tracking
CREATE POLICY "Users can view own daily spend"
ON public.daily_campaign_spend
FOR SELECT
USING (
  wallet_id IN (
    SELECT id FROM public.wallets 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Service role can manage all records
CREATE POLICY "Service role can manage daily spend"
ON public.daily_campaign_spend
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_daily_spend_wallet_date ON public.daily_campaign_spend(wallet_id, spend_date);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_campaign_spend_updated_at
BEFORE UPDATE ON public.daily_campaign_spend
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();