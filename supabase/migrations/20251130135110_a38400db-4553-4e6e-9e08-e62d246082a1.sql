-- Schedule daily campaign spend sync at 2 AM UTC
SELECT cron.schedule(
  'daily-campaign-spend-sync',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://ctchkdgmlcbuobzqyams.supabase.co/functions/v1/sync-campaign-spend',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y2hrZGdtbGNidW9ienF5YW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDQ1MTgsImV4cCI6MjA3MzYyMDUxOH0.zz_Hz1qJnonWd5N0i_afTe4LpH9mVUo9bYqSa2i3x7k"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);