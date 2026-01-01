# CRON_SECRET Security Guide

Complete guide to securing automated cron jobs with secret-based authentication.

## Overview

All automated edge functions (cron jobs) now require a `CRON_SECRET` passed via the `X-Cron-Secret` header. This prevents unauthorized execution of automated tasks while allowing legitimate scheduled jobs to run.

## Architecture

### Two-Layer Security

1. **Edge Function Layer**: Functions check for `X-Cron-Secret` header
2. **Database Layer**: Cron triggers fetch secret from `app_secrets` table and include it in HTTP calls

### Flow Diagram

```
pg_cron scheduler
    ↓ (calls SQL function)
SQL Function (trigger_*)
    ↓ (reads from app_secrets table)
Gets CRON_SECRET
    ↓ (makes HTTP request with X-Cron-Secret header)
Edge Function
    ↓ (validates header matches CRON_SECRET env var)
Executes if valid
```

## Setup Instructions

### Step 1: Generate a Strong Secret

Generate a cryptographically secure random secret:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example output**: `k8JmN9pL2qR5sT7vX0yZ3aB6cD9fG2hJ4kM7nP0qS5tU8wY1zA4bC7eF0gH3i`

### Step 2: Configure Edge Functions Secret

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** > **Edge Functions**
3. Under "Secrets", add a new secret:
   - **Key**: `CRON_SECRET`
   - **Value**: Your generated secret (from Step 1)
4. Click **Save**

⚠️ **IMPORTANT**: This secret is **server-side only**. Never prefix it with `VITE_` or expose it to the client.

### Step 3: Store Secret in Database

The database needs the same secret to pass in HTTP calls to edge functions.

Connect to your Supabase SQL Editor and run:

```sql
-- Insert the CRON_SECRET (replace YOUR_SECRET_HERE with your actual secret)
INSERT INTO public.app_secrets (key, value, description)
VALUES (
  'cron_secret',
  'YOUR_SECRET_HERE',  -- Use the same secret from Step 2
  'Secret for authenticating scheduled cron jobs to edge functions'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();
```

### Step 4: Verify Configuration

Check that the secret is stored correctly:

```sql
-- This should return 1 row (postgres role only)
SELECT key, description, created_at, updated_at
FROM public.app_secrets
WHERE key = 'cron_secret';
```

## Security Model

### Edge Functions Authentication

Edge functions use the shared helper at `supabase/functions/_shared/auth.ts`:

- **Admin Users**: JWT token + `admin_users` table verification
- **Cron Jobs**: `X-Cron-Secret` header validation

### Protected Functions

All write-capable functions support both authentication methods:

**Sync Functions:**
- `sync-game-releases`
- `sync-platform-news`
- `sync-youtube-news`

**Update Functions:**
- `update-game-images`
- `generate-ai-content`

**Data Functions:**
- `seed-demo-releases`
- All `fetch-*` functions

### Access Control Matrix

| Caller Type | Admin JWT | X-Cron-Secret | Result |
|-------------|-----------|---------------|--------|
| Anonymous | ❌ | ❌ | 403 Forbidden |
| Logged-in User | ❌ | ❌ | 403 Forbidden |
| Admin User | ✅ | ❌ | ✅ Authorized |
| Admin User | ❌ | ✅ | ✅ Authorized |
| Cron Job | ❌ | ✅ | ✅ Authorized |
| Invalid Secret | ❌ | ❌ | 401 Unauthorized |

## Scheduled Jobs

### Current Schedule

| Job Name | Schedule | Function | Description |
|----------|----------|----------|-------------|
| `daily-game-releases-sync` | `0 3 * * *` | `trigger_game_release_sync()` | Syncs game releases daily at 3 AM UTC |
| `sync-platform-news-6h` | `0 */6 * * *` | `trigger_platform_news_sync()` | Syncs platform RSS feeds every 6 hours |
| `sync-youtube-news-12h` | `30 */12 * * *` | `trigger_youtube_news_sync()` | Syncs YouTube videos every 12 hours |
| `update-game-images-weekly` | `0 4 * * 0` | `trigger_game_images_update()` | Updates images weekly on Sunday at 4 AM UTC |

### View Active Jobs

```sql
-- Query the scheduled_jobs view
SELECT * FROM public.scheduled_jobs;
```

### Manually Trigger a Job

```sql
-- Trigger game release sync manually
SELECT public.trigger_game_release_sync();

-- Trigger platform news sync manually
SELECT public.trigger_platform_news_sync();

-- Trigger YouTube news sync manually
SELECT public.trigger_youtube_news_sync();

-- Trigger game images update manually
SELECT public.trigger_game_images_update();
```

## Testing & Verification

### Test 1: Call Without Secret (Should Fail)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/sync-game-releases \
  -H "Content-Type: application/json"

# Expected: 401 Unauthorized
# {"success":false,"error":"Missing X-Cron-Secret header..."}
```

### Test 2: Call With Invalid Secret (Should Fail)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/sync-game-releases \
  -H "Content-Type: application/json" \
  -H "X-Cron-Secret: wrong-secret"

# Expected: 401 Unauthorized
# {"success":false,"error":"Invalid X-Cron-Secret..."}
```

### Test 3: Call With Valid Secret (Should Succeed)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/sync-game-releases \
  -H "Content-Type: application/json" \
  -H "X-Cron-Secret: YOUR_SECRET_HERE"

# Expected: 200 OK with sync results
```

### Test 4: Verify Cron Jobs Run Automatically

Check edge function logs in Supabase Dashboard:

1. Go to **Edge Functions** > **Logs**
2. Filter by function name (e.g., `sync-game-releases`)
3. Look for successful automated executions

### Test 5: Check Database Logs

```sql
-- View cron job execution history
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

## Secret Rotation

### When to Rotate

- Every 90 days (recommended)
- If secret is compromised
- After team member with access leaves
- As part of security audit

### How to Rotate

1. Generate new secret (see Step 1 in Setup)

2. Update Edge Functions secret:
   - Go to Project Settings > Edge Functions
   - Update `CRON_SECRET` value
   - Save

3. Update database secret:
   ```sql
   UPDATE public.app_secrets
   SET value = 'NEW_SECRET_HERE', updated_at = now()
   WHERE key = 'cron_secret';
   ```

4. Verify rotation:
   ```bash
   # Test with new secret
   curl -X POST https://your-project.supabase.co/functions/v1/sync-game-releases \
     -H "Content-Type: application/json" \
     -H "X-Cron-Secret: NEW_SECRET_HERE"
   ```

5. Monitor cron jobs for 24 hours to ensure they continue running

### Rotation Checklist

- [ ] Generate new secret
- [ ] Update Edge Functions environment variable
- [ ] Update database `app_secrets` table
- [ ] Test manual curl request with new secret
- [ ] Verify scheduled jobs run successfully
- [ ] Document rotation date
- [ ] Securely destroy old secret

## Troubleshooting

### Problem: Cron jobs not running

**Check 1**: Verify secret is configured in both places

```sql
-- Database side
SELECT key FROM public.app_secrets WHERE key = 'cron_secret';
```

Edge Functions side: Check Project Settings > Edge Functions > Secrets

**Check 2**: View job execution status

```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

**Check 3**: Check for error messages

```sql
SELECT return_message, start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Problem: 401 Unauthorized when calling function manually

- Verify you're using the correct secret
- Check there are no extra spaces or newlines in the secret
- Ensure the header name is exactly `X-Cron-Secret` (case-sensitive)

### Problem: 500 Internal Server Error

```
"CRON_SECRET is not configured on the server"
```

The `CRON_SECRET` environment variable is not set in Edge Functions:
1. Go to Project Settings > Edge Functions
2. Add secret with key `CRON_SECRET`
3. Redeploy or wait for next function invocation

### Problem: Admin authentication no longer works

Admin authentication via JWT should still work! The auth helper supports **both** methods:
- Admins can call functions with their JWT token
- Cron jobs can call functions with the secret header

If admin auth fails, check:
```sql
-- Verify user is in admin_users table
SELECT id, email, is_active FROM admin_users WHERE email = 'admin@example.com';
```

## Security Best Practices

### ✅ DO

- Use a cryptographically secure random generator
- Store secret in Supabase environment variables (never in code)
- Rotate secret every 90 days
- Use different secrets for dev/staging/production
- Limit database access to `app_secrets` table (already configured via RLS)
- Monitor failed authentication attempts in logs

### ❌ DON'T

- Hard-code the secret in your code
- Commit the secret to git
- Share the secret in chat/email
- Use the same secret across multiple projects
- Prefix with `VITE_` (this exposes it to the client!)
- Store in client-side storage or JavaScript

## API Reference

### Edge Function Authentication

```typescript
// In edge functions: supabase/functions/_shared/auth.ts
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

// Verifies either admin JWT OR X-Cron-Secret
const authResult = await verifyAdminAuth(req);
if (!authResult.authorized) {
  return createUnauthorizedResponse(authResult.error);
}
```

### Cron-Only Authentication

```typescript
// For functions that should ONLY be called by cron (not admins)
import { verifyCronSecret, createCronUnauthorizedResponse } from '../_shared/cronAuth.ts';

const authResult = verifyCronSecret(req);
if (!authResult.authorized) {
  return createCronUnauthorizedResponse(authResult.error);
}
```

### Database Functions

```sql
-- Get the cron secret
SELECT public.get_cron_secret();

-- Manually trigger sync functions
SELECT public.trigger_game_release_sync();
SELECT public.trigger_platform_news_sync();
SELECT public.trigger_youtube_news_sync();
SELECT public.trigger_game_images_update();
```

## Support

For issues or questions:
1. Check Edge Function logs in Supabase Dashboard
2. Review database logs: `SELECT * FROM cron.job_run_details`
3. Verify secret configuration in both Edge Functions and `app_secrets` table
4. Ensure RLS policies allow postgres role to access `app_secrets`

## Related Documentation

- [EDGE_FUNCTION_SECURITY.md](./EDGE_FUNCTION_SECURITY.md) - Edge function authentication overview
- [AUTOMATED_SYNC_GUIDE.md](./AUTOMATED_SYNC_GUIDE.md) - Automated content syncing
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin user configuration
