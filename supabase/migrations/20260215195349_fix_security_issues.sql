/*
  # Fix Security Issues
  
  1. Drop Unused Indexes
    - Drop `news_articles_is_featured_idx` (table doesn't exist, likely orphaned)
    - Drop `guides_published_at_idx` (unused index)
    - Drop `idx_game_releases_slug` (unused index)
  
  2. Recreate Security Definer Views
    - Recreate all views WITHOUT SECURITY DEFINER to remove security risk
    - Views: cron_latest_status, cron_execution_stats, recent_admin_activity, cron_recent_failures, scheduled_jobs
  
  Note: Auth DB Connection Strategy must be changed in Supabase Dashboard (Database > Settings > Connection Pooling)
*/

-- Drop unused indexes (use IF EXISTS to prevent errors)
DROP INDEX IF EXISTS news_articles_is_featured_idx;
DROP INDEX IF EXISTS guides_published_at_idx;
DROP INDEX IF EXISTS idx_game_releases_slug;

-- Recreate views without SECURITY DEFINER

-- Drop existing views
DROP VIEW IF EXISTS cron_latest_status CASCADE;
DROP VIEW IF EXISTS cron_execution_stats CASCADE;
DROP VIEW IF EXISTS recent_admin_activity CASCADE;
DROP VIEW IF EXISTS cron_recent_failures CASCADE;
DROP VIEW IF EXISTS scheduled_jobs CASCADE;

-- Recreate cron_latest_status without SECURITY DEFINER
CREATE VIEW cron_latest_status AS
SELECT DISTINCT ON (function_name) 
  function_name,
  execution_status,
  started_at,
  completed_at,
  duration_ms,
  records_processed,
  error_message,
  created_at
FROM cron_execution_log
ORDER BY function_name, created_at DESC;

-- Recreate cron_execution_stats without SECURITY DEFINER
CREATE VIEW cron_execution_stats AS
SELECT 
  function_name,
  count(*) AS total_executions,
  count(*) FILTER (WHERE execution_status = 'success') AS successful,
  count(*) FILTER (WHERE execution_status = 'failure') AS failed,
  count(*) FILTER (WHERE execution_status = 'timeout') AS timeouts,
  round(avg(duration_ms)) AS avg_duration_ms,
  max(created_at) AS last_execution,
  round((100.0 * count(*) FILTER (WHERE execution_status = 'success')::numeric / count(*)::numeric), 2) AS success_rate
FROM cron_execution_log
WHERE created_at > now() - interval '7 days'
GROUP BY function_name
ORDER BY max(created_at) DESC;

-- Recreate recent_admin_activity without SECURITY DEFINER
CREATE VIEW recent_admin_activity AS
SELECT 
  aal.id,
  aal.actor_user_id,
  aal.actor_email,
  aal.action,
  aal.entity,
  aal.entity_id,
  aal.metadata,
  aal.created_at,
  au.email AS current_admin_email
FROM admin_audit_log aal
LEFT JOIN admin_users au ON au.id = aal.actor_user_id
ORDER BY aal.created_at DESC
LIMIT 100;

-- Recreate cron_recent_failures without SECURITY DEFINER
CREATE VIEW cron_recent_failures AS
SELECT 
  function_name,
  execution_status,
  started_at,
  error_message,
  error_details,
  created_at
FROM cron_execution_log
WHERE execution_status IN ('failure', 'timeout')
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- Recreate scheduled_jobs without SECURITY DEFINER
CREATE VIEW scheduled_jobs AS
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  database,
  username
FROM cron.job
ORDER BY jobname;

-- Grant SELECT on views to authenticated users (admin only through RLS on underlying tables)
GRANT SELECT ON cron_latest_status TO authenticated;
GRANT SELECT ON cron_execution_stats TO authenticated;
GRANT SELECT ON recent_admin_activity TO authenticated;
GRANT SELECT ON cron_recent_failures TO authenticated;
GRANT SELECT ON scheduled_jobs TO authenticated;
