ALTER TABLE public.companies ALTER COLUMN domain DROP NOT NULL;
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_domain_key;
CREATE UNIQUE INDEX IF NOT EXISTS companies_domain_unique_idx
  ON public.companies (domain) WHERE domain IS NOT NULL;