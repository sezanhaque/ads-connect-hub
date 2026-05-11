CREATE OR REPLACE FUNCTION public.get_users_highest_role(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.user_id,
         (ARRAY_AGG(m.role ORDER BY CASE m.role
            WHEN 'owner' THEN 3
            WHEN 'admin' THEN 2
            WHEN 'member' THEN 1
            ELSE 0 END DESC))[1] AS role
  FROM public.members m
  WHERE m.user_id = ANY(p_user_ids)
  GROUP BY m.user_id;
$$;