# IGDB Data Ingestion & Sync Guide

This guide explains how to populate your Supabase database with IGDB game data using server-side sync jobs.

## Overview

Two edge functions pull IGDB data and upsert it into Supabase tables:

1. **sync-igdb-games** - Fetches top-rated recent games and stores them in `public.games`
2. **sync-igdb-releases** - Fetches upcoming releases and stores them in `public.game_releases`

## Edge Functions

### 1. sync-igdb-games

**Location:** `supabase/functions/sync-igdb-games/index.ts`

**Purpose:** Fetches high-rated games from the past 6 months from IGDB and upserts them into the `games` table.

**Query Criteria:**
- Release date: Last 6 months
- Minimum rating: 75/100
- Minimum rating count: 10
- Sorted by: Rating (descending)

**Endpoint:** `POST https://{project-ref}.supabase.co/functions/v1/sync-igdb-games`

**Query Parameters:**
- `limit` (optional): Number of games to fetch (default: 20)

**Example Request:**
```bash
curl -X POST "https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-games?limit=10" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 10 games from IGDB",
  "stats": {
    "fetched": 10,
    "upserted": 10,
    "failed": 0,
    "autoPublish": false
  },
  "executionId": "uuid",
  "duration": "1234ms"
}
```

**Data Stored:**
- `igdb_id` - Unique IGDB game ID
- `name` - Game title
- `slug` - URL-friendly slug
- `summary` - Short description
- `storyline` - Detailed story
- `cover_url` - Full IGDB cover image URL
- `screenshot_urls` - Array of IGDB screenshot URLs
- `first_release_date` - Release date
- `rating` - Rating (0-10 scale, converted from IGDB's 0-100)
- `rating_count` - Number of ratings
- `genres` - Array of genre names
- `platforms` - Array of platform names
- `studios` - Array of developer/publisher names
- `status` - 'draft' or 'published' (based on AUTO_PUBLISH_IGDB env var)
- `is_featured` - false by default
- `published_at` - Timestamp if auto-published

---

### 2. sync-igdb-releases

**Location:** `supabase/functions/sync-igdb-releases/index.ts`

**Purpose:** Fetches upcoming game releases (next 3 months) from IGDB and upserts them into the `game_releases` table.

**Query Criteria:**
- Release date: Now to +3 months
- Must have: Game data and platform data
- Sorted by: Release date (ascending)

**Endpoint:** `POST https://{project-ref}.supabase.co/functions/v1/sync-igdb-releases`

**Query Parameters:**
- `limit` (optional): Number of releases to fetch (default: 50)

**Example Request:**
```bash
curl -X POST "https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-releases?limit=30" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 28 releases from IGDB",
  "stats": {
    "fetched": 30,
    "upserted": 28,
    "failed": 2,
    "autoPublish": false
  },
  "executionId": "uuid",
  "duration": "890ms"
}
```

**Data Stored:**
- `title` - Game title
- `slug` - Generated slug (game-name-platform)
- `release_date` - Release date
- `platform` - Platform name
- `region` - Region name (e.g., "North America", "Europe", "Worldwide")
- `cover_image_url` - Full IGDB cover image URL
- `source` - 'igdb'
- `source_id` - IGDB release date ID
- `source_url` - Link to IGDB game page
- `status` - 'draft' or 'published' (based on AUTO_PUBLISH_IGDB env var)

---

## Authentication

Both endpoints require the `X-Cron-Secret` header for authentication.

```bash
-H "X-Cron-Secret: YOUR_CRON_SECRET"
```

**Setting the CRON_SECRET:**
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add environment variable: `CRON_SECRET`
3. Set a strong random value (e.g., generated UUID or random string)

**Security Note:** These endpoints are protected with `verify_jwt: false` and use cron secret authentication instead. This allows automated jobs to call them without user authentication.

---

## Environment Variables

### Required Variables

These are automatically available in Supabase Edge Functions:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin database access

### Required for IGDB

Must be configured in Supabase Dashboard → Project Settings → Edge Functions:

- `IGDB_CLIENT_ID` or `TWITCH_CLIENT_ID` - Your IGDB/Twitch Client ID
- `IGDB_CLIENT_SECRET` or `TWITCH_CLIENT_SECRET` - Your IGDB/Twitch Client Secret

To get IGDB credentials:
1. Go to https://dev.twitch.tv/console/apps
2. Register your application
3. Get Client ID and Client Secret
4. Add them as Supabase environment variables

### Optional Variables

- `AUTO_PUBLISH_IGDB` - Set to `"true"` to automatically publish ingested content (default: false)
  - When false: Content is marked as 'draft' (requires manual admin approval)
  - When true: Content is automatically marked as 'published' and visible to anon users

**Recommendation:** Keep `AUTO_PUBLISH_IGDB=false` in production so you can review and approve content before it goes live.

---

## Image URLs

All image URLs are pre-built and stored as full CDN URLs using IGDB's image service:

**Cover Images:**
```
https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg
```

**Screenshots:**
```
https://images.igdb.com/igdb/image/upload/t_screenshot_big/{image_id}.jpg
```

Images are served directly from IGDB's CDN and don't need to be downloaded or hosted separately.

---

## Deployment

### Deploy Functions

The edge functions are already created in your project. To deploy them to Supabase:

**Option 1: Supabase Dashboard**
1. Go to Edge Functions in your Supabase Dashboard
2. Create new functions or update existing ones
3. Upload the function code from:
   - `supabase/functions/sync-igdb-games/`
   - `supabase/functions/sync-igdb-releases/`
4. Include all dependencies from `supabase/functions/_shared/`

**Option 2: Supabase CLI** (if available)
```bash
supabase functions deploy sync-igdb-games
supabase functions deploy sync-igdb-releases
```

---

## Manual Testing

### Test sync-igdb-games

```bash
curl -X POST "https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-games?limit=5" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- 5 games inserted/updated in `public.games` table
- Status: 'draft' (unless AUTO_PUBLISH_IGDB=true)
- Console logs execution details
- Cron execution logged in `cron_execution_log` table

### Test sync-igdb-releases

```bash
curl -X POST "https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-releases?limit=10" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Up to 10 upcoming releases inserted/updated in `public.game_releases` table
- Status: 'draft' (unless AUTO_PUBLISH_IGDB=true)
- Console logs execution details
- Cron execution logged in `cron_execution_log` table

### Verify Data in Database

```sql
-- Check games
SELECT id, igdb_id, name, status, cover_url,
       array_length(screenshot_urls, 1) as screenshot_count,
       rating, first_release_date
FROM games
WHERE igdb_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check releases
SELECT id, title, slug, release_date, platform, region, status, source
FROM game_releases
WHERE source = 'igdb'
ORDER BY release_date ASC
LIMIT 10;
```

### Verify Images

Check that image URLs are valid:

```sql
-- Sample cover URL
SELECT name, cover_url
FROM games
WHERE cover_url IS NOT NULL
LIMIT 1;
```

Example cover URL format:
```
https://images.igdb.com/igdb/image/upload/t_cover_big/co1234.jpg
```

You can open these URLs directly in a browser to verify they work.

---

## Scheduling (Optional)

To automate data syncing, you can set up cron jobs using:

### Option 1: Supabase Cron (pg_cron)

Create PostgreSQL cron jobs that call the edge functions:

```sql
-- Sync games daily at 2 AM
SELECT cron.schedule(
  'sync-igdb-games-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-games?limit=20',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', current_setting('app.cron_secret')
    )
  );
  $$
);

-- Sync releases daily at 3 AM
SELECT cron.schedule(
  'sync-igdb-releases-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-releases?limit=50',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', current_setting('app.cron_secret')
    )
  );
  $$
);
```

### Option 2: External Cron Service

Use services like cron-job.org, GitHub Actions, or your own server to make HTTP requests to the endpoints on a schedule.

**GitHub Actions Example:**

```.github/workflows/sync-igdb.yml
name: Sync IGDB Data

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync-games:
    runs-on: ubuntu-latest
    steps:
      - name: Sync IGDB Games
        run: |
          curl -X POST "https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-games?limit=20" \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"

  sync-releases:
    runs-on: ubuntu-latest
    steps:
      - name: Sync IGDB Releases
        run: |
          curl -X POST "https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/sync-igdb-releases?limit=50" \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"
```

---

## Monitoring

### Cron Execution Log

All sync job executions are logged to the `cron_execution_log` table:

```sql
SELECT
  function_name,
  execution_status,
  records_processed,
  duration_ms,
  error_message,
  started_at,
  completed_at
FROM cron_execution_log
WHERE function_name IN ('sync-igdb-games', 'sync-igdb-releases')
ORDER BY started_at DESC
LIMIT 20;
```

### Check Latest Sync

```sql
-- Latest game sync
SELECT
  function_name,
  execution_status,
  records_processed,
  duration_ms,
  completed_at
FROM cron_execution_log
WHERE function_name = 'sync-igdb-games'
ORDER BY completed_at DESC
LIMIT 1;

-- Latest release sync
SELECT
  function_name,
  execution_status,
  records_processed,
  duration_ms,
  completed_at
FROM cron_execution_log
WHERE function_name = 'sync-igdb-releases'
ORDER BY completed_at DESC
LIMIT 1;
```

---

## Publishing Content

By default, ingested content has `status = 'draft'` and is not visible to anon users.

### Manual Publishing (Recommended)

Use the Admin Panel to review and publish content:

1. Log in as admin
2. Navigate to content management
3. Review draft games/releases
4. Click "Publish" to make them visible

### SQL Publishing

```sql
-- Publish specific game
UPDATE games
SET status = 'published', published_at = now()
WHERE igdb_id = 12345;

-- Publish all draft games
UPDATE games
SET status = 'published', published_at = now()
WHERE status = 'draft' AND igdb_id IS NOT NULL;

-- Publish specific release
UPDATE game_releases
SET status = 'published'
WHERE slug = 'game-slug-playstation-5';

-- Publish all draft releases
UPDATE game_releases
SET status = 'published'
WHERE status = 'draft' AND source = 'igdb';
```

### Bulk Publishing with Criteria

```sql
-- Publish only high-rated games
UPDATE games
SET status = 'published', published_at = now()
WHERE status = 'draft'
  AND igdb_id IS NOT NULL
  AND rating >= 8.0;

-- Publish releases for next month
UPDATE game_releases
SET status = 'published'
WHERE status = 'draft'
  AND source = 'igdb'
  AND release_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 month';
```

---

## Troubleshooting

### Error: "IGDB/Twitch credentials not configured"

**Solution:** Add IGDB credentials to Supabase environment variables:
1. Go to Dashboard → Project Settings → Edge Functions
2. Add `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`
3. Restart the edge function

### Error: "CRON_SECRET is not configured"

**Solution:** Add CRON_SECRET to Supabase environment variables:
1. Go to Dashboard → Project Settings → Edge Functions
2. Add `CRON_SECRET` with a strong random value
3. Use this value in your X-Cron-Secret header

### Error: "Missing X-Cron-Secret header"

**Solution:** Add the header to your request:
```bash
-H "X-Cron-Secret: YOUR_CRON_SECRET"
```

### No Data Returned

**Possible Causes:**
1. No games/releases match the query criteria
2. IGDB API rate limit reached
3. Network issues

**Check logs:**
```sql
SELECT error_message, metadata
FROM cron_execution_log
WHERE function_name = 'sync-igdb-games'
  AND execution_status = 'failed'
ORDER BY started_at DESC
LIMIT 5;
```

### Duplicate Key Violations

If you see duplicate key errors, the upsert logic should handle them automatically using:
- Games: `onConflict: 'igdb_id'`
- Releases: `onConflict: 'slug'`

If issues persist, check for data integrity issues in your database.

---

## Rate Limiting

IGDB API has rate limits:
- 4 requests per second
- Bursts allowed

The sync jobs are designed to handle rate limiting gracefully:
- Single request per execution
- Configurable limits (smaller batches = fewer rate limit issues)
- Exponential backoff on errors

**Recommendation:** Don't run sync jobs more frequently than once per hour to avoid rate limiting.

---

## Best Practices

1. **Start Small:** Test with `limit=5` first, then increase gradually
2. **Review Before Publishing:** Keep AUTO_PUBLISH_IGDB=false in production
3. **Monitor Logs:** Check cron_execution_log regularly for errors
4. **Schedule Wisely:** Run syncs during off-peak hours (2-4 AM)
5. **Verify Images:** Spot-check that image URLs are working
6. **Clean Old Data:** Periodically remove outdated draft content
7. **Backup Database:** Before bulk operations, backup your database

---

## Next Steps

1. Deploy the edge functions to Supabase
2. Configure environment variables (IGDB credentials, CRON_SECRET)
3. Test manually with curl commands
4. Verify data appears in database
5. Set up automated scheduling (optional)
6. Review and publish content via Admin Panel

---

## Support

If you encounter issues:
1. Check the cron_execution_log table for error details
2. Verify all environment variables are set correctly
3. Test IGDB API access independently
4. Review Supabase Edge Function logs in the dashboard

For IGDB API documentation, visit: https://api-docs.igdb.com/
