# Production Hardening Guide

Complete security hardening implementation for FireStar Gaming Network with CORS restrictions, rate limiting, API key protection, and audit logging.

## Overview

The FGN platform now includes comprehensive security measures:

1. **CORS Allowlisting** - Only approved origins can access Edge Functions
2. **Rate Limiting** - Prevents abuse of sensitive endpoints
3. **Server-Side API Keys** - All external APIs keys secured server-side only
4. **Admin Audit Logging** - Complete trail of all admin actions

## 1. CORS Restrictions

### Implementation

All Edge Functions now use an allowlist-based CORS policy instead of wildcard `*`.

**Default Allowed Origins:**
- `http://localhost:5173` - Vite dev server
- `http://localhost:3000` - Alternative dev port
- `http://localhost:4173` - Vite preview
- `https://firestargamingnetwork.com` - Production domain

### Configuration

**Option 1: Use Defaults**
No configuration needed. The defaults will work for standard dev/prod setups.

**Option 2: Custom Origins via Environment Variable**
Set `ALLOWED_ORIGINS` in your Supabase Edge Functions environment:

```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5173
```

### How It Works

```typescript
// Shared helper: supabase/functions/_shared/cors.ts
import { handleCorsPrelight, createCorsResponse } from '../_shared/cors.ts';

// In Edge Functions:
const corsPreflightResponse = handleCorsPrelight(req);
if (corsPreflightResponse) {
  return corsPreflightResponse;
}

// For responses:
return createCorsResponse({ success: true, data }, req);
```

### Security Benefits

- ✅ Blocks unauthorized origins from calling Edge Functions
- ✅ Prevents CSRF attacks from malicious sites
- ✅ Controls which domains can access your APIs
- ✅ Fails gracefully with 403 for non-allowed origins

### Testing

```bash
# Should succeed (if localhost is allowed)
curl -X POST http://localhost:54321/functions/v1/generate-ai-content \
  -H "Origin: http://localhost:5173" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should fail with 403
curl -X POST http://localhost:54321/functions/v1/generate-ai-content \
  -H "Origin: https://evil-site.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 2. Rate Limiting

### Implementation

Edge Functions now include in-memory rate limiting to prevent abuse.

**Rate Limits:**

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Admin Actions | 10 requests | 1 minute |
| AI Generation | 3 requests | 1 minute |
| Sync Triggers | 1 request | 1 minute |
| Default | 20 requests | 1 minute |

### How It Works

```typescript
// Shared helper: supabase/functions/_shared/rateLimit.ts
import { checkRateLimit, createRateLimitResponse } from '../_shared/rateLimit.ts';

// In Edge Functions:
const rateLimitResult = checkRateLimit(req, 'ai_generation', userId);
if (!rateLimitResult.allowed) {
  return createRateLimitResponse(rateLimitResult.retryAfter!);
}
```

### Rate Limit Response

When rate limit is exceeded, clients receive:

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

**HTTP Status:** 429 Too Many Requests

**Headers:**
- `Retry-After`: Seconds until limit resets
- `X-RateLimit-Reset`: Unix timestamp of reset time
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Window`: Window duration in seconds

### Identifier Strategy

Rate limits are tracked per:
- **Authenticated Users**: By user ID (more accurate)
- **Anonymous Requests**: By IP address (fallback)

### Security Benefits

- ✅ Prevents API abuse and spam
- ✅ Protects against credential stuffing
- ✅ Reduces costs from excessive AI generation
- ✅ Limits impact of compromised credentials
- ✅ Prevents accidental infinite loops

### Adjusting Limits

Edit `supabase/functions/_shared/rateLimit.ts`:

```typescript
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  admin_action: { maxRequests: 10, windowMs: 60000 },  // Adjust here
  ai_generation: { maxRequests: 3, windowMs: 60000 },
  sync_trigger: { maxRequests: 1, windowMs: 60000 },
  default: { maxRequests: 20, windowMs: 60000 },
};
```

## 3. Server-Side API Keys

### Configuration

All external API keys MUST be configured as Supabase Edge Function secrets:

**Required for Automated Sync:**
- `CRON_SECRET` - Cron job authentication

**Game Data APIs:**
- `TWITCH_CLIENT_ID` - For IGDB game data
- `TWITCH_CLIENT_SECRET` - For IGDB authentication
- `RAWG_API_KEY` - For RAWG game data (fallback)

**Content Enrichment:**
- `YOUTUBE_API_KEY` - For YouTube video sync
- `OPENROUTER_API_KEY` - For AI content generation

**How to Set:**
1. Go to Supabase Dashboard
2. Navigate to **Project Settings** > **Edge Functions** > **Secrets**
3. Add each secret with the key name and value
4. Click **Save**

### Access Pattern

```typescript
// ✅ CORRECT: Server-side only via Deno.env
const apiKey = Deno.env.get('YOUTUBE_API_KEY');

// ❌ WRONG: Never prefix with VITE_
const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
```

### Security Benefits

- ✅ API keys never exposed to client
- ✅ No keys in JavaScript bundles
- ✅ No keys in git repository
- ✅ Centralized secret management
- ✅ Easy rotation without code changes

### Verification

```bash
# Check client bundle doesn't contain secrets
npm run build
grep -r "TWITCH_CLIENT\|RAWG_API\|YOUTUBE_API\|OPENROUTER" dist/
# Should return nothing or only comments

# Verify secrets are server-side
grep -r "Deno.env.get" supabase/functions/
# Should show all API key access
```

### Error Handling

Edge Functions gracefully handle missing API keys:

```typescript
const apiKey = Deno.env.get('YOUTUBE_API_KEY');

if (!apiKey) {
  return createCorsResponse(
    {
      success: false,
      error: 'YouTube API key not configured. Set YOUTUBE_API_KEY in Edge Function secrets.',
    },
    req,
    { status: 400 }
  );
}
```

## 4. Admin Audit Logging

### Overview

All admin actions are automatically logged to the `admin_audit_log` table for security, compliance, and troubleshooting.

### Logged Actions

**Content Operations:**
- `create` - Creating new content
- `update` - Editing existing content
- `delete` - Removing content
- `publish` - Publishing content
- `unpublish` - Unpublishing content
- `approve` - Approving draft content
- `reject` - Rejecting draft content

**System Operations:**
- `sync` - Manual sync triggers
- `ai_generate` - AI content generation

### Audit Log Schema

```sql
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL,          -- Who performed the action
  actor_email text,                      -- Email for convenience
  action text NOT NULL,                  -- Action type
  entity text NOT NULL,                  -- Table name
  entity_id text,                        -- Record ID
  metadata jsonb,                        -- Additional context
  ip_address text,                       -- Request IP
  user_agent text,                       -- Browser/client info
  created_at timestamptz DEFAULT now()   -- When it happened
);
```

### Row Level Security

**Read Access:**
- Only active admins can read audit logs
- All authenticated admins can view all logs

**Write Access:**
- Only service role can insert (via Edge Functions)
- No updates or deletes allowed (immutable trail)

### Usage in Edge Functions

```typescript
import { logContentAction } from '../_shared/audit.ts';

// After successful content creation/update:
await logContentAction(
  req,                      // Request object
  authResult.userId!,       // Admin user ID
  authResult.userEmail,     // Admin email
  'create',                 // Action type
  'blog_posts',             // Entity type
  newPost.id,               // Entity ID
  { title: newPost.title }  // Optional metadata
);
```

### Viewing Audit Logs

**Via SQL:**
```sql
-- Recent admin activity
SELECT * FROM recent_admin_activity;

-- Specific user's actions
SELECT * FROM admin_audit_log
WHERE actor_user_id = 'USER_UUID'
ORDER BY created_at DESC;

-- Actions on specific content
SELECT * FROM admin_audit_log
WHERE entity = 'blog_posts' AND entity_id = 'POST_ID'
ORDER BY created_at DESC;

-- Actions in last 24 hours
SELECT * FROM admin_audit_log
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

**Via Supabase Dashboard:**
1. Go to **Table Editor**
2. Select `admin_audit_log` table
3. Apply filters as needed

### Security Benefits

- ✅ Complete audit trail of admin actions
- ✅ Accountability for content changes
- ✅ Security incident investigation
- ✅ Compliance with audit requirements
- ✅ Troubleshooting content issues
- ✅ Immutable records (no updates/deletes)

### Example Queries

```sql
-- Who published this article?
SELECT actor_email, created_at
FROM admin_audit_log
WHERE entity = 'news_articles'
  AND entity_id = 'ARTICLE_ID'
  AND action = 'publish';

-- How many AI generations this month?
SELECT COUNT(*) as ai_generations
FROM admin_audit_log
WHERE action = 'ai_generate'
  AND created_at >= date_trunc('month', now());

-- Most active admins
SELECT actor_email, COUNT(*) as action_count
FROM admin_audit_log
WHERE created_at > now() - interval '7 days'
GROUP BY actor_email
ORDER BY action_count DESC;

-- Recent deletions
SELECT *
FROM admin_audit_log
WHERE action = 'delete'
ORDER BY created_at DESC
LIMIT 20;
```

## Migration Guide

### Updating Existing Edge Functions

To add full protection to an Edge Function:

#### 1. Update Imports

```typescript
// Before
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // ...
};

// After
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';
import { handleCorsPrelight, createCorsResponse } from '../_shared/cors.ts';
import { checkRateLimit, createRateLimitResponse } from '../_shared/rateLimit.ts';
import { logContentAction } from '../_shared/audit.ts';
```

#### 2. Handle CORS Preflight

```typescript
// Before
if (req.method === 'OPTIONS') {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// After
const corsPreflightResponse = handleCorsPrelight(req);
if (corsPreflightResponse) {
  return corsPreflightResponse;
}
```

#### 3. Add Rate Limiting

```typescript
// After authentication
const authResult = await verifyAdminAuth(req);
if (!authResult.authorized) {
  return createUnauthorizedResponse(req, authResult.error);
}

// Add rate limiting
const rateLimitResult = checkRateLimit(
  req,
  'admin_action',  // or 'ai_generation', 'sync_trigger'
  authResult.userId
);
if (!rateLimitResult.allowed) {
  return createRateLimitResponse(rateLimitResult.retryAfter!);
}
```

#### 4. Replace Response Creation

```typescript
// Before
return new Response(
  JSON.stringify({ success: true, data }),
  {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  }
);

// After
return createCorsResponse({ success: true, data }, req);

// With custom status
return createCorsResponse(
  { success: false, error: 'Not found' },
  req,
  { status: 404 }
);
```

#### 5. Add Audit Logging

```typescript
// After successful mutation
await logContentAction(
  req,
  authResult.userId!,
  authResult.userEmail,
  'create',           // or 'update', 'delete', 'publish', etc.
  'blog_posts',       // entity type
  result.id,          // entity ID
  { title: 'Post Title' }  // optional metadata
);
```

### Example: Complete Protected Function

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';
import { handleCorsPrelight, createCorsResponse } from '../_shared/cors.ts';
import { checkRateLimit, createRateLimitResponse } from '../_shared/rateLimit.ts';
import { logContentAction } from '../_shared/audit.ts';

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  const corsPreflightResponse = handleCorsPrelight(req);
  if (corsPreflightResponse) {
    return corsPreflightResponse;
  }

  // 2. Authenticate
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return createUnauthorizedResponse(req, authResult.error);
  }

  // 3. Rate limit
  const rateLimitResult = checkRateLimit(req, 'admin_action', authResult.userId);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.retryAfter!);
  }

  try {
    // 4. Process request
    const { title, content } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ title, content, status: 'draft' })
      .select()
      .single();

    if (error) {
      return createCorsResponse(
        { success: false, error: error.message },
        req,
        { status: 400 }
      );
    }

    // 5. Log action
    await logContentAction(
      req,
      authResult.userId!,
      authResult.userEmail,
      'create',
      'blog_posts',
      data.id,
      { title }
    );

    // 6. Return response
    return createCorsResponse({ success: true, data }, req);
  } catch (error) {
    return createCorsResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      req,
      { status: 500 }
    );
  }
});
```

## Testing Production Security

### 1. Test CORS Restrictions

```bash
# Should work (if origin is allowed)
curl -i -X POST https://your-project.supabase.co/functions/v1/your-function \
  -H "Origin: https://firestargamingnetwork.com" \
  -H "Authorization: Bearer TOKEN"

# Should fail with 403
curl -i -X POST https://your-project.supabase.co/functions/v1/your-function \
  -H "Origin: https://evil-site.com" \
  -H "Authorization: Bearer TOKEN"
```

### 2. Test Rate Limiting

```bash
# Rapid requests should hit rate limit
for i in {1..15}; do
  curl -X POST https://your-project.supabase.co/functions/v1/generate-ai-content \
    -H "Authorization: Bearer TOKEN" \
    -d '{"type":"blog"}'
  echo "Request $i"
done
# Should see 429 after 3 requests
```

### 3. Test API Key Protection

```bash
# Build project
npm run build

# Search for exposed secrets (should find nothing)
grep -r "TWITCH_CLIENT\|RAWG_API\|YOUTUBE_API\|OPENROUTER" dist/

# Verify server-side access only
grep -r "Deno.env.get" supabase/functions/ | grep "API\|SECRET"
```

### 4. Test Audit Logging

```sql
-- Perform an admin action, then check:
SELECT * FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 1;

-- Verify required fields are populated
SELECT
  CASE
    WHEN actor_user_id IS NULL THEN 'FAIL: Missing actor_user_id'
    WHEN action IS NULL THEN 'FAIL: Missing action'
    WHEN entity IS NULL THEN 'FAIL: Missing entity'
    ELSE 'PASS: Audit log complete'
  END as test_result
FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 1;
```

## Security Checklist

Before deploying to production, verify:

### CORS
- [ ] `ALLOWED_ORIGINS` environment variable is set (or defaults are acceptable)
- [ ] Production domain is included in allowed origins
- [ ] Edge Functions use `handleCorsPrelight` and `createCorsResponse`
- [ ] No wildcard `Access-Control-Allow-Origin: *` remains
- [ ] Preflight OPTIONS requests return correct CORS headers

### Rate Limiting
- [ ] All sensitive endpoints have rate limiting
- [ ] Rate limits are appropriate for expected usage
- [ ] 429 responses include `Retry-After` headers
- [ ] Rate limiting works per-user and per-IP

### API Keys
- [ ] All external API keys configured in Edge Function secrets
- [ ] No VITE_ prefixed API keys (except SUPABASE_ANON_KEY)
- [ ] Build output doesn't contain secrets
- [ ] Edge Functions handle missing keys gracefully

### Audit Logging
- [ ] `admin_audit_log` table exists with proper RLS
- [ ] All admin mutations log to audit trail
- [ ] Audit logs are queryable by admins
- [ ] Logs include actor, action, entity, and timestamp

### Database
- [ ] RLS enabled on all content tables
- [ ] Only admins can write content
- [ ] Anonymous users can read published content
- [ ] `app_secrets` table has restrictive RLS

### Authentication
- [ ] CRON_SECRET configured and tested
- [ ] Admin users verified in `admin_users` table
- [ ] JWT authentication works correctly
- [ ] Cron secret authentication works for scheduled jobs

## Monitoring & Maintenance

### Daily Checks
- Review failed authentication attempts in Edge Function logs
- Check rate limit violations
- Monitor API key usage and costs

### Weekly Reviews
- Review audit logs for suspicious activity
- Check for repeated rate limit violations
- Verify all scheduled cron jobs are running

### Monthly Tasks
- Rotate CRON_SECRET
- Review and update allowed origins if needed
- Audit admin user list (remove inactive admins)
- Review API key quotas and costs

### Quarterly Reviews
- Full security audit of RLS policies
- Review and adjust rate limits based on usage
- Update documentation for any security changes
- Test disaster recovery procedures

## Troubleshooting

### CORS Errors

**Problem:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Check `ALLOWED_ORIGINS` environment variable
2. Verify origin is in the allowlist
3. Ensure Edge Function uses `handleCorsPrelight` and `createCorsResponse`

### Rate Limit Issues

**Problem:** Users hitting rate limits during normal usage

**Solution:**
1. Review rate limit configuration in `rateLimit.ts`
2. Increase limits if appropriate
3. Consider implementing user-based quotas
4. Add rate limit status to UI

### Audit Log Gaps

**Problem:** Some actions not appearing in audit logs

**Solution:**
1. Verify Edge Function calls `logContentAction`
2. Check for errors in Edge Function logs
3. Ensure service role permissions are correct
4. Verify audit log table exists and RLS is correct

### Missing API Keys

**Problem:** Edge Functions failing with "API key not configured"

**Solution:**
1. Go to Project Settings > Edge Functions > Secrets
2. Add missing secret with correct key name
3. Restart or redeploy Edge Functions
4. Test with curl or admin panel

## Related Documentation

- **[CRON_SECURITY.md](./CRON_SECURITY.md)** - CRON_SECRET setup and rotation
- **[EDGE_FUNCTION_SECURITY.md](./EDGE_FUNCTION_SECURITY.md)** - Edge function auth overview
- **[AUTOMATED_SYNC_GUIDE.md](./AUTOMATED_SYNC_GUIDE.md)** - Automated content syncing
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin user configuration

## Support

For security issues or questions:
1. Check Edge Function logs in Supabase Dashboard
2. Review database logs and audit trail
3. Verify environment variables and secrets
4. Test with curl commands
5. Review this documentation

---

**Last Updated:** 2026-01-01
**Version:** 1.0
**Security Level:** Production Hardened ✅
