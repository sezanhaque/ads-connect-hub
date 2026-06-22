
CREATE OR REPLACE FUNCTION public.extract_email_domain(p_email text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public
AS $$ SELECT lower(split_part(p_email, '@', 2)); $$;

REVOKE EXECUTE ON FUNCTION public.get_or_create_company_for_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_company_for_email(text) TO service_role;
