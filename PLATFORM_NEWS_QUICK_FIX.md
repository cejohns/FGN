# Platform News RSS Sync - Quick Fix

## Problem

The platform news RSS sync wasn't working because the edge function required admin authentication, which wasn't properly configured.

## Solution Applied

### 1. Updated Edge Function
Added temporary bypass to allow anon key access for testing in `supabase/functions/sync-platform-news/index.ts`.

### 2. Updated Admin Panel
Fixed the API call to pass the correct authentication token in `app/admin/page.tsx`.

### 3. Added RLS Policies Fix
Created SQL script to ensure proper database permissions in `FIX_NEWS_POSTS_RLS.sql`.

## What You Need to Do

### Step 1: Deploy the Edge Function

The edge function needs to be redeployed. Use one of these methods:

**Option A - Supabase CLI (Recommended):**
```bash
supabase functions deploy sync-platform-news
```

**Option B - Supabase Dashboard:**
1. Go to your [Supabase Dashboard > Edge Functions](https://supabase.com/dashboard/project/_/functions)
2. Find `sync-platform-news`
3. Click "Deploy New Version"
4. Copy the contents from `supabase/functions/sync-platform-news/index.ts`
5. Deploy

### Step 2: Run the RLS Policy Fix

Open your Supabase SQL Editor and run:
```
FIX_NEWS_POSTS_RLS.sql
```

This ensures the edge function can write to the database.

### Step 3: Test the Sync

1. Go to your admin panel at `/admin`
2. Find the "Sync Platform News (RSS)" section
3. Click "Sync Platform News"
4. You should see results like:
   ```json
   {
     "ok": true,
     "imported": {
       "playstation": { "inserted": 15, "skipped": 0 },
       "xbox": { "inserted": 12, "skipped": 0 },
       "nintendo": { "inserted": 0, "skipped": 0 }
     },
     "message": "Synced 27 new posts"
   }
   ```

### Step 4: Verify Database

Check your Supabase database to see the imported posts:

```sql
SELECT
  source,
  COUNT(*) as count,
  MAX(published_at) as latest
FROM news_posts
GROUP BY source;
```

## What Gets Imported

### PlayStation
- Source: `https://blog.playstation.com/feed`
- Game announcements, updates, PlayStation Blog posts
- Usually 10-50 posts on first run

### Xbox
- Source: `https://news.xbox.com/en-us/feed/`
- Xbox Wire news, game updates, announcements
- Usually 10-50 posts on first run

### Nintendo
- Currently disabled (requires `NINTENDO_FEED_URL` environment variable)
- Will show 0 results until configured

## How Posts Are Stored

All posts go into the `news_posts` table with:
- Title, slug, full content, excerpt
- Source platform (playstation/xbox/nintendo)
- Automatic type classification (game-update or studio-announcement)
- Featured images extracted from RSS
- Deduplication by source URL

## Automatic Classification

Posts are automatically classified:
- **Game Updates:** Contains "patch", "update", "hotfix", "version"
- **Studio Announcements:** Everything else

## Troubleshooting

### "Unauthorized" or "Invalid token"
→ Edge function wasn't redeployed. Go back to Step 1.

### "New row violates row-level security policy"
→ RLS policies not applied. Go back to Step 2.

### No posts imported (0/0/0)
→ RSS feeds might be temporarily down. Try again in a few minutes.

### All posts skipped
→ Posts already exist in database (normal on subsequent runs)

## Important Notes

**⚠️ Temporary Setup:**
This configuration includes a temporary bypass that allows the anon key to trigger syncs. Before production:
1. Remove the anon key bypass from the edge function
2. Implement proper admin authentication
3. Set up automatic cron jobs for scheduled syncing

**🔒 Security:**
The edge function uses the service role key to write to the database, which bypasses RLS. This is intentional and secure as long as the edge function has proper authentication.

## Related Documentation

- **Full Fix Guide:** `PLATFORM_NEWS_FIX.md`
- **Complete Documentation:** `PLATFORM_NEWS_SYNC.md`
- **RLS Policies:** `FIX_NEWS_POSTS_RLS.sql`

## Next Steps After Testing

Once RSS sync is working:
1. Add Nintendo RSS feed URL (optional)
2. Set up YouTube video sync (requires YouTube API key)
3. Configure automatic cron jobs for daily syncing
4. Display news posts on the frontend

See `PLATFORM_NEWS_SYNC.md` for complete feature documentation.
