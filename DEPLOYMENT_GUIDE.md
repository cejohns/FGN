# Edge Functions Deployment Guide

This guide covers how to deploy all 17 edge functions to your Supabase project.

## Prerequisites

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```
   This will open a browser window for authentication.

## Method 1: Automated Script (Recommended)

The easiest way to deploy all functions at once:

```bash
./deploy-functions.sh
```

This script will:
- Link to your Supabase project (dyfzxamsobywypoyocwz)
- Deploy all 17 edge functions automatically
- Show a summary of successful and failed deployments

## Method 2: Manual Deployment

If you prefer to deploy functions individually or the script doesn't work:

1. **Link your project** (one-time setup)
   ```bash
   supabase link --project-ref dyfzxamsobywypoyocwz
   ```

2. **Deploy all functions at once**
   ```bash
   supabase functions deploy --no-verify-jwt
   ```

3. **Or deploy individual functions**
   ```bash
   supabase functions deploy query-igdb --no-verify-jwt
   supabase functions deploy sync-platform-news --no-verify-jwt
   supabase functions deploy sync-game-releases --no-verify-jwt
   # ... etc
   ```

## Method 3: Supabase Dashboard

You can also deploy through the web interface:

1. Go to https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/functions
2. Click "Deploy a new function"
3. Upload the function files manually

## Functions List

The following 17 functions will be deployed:

### IGDB Integration
- `query-igdb` - Query IGDB API for game data
- `fetch-igdb-games` - Fetch game details from IGDB
- `fetch-igdb-releases` - Fetch upcoming releases from IGDB
- `sync-igdb-games` - Sync game data to database
- `sync-igdb-releases` - Sync release calendar to database
- `update-game-images` - Update game cover images

### Content Aggregation
- `fetch-all-gaming-content` - Master function to fetch all content
- `fetch-gaming-news` - Fetch gaming news from various sources
- `sync-platform-news` - Sync platform-specific news (PS, Xbox, Nintendo)
- `sync-youtube-news` - Sync YouTube channel videos
- `fetch-twitch-videos` - Fetch Twitch gaming videos

### Game Data
- `fetch-rawg-releases` - Fetch releases from RAWG API
- `fetch-game-deals` - Fetch game deals and discounts
- `sync-game-releases` - Sync release calendar
- `seed-demo-releases` - Seed database with demo data

### Steam Integration
- `fetch-steam-content` - Fetch Steam game data

### AI Content
- `generate-ai-content` - Generate AI-powered content

## Verification

After deployment, verify the functions are working:

```bash
# List all deployed functions
supabase functions list

# Test a function
curl -L -X POST 'https://dyfzxamsobywypoyocwz.supabase.co/functions/v1/query-igdb' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query": "search \"Elden Ring\";"}'
```

## Troubleshooting

### "Not logged in" error
Run `supabase login` and authenticate in the browser.

### "Project not linked" error
Run `supabase link --project-ref dyfzxamsobywypoyocwz`

### Function deployment fails
- Check that the function code has no syntax errors
- Verify all shared dependencies in `_shared/` are correct
- Check the Supabase dashboard logs for detailed error messages

### Permission errors
Make sure your Supabase account has owner or admin access to the project.

## Environment Variables

All required environment variables are automatically available in deployed functions:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Additional secrets (IGDB, Twitch, etc.) should be set through the Supabase dashboard:
https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/settings/vault/secrets

## Next Steps

After deploying functions:

1. **Set up cron jobs** - Configure scheduled tasks in Supabase dashboard
2. **Test each function** - Verify they're working correctly
3. **Monitor logs** - Check function execution logs for errors
4. **Update secrets** - Add any required API keys (IGDB, Twitch, etc.)
