-- Incidents
CREATE TABLE public.status_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  affected_service text NOT NULL,
  status text NOT NULL CHECK (status IN ('investigating','monitoring','resolved')),
  description text,
  started_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.status_incidents TO authenticated;
GRANT ALL ON public.status_incidents TO service_role;
ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read incidents"
  ON public.status_incidents FOR SELECT TO authenticated USING (true);
CREATE TRIGGER status_incidents_updated_at
  BEFORE UPDATE ON public.status_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- API Connections
CREATE TABLE public.status_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL UNIQUE,
  service_name text NOT NULL,
  category text NOT NULL DEFAULT 'core' CHECK (category IN ('core','ats')),
  status text NOT NULL CHECK (status IN ('connected','degraded','disconnected')),
  last_sync_at timestamptz,
  response_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.status_connections TO authenticated;
GRANT ALL ON public.status_connections TO service_role;
ALTER TABLE public.status_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read connections"
  ON public.status_connections FOR SELECT TO authenticated USING (true);
CREATE TRIGGER status_connections_updated_at
  BEFORE UPDATE ON public.status_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Maintenance windows
CREATE TABLE public.status_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  affected_services text[] NOT NULL DEFAULT '{}',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  timezone text NOT NULL DEFAULT 'CET',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.status_maintenance TO authenticated;
GRANT ALL ON public.status_maintenance TO service_role;
ALTER TABLE public.status_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read maintenance"
  ON public.status_maintenance FOR SELECT TO authenticated USING (true);
CREATE TRIGGER status_maintenance_updated_at
  BEFORE UPDATE ON public.status_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed core connection rows
INSERT INTO public.status_connections (service_key, service_name, category, status, last_sync_at, response_time_ms)
VALUES
  ('meta_ads', 'Meta Ads API', 'core', 'connected', now(), 180),
  ('tiktok_ads', 'TikTok Ads API', 'core', 'connected', now(), 210);
