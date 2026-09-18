CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('send-discovery-call-reminders')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-discovery-call-reminders');

SELECT cron.schedule(
  'send-discovery-call-reminders',
  '0 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gpcpovoikxgkgnabumlx.supabase.co/functions/v1/send-call-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-reminder-secret', '712edd9a552f64cfb27b0cb7ab18da82ef65a4b2b5c8d6d9'
    ),
    body := '{}'::jsonb
  );
  $$
);