
-- 1) Delete duplicates, keep most recent per (company_id, platform, name)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY company_id, platform, name
           ORDER BY created_at DESC
         ) AS rn
  FROM public.campaigns
  WHERE platform = 'tiktok'
    AND company_id = '8c923d7c-2c26-4697-9786-abd50cb87705'
)
DELETE FROM public.campaigns c
USING ranked r
WHERE c.id = r.id AND r.rn > 1;

-- 2) Prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_company_platform_name_uniq
  ON public.campaigns (company_id, platform, name)
  WHERE company_id IS NOT NULL;
