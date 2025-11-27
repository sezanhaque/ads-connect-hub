-- Create a function to get user platform connections across all their organizations
-- Uses SECURITY DEFINER to bypass RLS and allow admins to see user connections
CREATE OR REPLACE FUNCTION public.get_user_platform_connections(p_user_ids uuid[])
RETURNS TABLE (
  user_id uuid,
  has_meta boolean,
  has_tiktok boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    COALESCE(bool_or(i.integration_type = 'meta'), false) as has_meta,
    COALESCE(bool_or(i.integration_type = 'tiktok'), false) as has_tiktok
  FROM unnest(p_user_ids) AS u(user_id)
  LEFT JOIN members m ON m.user_id = u.user_id
  LEFT JOIN integrations i ON i.org_id = m.org_id 
    AND i.status = 'active'
    AND (i.user_id = u.user_id OR i.user_id IS NULL)
  GROUP BY u.user_id;
END;
$$;