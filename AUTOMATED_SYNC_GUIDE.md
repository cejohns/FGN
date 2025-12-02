# Automated Daily Game Release Sync

Your FireStar Gaming Network site now automatically refreshes game release information every day at **3:00 AM UTC** (11:00 PM EST / 8:00 PM PST).

## What Gets Synced

The automated system keeps your game release calendar up-to-date by:
- Fetching upcoming game releases for the next 90 days
- Updating game details (title, release date, platforms, developers)
- Refreshing cover images and screenshots
- Adding new releases as they're announced
- Updating existing release information

## How It Works

### Automatic Sync Schedule
- **Frequency**: Once per day
- **Time**: 3:00 AM UTC (11:00 PM EST / 8:00 PM PST)
- **Data Sources**:
  1. IGDB (primary - requires Twitch API credentials)
  2. RAWG (fallback - requires RAWG API key)
  3. Demo data (final fallback if APIs not configured)

### Behind the Scenes
- Uses PostgreSQL's `pg_cron` extension for scheduling
- Calls the `sync-game-releases` edge function automatically
- Runs in the background without any manual intervention
- Logs are available in your Supabase dashboard

## Manual Sync Options

While automatic sync runs daily, you can manually trigger a sync anytime from the Admin Panel:

1. Access the admin panel (press `Ctrl+Shift+A` or click the hidden dot in the footer)
2. Log in with password: `admin123`
3. Scroll to "Sync Game Releases"
4. Click one of the sync buttons:
   - **Load Demo Data** - Quick test with 8 curated games
   - **Sync IGDB** - Real data from IGDB (requires Twitch API credentials)
   - **Sync RAWG** - Real data from RAWG (requires RAWG API key)

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

### View Scheduled Jobs
Check your current sync schedule with this SQL:

```sql
SELECT * FROM public.list_cron_jobs();
```

### Disable Automatic Sync
If you need to temporarily disable the automatic sync:

```sql
SELECT cron.unschedule('daily-game-releases-sync');
```

### Re-enable Automatic Sync
To re-enable after disabling:

```sql
SELECT cron.schedule(
  'daily-game-releases-sync',
  '0 3 * * *',
  'SELECT public.trigger_game_release_sync();'
);
```

### Check Sync Logs
View logs in your Supabase Dashboard:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on "sync-game-releases"
4. View the Logs tab

## API Configuration (Optional)

For the best data quality, configure these API keys in your Supabase project settings:

### IGDB (via Twitch)
1. Create app at https://dev.twitch.tv/console/apps
2. Get your Client ID and Client Secret
3. Add to Supabase secrets:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`

### RAWG (Fallback)
1. Get API key at https://rawg.io/apidocs
2. Add to Supabase secrets:
   - `RAWG_API_KEY`

**Note**: Without API keys, the system will use demo data, which includes 8 curated upcoming games.

## Database Functions

The following helper functions are available:

### `trigger_game_release_sync()`
Manually trigger a sync from SQL:
```sql
SELECT public.trigger_game_release_sync();
```

### `list_cron_jobs()`
View all scheduled jobs:
```sql
SELECT * FROM public.list_cron_jobs();
```

## Technical Details

- **Migration File**: `supabase/migrations/setup_daily_game_release_sync.sql`
- **Edge Function**: `supabase/functions/sync-game-releases/index.ts`
- **Scheduler**: PostgreSQL pg_cron extension
- **HTTP Client**: PostgreSQL pg_net extension
- **Database Table**: `game_releases`

## Support

If you experience issues with the automated sync:
1. Check the Supabase Edge Function logs
2. Verify your API credentials (if using IGDB/RAWG)
3. Try running a manual sync from the Admin Panel
4. Check that the cron job is active: `SELECT * FROM cron.job WHERE jobname = 'daily-game-releases-sync';`
