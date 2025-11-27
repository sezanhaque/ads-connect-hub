-- Add Stripe Issuing support to wallets table
-- Change from org-based to user-based wallets

-- Remove unique constraint on org_id to allow multiple wallets per org
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_org_id_key;

-- Add new columns for user-based wallets and Stripe Issuing
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS stripe_cardholder_id TEXT;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS card_last4 TEXT;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS card_exp_month INTEGER;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS card_exp_year INTEGER;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS card_status TEXT DEFAULT 'pending';

-- Create unique constraint for one wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_id_key ON wallets(user_id);

-- Update RLS policies for user-based access
DROP POLICY IF EXISTS "Users can view org wallet" ON wallets;
DROP POLICY IF EXISTS "Users can manage org wallet" ON wallets;

CREATE POLICY "Users can view own wallet"
ON wallets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wallet"
ON wallets FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update wallet_transactions RLS policies
DROP POLICY IF EXISTS "Users can view org wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can manage org wallet transactions" ON wallet_transactions;

CREATE POLICY "Users can view own wallet transactions"
ON wallet_transactions FOR SELECT
TO authenticated
USING (wallet_id IN (
  SELECT id FROM wallets WHERE user_id = auth.uid()
));

CREATE POLICY "Users can manage own wallet transactions"
ON wallet_transactions FOR ALL
TO authenticated
USING (wallet_id IN (
  SELECT id FROM wallets WHERE user_id = auth.uid()
))
WITH CHECK (wallet_id IN (
  SELECT id FROM wallets WHERE user_id = auth.uid()
));