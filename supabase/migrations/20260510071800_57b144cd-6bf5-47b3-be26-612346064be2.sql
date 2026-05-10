
-- Top-ups table
CREATE TABLE public.topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  mollie_payment_id text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  description text,
  status text NOT NULL DEFAULT 'open',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_topups_user ON public.topups(user_id);
CREATE INDEX idx_topups_org ON public.topups(org_id);

ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own topups" ON public.topups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Org members view org topups" ON public.topups
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages topups" ON public.topups
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_topups_updated
  BEFORE UPDATE ON public.topups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Balance transactions (signed amounts)
CREATE TABLE public.balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_ref)
);

CREATE INDEX idx_bt_org ON public.balance_transactions(org_id);
CREATE INDEX idx_bt_user ON public.balance_transactions(user_id);

ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view balance transactions" ON public.balance_transactions
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages balance transactions" ON public.balance_transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Per-org balance view
CREATE OR REPLACE VIEW public.client_balances
WITH (security_invoker = true)
AS
SELECT
  org_id,
  COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS total_topups,
  COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) AS total_costs,
  COALESCE(SUM(amount), 0) AS current_balance,
  'EUR'::text AS currency
FROM public.balance_transactions
GROUP BY org_id;
