CREATE OR REPLACE FUNCTION public.get_users_balances(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, balance numeric, currency text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH ranked AS (
    SELECT m.user_id,
           cb.current_balance,
           cb.currency,
           ROW_NUMBER() OVER (
             PARTITION BY m.user_id
             ORDER BY CASE m.role
               WHEN 'owner' THEN 3
               WHEN 'admin' THEN 2
               WHEN 'member' THEN 1
               ELSE 0 END DESC,
               cb.current_balance DESC NULLS LAST
           ) AS rn
    FROM public.members m
    LEFT JOIN public.client_balances cb ON cb.org_id = m.org_id
    WHERE m.user_id = ANY(p_user_ids)
  )
  SELECT user_id,
         COALESCE(current_balance, 0)::numeric AS balance,
         COALESCE(currency, 'EUR') AS currency
  FROM ranked
  WHERE rn = 1;
$$;