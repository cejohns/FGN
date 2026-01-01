import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'approve'
  | 'reject'
  | 'sync'
  | 'ai_generate';

export type AuditEntity =
  | 'blog_posts'
  | 'news_posts'
  | 'news_articles'
  | 'guides'
  | 'game_releases'
  | 'reviews'
  | 'videos'
  | 'gallery_items';

export interface AuditLogEntry {
  actorUserId: string;
  actorEmail?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(
  entry: AuditLogEntry
): Promise<{ success: boolean; auditId?: string; error?: string }> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return {
        success: false,
        error: 'Audit logging configuration error',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('admin_audit_log')
      .insert({
        actor_user_id: entry.actorUserId,
        actor_email: entry.actorEmail,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log admin action:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      auditId: data.id,
    };
  } catch (err) {
    console.error('Exception in logAdminAction:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export function extractRequestMetadata(req: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    ipAddress:
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };
}

export async function logContentAction(
  req: Request,
  userId: string,
  userEmail: string | undefined,
  action: AuditAction,
  entity: AuditEntity,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestMetadata(req);

  await logAdminAction({
    actorUserId: userId,
    actorEmail: userEmail,
    action,
    entity,
    entityId,
    metadata,
    ipAddress,
    userAgent,
  });
}
