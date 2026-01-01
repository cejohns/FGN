/*
  # Create Admin Audit Log Table

  ## Overview
  Creates a comprehensive audit log system to track all admin actions for security,
  compliance, and troubleshooting purposes.

  ## Changes Made

  1. **Admin Audit Log Table**
     - Tracks all admin mutations (create, edit, delete, publish, sync, AI generation)
     - Includes actor identification, action type, entity details, and metadata
     - Timestamps for when actions occurred

  2. **Row Level Security**
     - Only admins can read audit logs
     - Only service role can insert (via Edge Functions)
     - No updates or deletes allowed (immutable audit trail)

  3. **Indexes**
     - Fast lookups by actor, action type, entity, and timestamp
     - Optimized for common audit queries

  ## Security Benefits
  - Complete audit trail of all admin actions
  - Tamper-proof (no updates/deletes)
  - Admins can review their own actions
  - Compliance with security best practices
*/

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL,
  actor_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Only service role can insert audit entries (via Edge Functions)
CREATE POLICY "Service role can insert audit logs"
  ON public.admin_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No updates or deletes allowed (immutable audit trail)

COMMENT ON TABLE public.admin_audit_log IS 'Immutable audit trail of all admin actions. Only admins can read, only service role can insert.';
COMMENT ON COLUMN public.admin_audit_log.actor_user_id IS 'UUID of the admin user who performed the action';
COMMENT ON COLUMN public.admin_audit_log.actor_email IS 'Email of the admin user (denormalized for convenience)';
COMMENT ON COLUMN public.admin_audit_log.action IS 'Type of action: create, update, delete, publish, unpublish, sync, ai_generate';
COMMENT ON COLUMN public.admin_audit_log.entity IS 'Table/entity type: blog_posts, news_posts, guides, game_releases, etc.';
COMMENT ON COLUMN public.admin_audit_log.entity_id IS 'ID of the affected record';
COMMENT ON COLUMN public.admin_audit_log.metadata IS 'Additional context: old values, new values, parameters, etc.';
COMMENT ON COLUMN public.admin_audit_log.ip_address IS 'IP address of the request';
COMMENT ON COLUMN public.admin_audit_log.user_agent IS 'User agent string of the request';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.admin_audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.admin_audit_log(entity);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id ON public.admin_audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_combined ON public.admin_audit_log(entity, entity_id, created_at DESC);

-- Create helper function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_actor_user_id uuid,
  p_actor_email text,
  p_action text,
  p_entity text,
  p_entity_id text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO public.admin_audit_log (
    actor_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_actor_user_id,
    p_actor_email,
    p_action,
    p_entity,
    p_entity_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$;

COMMENT ON FUNCTION public.log_admin_action IS 'Helper function to insert audit log entries. Returns the audit log ID.';

-- Create view for recent admin activity
CREATE OR REPLACE VIEW public.recent_admin_activity AS
SELECT
  aal.id,
  aal.actor_user_id,
  aal.actor_email,
  aal.action,
  aal.entity,
  aal.entity_id,
  aal.metadata,
  aal.created_at,
  au.email as current_admin_email
FROM public.admin_audit_log aal
LEFT JOIN public.admin_users au ON au.id = aal.actor_user_id
ORDER BY aal.created_at DESC
LIMIT 100;

COMMENT ON VIEW public.recent_admin_activity IS 'Recent 100 admin actions with admin details';

GRANT SELECT ON public.recent_admin_activity TO authenticated;

-- Grant permissions
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action TO service_role;
GRANT EXECUTE ON FUNCTION public.log_admin_action TO postgres;
