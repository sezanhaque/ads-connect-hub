CREATE OR REPLACE FUNCTION public.get_users_balances(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, balance numeric, currency text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT w.user_id, COALESCE(SUM(w.balance), 0)::numeric AS balance,
         (ARRAY_AGG(w.currency))[1] AS currency
  FROM public.wallets w
  WHERE w.user_id = ANY(p_user_ids)
  GROUP BY w.user_id;
$$;