
CREATE TABLE public.company_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (integration_type IN ('meta','tiktok')),
  ad_account_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, integration_type)
);

GRANT SELECT ON public.company_integrations TO authenticated;
GRANT ALL ON public.company_integrations TO service_role;

ALTER TABLE public.company_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view their company integrations"
  ON public.company_integrations
  FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE TRIGGER update_company_integrations_updated_at
  BEFORE UPDATE ON public.company_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_company_integrations_company ON public.company_integrations(company_id);
