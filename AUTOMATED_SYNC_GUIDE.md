# Automated Content Sync Guide

Your FireStar Gaming Network site automatically refreshes content from multiple sources throughout the day.

## 🔒 Security Notice

All automated sync functions are now secured with **CRON_SECRET** authentication. This prevents unauthorized execution of sync jobs.

**Required Setup**: You must configure CRON_SECRET before automated syncing will work. See the [Security Configuration](#security-configuration) section below.

📖 **For complete security documentation**, see [CRON_SECURITY.md](./CRON_SECURITY.md)

## What Gets Synced

The automated system syncs multiple content types:

### Game Releases
- **Schedule**: Daily at 3:00 AM UTC
- **Content**: Upcoming releases for next 90 days, cover images, platform info
- **Sources**: IGDB → RAWG → Demo data (with fallback)

### Platform News
- **Schedule**: Every 6 hours
- **Content**: News from PlayStation, Xbox, and Nintendo RSS feeds
- **Sources**: Official platform blogs

### YouTube News
- **Schedule**: Every 12 hours
- **Content**: Gaming videos from official channels
- **Sources**: PlayStation, Xbox, Nintendo YouTube channels

### Game Images
- **Schedule**: Weekly on Sundays at 4:00 AM UTC
- **Content**: High-quality screenshots and artwork
- **Sources**: IGDB API

## How It Works

### Architecture

```
PostgreSQL pg_cron
    ↓
SQL Trigger Functions (with CRON_SECRET)
    ↓
Edge Functions (validate secret)
    ↓
External APIs / Data Processing
    ↓
Database Tables (protected by RLS)
```

### Behind the Scenes
- Uses PostgreSQL's `pg_cron` extension for scheduling
- Edge functions secured with `X-Cron-Secret` header authentication
- Runs in the background without manual intervention
- All writes protected by Row Level Security (RLS)
- Logs available in Supabase dashboard

## Security Configuration

**⚠️ REQUIRED**: Before automated syncing will work, you must set up CRON_SECRET.

### Quick Setup (3 steps)

#### Step 1: Generate a Secret
```bash
# Use any of these methods to generate a secure random secret
openssl rand -base64 32
# OR
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Step 2: Configure Edge Functions
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Under "Secrets", add:
   - **Key**: `CRON_SECRET`
   - **Value**: Your generated secret from Step 1
3. Click Save

#### Step 3: Store in Database
Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO public.app_secrets (key, value, description)
VALUES (
  'cron_secret',
  'YOUR_SECRET_HERE',  -- Same secret from Step 2
  'Secret for authenticating scheduled cron jobs'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();
```

### Verify Setup

```sql
-- Check that secret is stored
SELECT key, description FROM public.app_secrets WHERE key = 'cron_secret';

-- Check scheduled jobs
SELECT * FROM public.scheduled_jobs;
```

📖 **Detailed guide**: See [CRON_SECURITY.md](./CRON_SECURITY.md) for complete setup instructions, rotation procedures, and troubleshooting.

## Manual Sync Options

### Via Admin Panel
You can manually trigger syncs from the Admin Panel with your admin JWT authentication:

1. Log in as an admin user
2. Navigate to the Content Management section
3. Click sync buttons for:
   - Game Releases (IGDB, RAWG, or Demo)
   - Platform News
   - YouTube News
   - Game Images

### Via SQL
You can also trigger syncs directly from the database:

```sql
-- Trigger game release sync
SELECT public.trigger_game_release_sync();

-- Trigger platform news sync
SELECT public.trigger_platform_news_sync();

-- Trigger YouTube news sync
SELECT public.trigger_youtube_news_sync();

-- Trigger game images update
SELECT public.trigger_game_images_update();
```

### Via API (with CRON_SECRET)
For external automation tools:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/sync-game-releases \
  -H "Content-Type: application/json" \
  -H "X-Cron-Secret: YOUR_SECRET_HERE"
```

## Changing the Sync Time

If you want to change when the daily sync runs, you can update the schedule:

### Option 1: Update via SQL (Recommended)
Run this SQL in your Supabase SQL Editor:

```sql
-- Change to 6:00 AM UTC (1:00 AM EST / 10:00 PM PST)
SELECT cron.schedule(
  'daily-game-releases-sync',
  '0 6 * * *',
  'SELECT public.trigger_game_release_sync();'
);
```

### Option 2: Common Schedule Examples

```sql
-- 12:00 AM UTC (7:00 PM EST / 4:00 PM PST previous day)
SELECT cron.schedule('daily-game-releases-sync', '0 0 * * *', 'SELECT public.trigger_game_release_sync();');

-- 9:00 AM UTC (4:00 AM EST / 1:00 AM PST)
SELECT cron.schedule('daily-game-releases-sync', '0 9 * * *', 'SELECT public.trigger_game_release_sync();');

-- 12:00 PM UTC (7:00 AM EST / 4:00 AM PST)
SELECT cron.schedule('daily-game-releases-sync', '0 12 * * *', 'SELECT public.trigger_game_release_sync();');
```

### Cron Format Reference
```
┌────────── minute (0 - 59)
│ ┌──────── hour (0 - 23)
│ │ ┌────── day of month (1 - 31)
│ │ │ ┌──── month (1 - 12)
│ │ │ │ ┌── day of week (0 - 6) (0 = Sunday)
│ │ │ │ │
* * * * *
```

## Monitoring & Troubleshooting

### View All Scheduled Jobs
Check your current sync schedule:

```sql
SELECT * FROM public.scheduled_jobs;
```

This shows all 4 automated jobs:
- `daily-game-releases-sync` - Daily at 3 AM UTC
- `sync-platform-news-6h` - Every 6 hours
- `sync-youtube-news-12h` - Every 12 hours at :30
- `update-game-images-weekly` - Sundays at 4 AM UTC

### View Job Execution History
```sql
SELECT
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### Disable Specific Jobs
Temporarily disable a scheduled job:

```sql
-- Disable game releases sync
SELECT cron.unschedule('daily-game-releases-sync');

-- Disable platform news sync
SELECT cron.unschedule('sync-platform-news-6h');

-- Disable YouTube news sync
SELECT cron.unschedule('sync-youtube-news-12h');

-- Disable images update
SELECT cron.unschedule('update-game-images-weekly');
```

### Re-enable Jobs
To re-enable after disabling:

```sql
-- Re-enable game releases (daily at 3 AM)
SELECT cron.schedule(
  'daily-game-releases-sync',
  '0 3 * * *',
  'SELECT public.trigger_game_release_sync();'
);

-- Re-enable platform news (every 6 hours)
SELECT cron.schedule(
  'sync-platform-news-6h',
  '0 */6 * * *',
  'SELECT public.trigger_platform_news_sync();'
);

-- Re-enable YouTube news (every 12 hours)
SELECT cron.schedule(
  'sync-youtube-news-12h',
  '30 */12 * * *',
  'SELECT public.trigger_youtube_news_sync();'
);

-- Re-enable images (weekly Sundays)
SELECT cron.schedule(
  'update-game-images-weekly',
  '0 4 * * 0',
  'SELECT public.trigger_game_images_update();'
);
```

### Check Edge Function Logs
View logs in your Supabase Dashboard:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select a function (e.g., "sync-game-releases")
4. View the Logs tab

### Common Issues

#### Jobs Not Running
**Problem**: Cron jobs aren't executing automatically

**Solutions**:
1. Verify CRON_SECRET is configured in both places:
   ```sql
   -- Check database
   SELECT key FROM public.app_secrets WHERE key = 'cron_secret';
   ```
   - Also check: Project Settings → Edge Functions → Secrets

2. Check job execution history:
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE status = 'failed'
   ORDER BY start_time DESC;
   ```

#### 401 Unauthorized Errors
**Problem**: Edge functions return 401 when called by cron

**Solution**: CRON_SECRET mismatch. Ensure the secret in Edge Functions matches the one in `app_secrets` table.

```sql
-- Update database secret to match Edge Functions
UPDATE public.app_secrets
SET value = 'YOUR_SECRET_HERE', updated_at = now()
WHERE key = 'cron_secret';
```

#### Jobs Running But No Data Updates
**Problem**: Jobs execute successfully but content doesn't update

**Solution**: Check for API configuration issues

```sql
-- Check recent job results
SELECT return_message FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 5;
```

Common causes:
- Missing API keys (TWITCH_CLIENT_ID, RAWG_API_KEY, etc.)
- API rate limits reached
- Network connectivity issues

📖 **Full troubleshooting guide**: [CRON_SECURITY.md](./CRON_SECURITY.md#troubleshooting)

## API Configuration (Optional)

For the best data quality, configure these API keys in your Supabase project settings (Project Settings → Edge Functions → Secrets):

### Required for Automated Sync
- **CRON_SECRET** - Required for all automated jobs (see [Security Configuration](#security-configuration))

### Game Data APIs (Optional)
- **TWITCH_CLIENT_ID** - For IGDB game data (primary source)
- **TWITCH_CLIENT_SECRET** - For IGDB authentication
- **RAWG_API_KEY** - For RAWG game data (fallback source)

Get credentials:
- IGDB/Twitch: https://dev.twitch.tv/console/apps
- RAWG: https://rawg.io/apidocs

### YouTube Integration (Optional)
- **YOUTUBE_API_KEY** - For syncing gaming news from YouTube channels

Get key: https://console.cloud.google.com/apis/credentials

### Image Updates (Optional)
- **IGDB_CLIENT_ID** - For fetching high-quality game images
- **IGDB_CLIENT_SECRET** - For IGDB API authentication

**Note**: Without API keys, the system will use demo data for game releases.

## Database Functions Reference

### Trigger Functions

```sql
-- Game releases sync (daily)
SELECT public.trigger_game_release_sync();

-- Platform news sync (6 hours)
SELECT public.trigger_platform_news_sync();

-- YouTube news sync (12 hours)
SELECT public.trigger_youtube_news_sync();

-- Game images update (weekly)
SELECT public.trigger_game_images_update();
```

### Utility Functions

```sql
-- Get the cron secret (postgres only)
SELECT public.get_cron_secret();

-- View all scheduled jobs
SELECT * FROM public.scheduled_jobs;
```

## Technical Details

### Migrations
- `20251202142434_setup_daily_game_release_sync.sql` - Initial cron setup
- `20260101210000_configure_cron_secret_authentication.sql` - CRON_SECRET security

### Edge Functions
- `sync-game-releases` - Syncs game release data
- `sync-platform-news` - Syncs platform RSS feeds
- `sync-youtube-news` - Syncs YouTube videos
- `update-game-images` - Updates game imagery

### Security
- Authentication: `_shared/auth.ts` - Admin JWT + CRON_SECRET validation
- Cron-only auth: `_shared/cronAuth.ts` - CRON_SECRET validation only
- Database: RLS policies restrict writes to admins only
- Secret storage: `app_secrets` table (postgres access only)

### Infrastructure
- **Scheduler**: PostgreSQL pg_cron extension
- **HTTP Client**: PostgreSQL pg_net extension
- **Tables**: `game_releases`, `news_posts`, `news_articles`, `blog_posts`, etc.
- **Views**: `scheduled_jobs` - Monitor active cron jobs

## Testing & Verification

### Automated Test Script
Run the verification script to test all security measures:

```bash
# Test without providing secret (tests failure cases only)
SUPABASE_URL=https://your-project.supabase.co ./verify-cron-security.sh

# Test with secret (tests both failure and success cases)
SUPABASE_URL=https://your-project.supabase.co \
CRON_SECRET=your-secret-here \
./verify-cron-security.sh
```

The script tests:
- Calls without authentication return 403
- Calls with invalid secret return 401
- Calls with valid secret are accepted
- CRON_SECRET not exposed in build output

## Related Documentation

- **[CRON_SECURITY.md](./CRON_SECURITY.md)** - Complete CRON_SECRET security guide
- **[EDGE_FUNCTION_SECURITY.md](./EDGE_FUNCTION_SECURITY.md)** - Edge function authentication
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin user configuration
- **[PLATFORM_NEWS_SYNC.md](./PLATFORM_NEWS_SYNC.md)** - Platform news sync details

## Support

If you experience issues:

1. **Check CRON_SECRET configuration**
   ```sql
   SELECT key FROM public.app_secrets WHERE key = 'cron_secret';
   ```
   And verify it's also set in Project Settings → Edge Functions → Secrets

2. **Check job execution status**
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC LIMIT 10;
   ```

3. **View edge function logs**
   - Go to Supabase Dashboard → Edge Functions → Select function → Logs

4. **Run verification script**
   ```bash
   ./verify-cron-security.sh
   ```

5. **Test manually**
   ```sql
   SELECT public.trigger_game_release_sync();
   ```

For detailed troubleshooting, see [CRON_SECURITY.md](./CRON_SECURITY.md#troubleshooting)
