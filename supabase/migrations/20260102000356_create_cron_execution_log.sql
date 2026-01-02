/*
  # Create Cron Execution Log Table

  ## Overview
  Tracks execution history of scheduled cron jobs for monitoring, alerting, and debugging.

  ## Changes Made

  1. **Cron Execution Log Table**
     - Tracks all cron job executions (success/failure)
     - Stores function name, status, duration, error messages
     - Enables monitoring and alerting

  2. **Row Level Security**
     - Only admins can read execution logs
     - Only service role can insert (via Edge Functions)
     - No updates or deletes allowed

  3. **Indexes**
     - Fast lookups by function name, status, and timestamp
     - Optimized for monitoring queries

  4. **Views**
     - Latest execution status per function
     - Failed executions for alerting

  ## Benefits
  - Monitor cron job health
  - Track execution patterns
  - Alert on failures
  - Debug issues quickly
*/

-- Create cron_execution_log table
CREATE TABLE IF NOT EXISTS public.cron_execution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  execution_status text NOT NULL CHECK (execution_status IN ('success', 'failure', 'timeout')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer,
  records_processed integer DEFAULT 0,
  error_message text,
  error_details jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.cron_execution_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read cron logs
CREATE POLICY "Admins can read cron execution logs"
  ON public.cron_execution_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Only service role can insert cron logs (via Edge Functions)
CREATE POLICY "Service role can insert cron logs"
  ON public.cron_execution_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No updates or deletes allowed

COMMENT ON TABLE public.cron_execution_log IS 'Tracks cron job execution history for monitoring and alerting';
COMMENT ON COLUMN public.cron_execution_log.function_name IS 'Name of the Edge Function that was executed';
COMMENT ON COLUMN public.cron_execution_log.execution_status IS 'success, failure, or timeout';
COMMENT ON COLUMN public.cron_execution_log.started_at IS 'When the execution started';
COMMENT ON COLUMN public.cron_execution_log.completed_at IS 'When the execution completed';
COMMENT ON COLUMN public.cron_execution_log.duration_ms IS 'Execution duration in milliseconds';
COMMENT ON COLUMN public.cron_execution_log.records_processed IS 'Number of records processed (for data sync jobs)';
COMMENT ON COLUMN public.cron_execution_log.error_message IS 'Error message if execution failed';
COMMENT ON COLUMN public.cron_execution_log.error_details IS 'Detailed error information';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cron_log_function ON public.cron_execution_log(function_name);
CREATE INDEX IF NOT EXISTS idx_cron_log_status ON public.cron_execution_log(execution_status);
CREATE INDEX IF NOT EXISTS idx_cron_log_created_at ON public.cron_execution_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_log_function_status ON public.cron_execution_log(function_name, execution_status, created_at DESC);

-- View: Latest execution status per function
CREATE OR REPLACE VIEW public.cron_latest_status AS
SELECT DISTINCT ON (function_name)
  function_name,
  execution_status,
  started_at,
  completed_at,
  duration_ms,
  records_processed,
  error_message,
  created_at
FROM public.cron_execution_log
ORDER BY function_name, created_at DESC;

COMMENT ON VIEW public.cron_latest_status IS 'Shows the most recent execution status for each cron function';

-- View: Recent failures (last 24 hours)
CREATE OR REPLACE VIEW public.cron_recent_failures AS
SELECT
  function_name,
  execution_status,
  started_at,
  error_message,
  error_details,
  created_at
FROM public.cron_execution_log
WHERE execution_status IN ('failure', 'timeout')
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

COMMENT ON VIEW public.cron_recent_failures IS 'Shows all failed/timeout cron executions in the last 24 hours';

-- View: Execution statistics
CREATE OR REPLACE VIEW public.cron_execution_stats AS
SELECT
  function_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE execution_status = 'success') as successful,
  COUNT(*) FILTER (WHERE execution_status = 'failure') as failed,
  COUNT(*) FILTER (WHERE execution_status = 'timeout') as timeouts,
  ROUND(AVG(duration_ms)) as avg_duration_ms,
  MAX(created_at) as last_execution,
  ROUND(100.0 * COUNT(*) FILTER (WHERE execution_status = 'success') / COUNT(*), 2) as success_rate
FROM public.cron_execution_log
WHERE created_at > now() - interval '7 days'
GROUP BY function_name
ORDER BY last_execution DESC;

COMMENT ON VIEW public.cron_execution_stats IS 'Execution statistics for the last 7 days per function';

-- Grant permissions
GRANT SELECT ON public.cron_execution_log TO authenticated;
GRANT SELECT ON public.cron_latest_status TO authenticated;
GRANT SELECT ON public.cron_recent_failures TO authenticated;
GRANT SELECT ON public.cron_execution_stats TO authenticated;

-- Helper function to log cron executions
CREATE OR REPLACE FUNCTION public.log_cron_execution(
  p_function_name text,
  p_execution_status text,
  p_started_at timestamptz,
  p_completed_at timestamptz DEFAULT NULL,
  p_records_processed integer DEFAULT 0,
  p_error_message text DEFAULT NULL,
  p_error_details jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
  duration integer;
BEGIN
  IF p_completed_at IS NOT NULL THEN
    duration := EXTRACT(EPOCH FROM (p_completed_at - p_started_at)) * 1000;
  END IF;

  INSERT INTO public.cron_execution_log (
    function_name,
    execution_status,
    started_at,
    completed_at,
    duration_ms,
    records_processed,
    error_message,
    error_details,
    metadata
  ) VALUES (
    p_function_name,
    p_execution_status,
    p_started_at,
    p_completed_at,
    duration,
    p_records_processed,
    p_error_message,
    p_error_details,
    p_metadata
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

COMMENT ON FUNCTION public.log_cron_execution IS 'Helper function to insert cron execution logs';

GRANT EXECUTE ON FUNCTION public.log_cron_execution TO service_role;
GRANT EXECUTE ON FUNCTION public.log_cron_execution TO postgres;
