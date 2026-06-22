
-- TABLES (created first, no policies/functions referencing each other yet)
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
CREATE INDEX company_members_user_id_idx ON public.company_members(user_id);
CREATE INDEX company_members_company_id_idx ON public.company_members(company_id);

CREATE TABLE public.company_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.personal_email_domains (
  domain text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.legacy_test_allowlist (
  user_id uuid PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.feature_flags (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  company_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS
GRANT SELECT ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

GRANT SELECT ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;

GRANT SELECT ON public.company_credits TO authenticated;
GRANT ALL ON public.company_credits TO service_role;

GRANT SELECT ON public.personal_email_domains TO anon, authenticated;
GRANT ALL ON public.personal_email_domains TO service_role;

GRANT SELECT ON public.legacy_test_allowlist TO authenticated;
GRANT ALL ON public.legacy_test_allowlist TO service_role;

GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT ALL ON public.feature_flags TO service_role;

-- ENABLE RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_test_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS (tables now exist)
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.extract_email_domain(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(split_part(p_email, '@', 2));
$$;

CREATE OR REPLACE FUNCTION public.is_personal_domain(p_domain text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.personal_email_domains
    WHERE domain = lower(p_domain)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_company_for_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_domain text;
  v_company_id uuid;
  v_display text;
BEGIN
  v_domain := public.extract_email_domain(p_email);
  IF v_domain IS NULL OR v_domain = '' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  SELECT id INTO v_company_id FROM public.companies WHERE domain = v_domain;
  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  v_display := initcap(split_part(v_domain, '.', 1));
  INSERT INTO public.companies (domain, display_name)
  VALUES (v_domain, v_display)
  RETURNING id INTO v_company_id;

  INSERT INTO public.company_credits (company_id) VALUES (v_company_id);
  RETURN v_company_id;
END;
$$;

-- POLICIES
CREATE POLICY "Members can view their company" ON public.companies
  FOR SELECT TO authenticated
  USING (public.is_company_member(id, auth.uid()));

CREATE POLICY "Users can view their own membership rows" ON public.company_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Members can view fellow members" ON public.company_members
  FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members can view their company credits" ON public.company_credits
  FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Anyone can read personal domain list" ON public.personal_email_domains
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can check their own allowlist status" ON public.legacy_test_allowlist
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read feature flags" ON public.feature_flags
  FOR SELECT TO anon, authenticated USING (true);

-- TRIGGERS
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER company_credits_updated_at
  BEFORE UPDATE ON public.company_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED DATA
INSERT INTO public.personal_email_domains (domain) VALUES
  ('gmail.com'), ('googlemail.com'),
  ('outlook.com'), ('hotmail.com'), ('live.com'), ('msn.com'),
  ('yahoo.com'), ('yahoo.co.uk'), ('ymail.com'),
  ('icloud.com'), ('me.com'), ('mac.com'),
  ('proton.me'), ('protonmail.com'),
  ('aol.com'), ('gmx.com'), ('gmx.de'),
  ('mail.com'), ('zoho.com'),
  ('yandex.com'), ('yandex.ru'),
  ('qq.com'), ('163.com'), ('126.com'),
  ('tutanota.com'), ('fastmail.com'),
  ('hey.com'), ('inbox.com'), ('rocketmail.com');

INSERT INTO public.feature_flags (id, company_mode_enabled) VALUES (true, false);
