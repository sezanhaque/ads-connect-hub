-- Create wallets table for organization card balances
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_card_id TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Create wallet_transactions table for top-up history
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'ideal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets
CREATE POLICY "Users can view org wallet"
ON public.wallets FOR SELECT
USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage org wallet"
ON public.wallets FOR ALL
USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

-- RLS policies for wallet_transactions
CREATE POLICY "Users can view org wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (wallet_id IN (
  SELECT w.id FROM wallets w
  JOIN members m ON w.org_id = m.org_id
  WHERE m.user_id = auth.uid()
));

CREATE POLICY "Users can manage org wallet transactions"
ON public.wallet_transactions FOR ALL
USING (wallet_id IN (
  SELECT w.id FROM wallets w
  JOIN members m ON w.org_id = m.org_id
  WHERE m.user_id = auth.uid()
));

-- Trigger for updated_at on wallets
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();