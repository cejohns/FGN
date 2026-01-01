/*
  # Configure CRON_SECRET Authentication for Scheduled Jobs

  ## Overview
  Updates all scheduled cron jobs to use X-Cron-Secret header authentication.
  Creates a secure configuration table to store the cron secret that pg_cron can access.

  ## Changes Made

  1. **Creates Secrets Configuration Table**
     - Stores CRON_SECRET in a secure table
     - Only accessible by postgres and service roles
     - RLS prevents unauthorized access

  2. **Updates Cron Job Functions**
     - Uses X-Cron-Secret header instead of service role JWT
     - All trigger functions updated to fetch secret from config

  3. **Setup Instructions**
     After migration:
     1. Set CRON_SECRET in Supabase Edge Functions secrets (Project Settings > Edge Functions)
     2. Store the same value in the database:
        INSERT INTO public.app_secrets (key, value, description) 
        VALUES ('cron_secret', 'YOUR_RANDOM_SECRET_HERE', 'Secret for authenticating scheduled cron jobs')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  ## Security
  - Secret never exposed to client
  - RLS blocks all access except postgres role
  - Separate from JWT authentication
*/

-- Create table for application secrets
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Only postgres can access secrets
CREATE POLICY "Only postgres can access secrets"
  ON public.app_secrets
  FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.app_secrets IS 'Secure storage for application secrets like CRON_SECRET. Only accessible by postgres role.';

-- Helper function to get cron secret
CREATE OR REPLACE FUNCTION public.get_cron_secret()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT value INTO secret_value
  FROM public.app_secrets
  WHERE key = 'cron_secret'
  LIMIT 1;

  RETURN secret_value;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to retrieve cron_secret: %', SQLERRM;
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_cron_secret() IS 'Retrieves CRON_SECRET for use in scheduled jobs. Returns NULL if not configured.';

-- Update trigger_game_release_sync to use X-Cron-Secret
CREATE OR REPLACE FUNCTION public.trigger_game_release_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  cron_secret text;
  request_id bigint;
BEGIN
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://' || current_setting('app.settings.project_ref', false) || '.supabase.co';
  END IF;

  cron_secret := public.get_cron_secret();

  IF cron_secret IS NULL THEN
    RAISE EXCEPTION 'CRON_SECRET not configured. Set it using: INSERT INTO app_secrets (key, value, description) VALUES (''cron_secret'', ''YOUR_SECRET'', ''Cron authentication'');';
  END IF;

  SELECT net.http_post(
    url := supabase_url || '/functions/v1/sync-game-releases?days=90',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', cron_secret
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RAISE NOTICE 'Game release sync triggered with request_id: % at %', request_id, now();
END;
$$;

-- Create trigger_platform_news_sync
CREATE OR REPLACE FUNCTION public.trigger_platform_news_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  cron_secret text;
  request_id bigint;
BEGIN
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://' || current_setting('app.settings.project_ref', false) || '.supabase.co';
  END IF;

  cron_secret := public.get_cron_secret();

  IF cron_secret IS NULL THEN
    RAISE EXCEPTION 'CRON_SECRET not configured in app_secrets table';
  END IF;

  SELECT net.http_post(
    url := supabase_url || '/functions/v1/sync-platform-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', cron_secret
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RAISE NOTICE 'Platform news sync triggered with request_id: % at %', request_id, now();
END;
$$;

COMMENT ON FUNCTION public.trigger_platform_news_sync() IS 'Triggers sync of platform news from RSS feeds (PlayStation, Xbox, Nintendo)';

-- Create trigger_youtube_news_sync
CREATE OR REPLACE FUNCTION public.trigger_youtube_news_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  cron_secret text;
  request_id bigint;
BEGIN
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://' || current_setting('app.settings.project_ref', false) || '.supabase.co';
  END IF;

  cron_secret := public.get_cron_secret();

  IF cron_secret IS NULL THEN
    RAISE EXCEPTION 'CRON_SECRET not configured in app_secrets table';
  END IF;

  SELECT net.http_post(
    url := supabase_url || '/functions/v1/sync-youtube-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', cron_secret
    ),
    body := '{"maxResults": 10}'::jsonb
  ) INTO request_id;

  RAISE NOTICE 'YouTube news sync triggered with request_id: % at %', request_id, now();
END;
$$;

COMMENT ON FUNCTION public.trigger_youtube_news_sync() IS 'Triggers sync of gaming news from YouTube channels';

-- Create trigger_game_images_update
CREATE OR REPLACE FUNCTION public.trigger_game_images_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  cron_secret text;
  request_id bigint;
BEGIN
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://' || current_setting('app.settings.project_ref', false) || '.supabase.co';
  END IF;

  cron_secret := public.get_cron_secret();

  IF cron_secret IS NULL THEN
    RAISE EXCEPTION 'CRON_SECRET not configured in app_secrets table';
  END IF;

  SELECT net.http_post(
    url := supabase_url || '/functions/v1/update-game-images',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', cron_secret
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RAISE NOTICE 'Game images update triggered with request_id: % at %', request_id, now();
END;
$$;

COMMENT ON FUNCTION public.trigger_game_images_update() IS 'Triggers update of game images from IGDB';

-- Recreate cron jobs
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'daily-game-releases-sync') THEN
    PERFORM cron.unschedule('daily-game-releases-sync');
  END IF;
  PERFORM cron.schedule('daily-game-releases-sync', '0 3 * * *', 'SELECT public.trigger_game_release_sync();');

  IF EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'sync-platform-news-6h') THEN
    PERFORM cron.unschedule('sync-platform-news-6h');
  END IF;
  PERFORM cron.schedule('sync-platform-news-6h', '0 */6 * * *', 'SELECT public.trigger_platform_news_sync();');

  IF EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'sync-youtube-news-12h') THEN
    PERFORM cron.unschedule('sync-youtube-news-12h');
  END IF;
  PERFORM cron.schedule('sync-youtube-news-12h', '30 */12 * * *', 'SELECT public.trigger_youtube_news_sync();');

  IF EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'update-game-images-weekly') THEN
    PERFORM cron.unschedule('update-game-images-weekly');
  END IF;
  PERFORM cron.schedule('update-game-images-weekly', '0 4 * * 0', 'SELECT public.trigger_game_images_update();');
END $$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.get_cron_secret() TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_game_release_sync() TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_platform_news_sync() TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_youtube_news_sync() TO postgres;
GRANT EXECUTE ON FUNCTION public.trigger_game_images_update() TO postgres;

-- View for monitoring
CREATE OR REPLACE VIEW public.scheduled_jobs AS
SELECT jobid, jobname, schedule, command, active, database, username
FROM cron.job
ORDER BY jobname;

GRANT SELECT ON public.scheduled_jobs TO authenticated;