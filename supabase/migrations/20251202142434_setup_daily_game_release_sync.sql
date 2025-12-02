/*
  # Setup Daily Game Release Sync Automation

  ## Overview
  Configures automated daily synchronization of game release data using pg_cron.
  The job runs at 3:00 AM UTC daily to keep game release information up-to-date.

  ## Changes Made
  
  ### 1. Scheduled Job Configuration
  - Creates a pg_cron job named 'daily-game-releases-sync'
  - Runs daily at 3:00 AM UTC (configurable)
  - Calls the sync-game-releases edge function automatically
  - Uses service role for authentication
  
  ### 2. Job Details
  - **Schedule**: '0 3 * * *' (3 AM UTC every day)
  - **Target**: sync-game-releases edge function
  - **Parameters**: 
    - days=90 (fetch releases for next 90 days)
    - Attempts IGDB first, falls back to RAWG, then demo data
  - **Retry Logic**: Built-in fallback mechanisms in the sync function
  
  ### 3. Important Notes
  - The job will run automatically in the background
  - No manual intervention required after setup
  - Logs available in Supabase dashboard under Edge Functions
  - To change sync time, update the cron schedule
  - To disable, unschedule the job using: SELECT cron.unschedule('daily-game-releases-sync')

  ## Time Zone Reference
  Common sync times (in UTC):
  - 3:00 AM UTC = 10:00 PM EST / 7:00 PM PST (previous day)
  - 6:00 AM UTC = 1:00 AM EST / 10:00 PM PST (previous day)
  - 9:00 AM UTC = 4:00 AM EST / 1:00 AM PST

  ## Manual Testing
  To manually test the sync function:
  - Call: https://your-project.supabase.co/functions/v1/sync-game-releases
  - Or use the admin panel's sync button
*/

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if it exists (safe approach)
DO $$
DECLARE
  job_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM cron.job WHERE jobname = 'daily-game-releases-sync'
  ) INTO job_exists;
  
  IF job_exists THEN
    PERFORM cron.unschedule('daily-game-releases-sync');
  END IF;
END $$;

-- Create a helper function to perform the sync
CREATE OR REPLACE FUNCTION public.trigger_game_release_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  service_key text;
  request_id bigint;
BEGIN
  -- Get Supabase URL from environment
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL THEN
    supabase_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co';
  END IF;
  
  -- Get service role key
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Make HTTP request to edge function
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/sync-game-releases?days=90',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, current_setting('request.jwt.claim.sub', true))
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE NOTICE 'Game release sync triggered with request_id: %', request_id;
END;
$$;

COMMENT ON FUNCTION public.trigger_game_release_sync() IS 'Triggers the game release sync edge function. Can be called manually or by cron.';

-- Schedule daily game release sync at 3:00 AM UTC
-- Cron format: minute hour day month weekday
-- '0 3 * * *' means: run at minute 0, hour 3, every day, every month, every weekday
SELECT cron.schedule(
  'daily-game-releases-sync',
  '0 3 * * *',
  'SELECT public.trigger_game_release_sync();'
);

-- Create a function to view scheduled jobs
CREATE OR REPLACE FUNCTION public.list_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM cron.job ORDER BY jobid;
$$;

COMMENT ON FUNCTION public.list_cron_jobs() IS 'View all scheduled cron jobs. Useful for monitoring automated tasks.';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.trigger_game_release_sync() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_cron_jobs() TO authenticated;