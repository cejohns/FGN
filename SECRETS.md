# API Keys and Secrets Configuration

This document outlines the API keys and secrets used by the FireStar Gaming Network platform.

## Required Secrets

### Supabase Configuration
- **SUPABASE_URL** - Your Supabase project URL (automatically configured)
- **SUPABASE_ANON_KEY** - Supabase anonymous key (automatically configured)
- **SUPABASE_SERVICE_ROLE_KEY** - Supabase service role key (automatically configured)

### Cron Job Authentication
- **CRON_SECRET** - Secret key for authenticating scheduled cron jobs
  - Required for automated content fetching
  - Configure in Supabase dashboard under Edge Function secrets
  - Generate using: `openssl rand -base64 32`

## Optional API Keys

### Game Data Providers

#### IGDB (Internet Game Database) - Primary Provider
- **Status**: Optional but recommended
- **Keys needed**: IGDB_CLIENT_ID, IGDB_ACCESS_TOKEN
- **Used for**: Game releases, metadata, cover art, screenshots
- **How to get**:
  1. Register at https://api-docs.igdb.com/
  2. Create an app in Twitch Developer Console
  3. Generate access token
- **Rate limits**: 4 requests per second

#### RAWG Video Games Database - Secondary Provider
- **Status**: Optional fallback
- **Keys needed**: RAWG_API_KEY
- **Used for**: Game releases, metadata (fallback to IGDB)
- **How to get**: Register at https://rawg.io/apidocs
- **Rate limits**: 20,000 requests per month (free tier)

### Content Aggregation

#### Steam API
- **Status**: Optional
- **Keys needed**: STEAM_API_KEY
- **Used for**: Steam-specific content, game deals
- **How to get**: https://steamcommunity.com/dev/apikey
- **Rate limits**: 100,000 calls per day

#### Twitch API
- **Status**: Optional
- **Keys needed**: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
- **Used for**: Gaming videos, live streams
- **How to get**: https://dev.twitch.tv/console/apps
- **Rate limits**: 800 requests per minute

## Deprecated/Disabled APIs

### Giant Bomb API
- **Status**: ⛔ DISABLED (API offline as of 2024)
- **Keys needed**: ~~GIANTBOMB_API_KEY~~
- **Reason**: Giant Bomb API has been shut down
- **Alternative**: Use IGDB or RAWG providers instead
- **Migration**: All Giant Bomb functionality has been removed from the codebase

## Environment Variable Setup

### Local Development (.env)
```bash
# Required
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional - Configure in Supabase Edge Functions
CRON_SECRET=your-cron-secret
IGDB_CLIENT_ID=your-igdb-client-id
IGDB_ACCESS_TOKEN=your-igdb-token
RAWG_API_KEY=your-rawg-key
STEAM_API_KEY=your-steam-key
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-secret
```

### Supabase Edge Functions
Configure secrets in Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add secrets for each API key
3. Secrets are automatically available in edge functions via `Deno.env.get()`

## Security Best Practices

1. **Never commit secrets to git** - Use .env files (already in .gitignore)
2. **Rotate secrets regularly** - Especially after team member changes
3. **Use environment-specific keys** - Different keys for dev/staging/production
4. **Monitor API usage** - Set up alerts for unusual activity
5. **Limit key permissions** - Use read-only keys where possible

## Provider Architecture

The platform uses a provider abstraction pattern to source game data:

- **Primary Provider**: IGDB (recommended)
- **Secondary Provider**: RAWG (optional fallback)
- **Graceful Degradation**: If no providers are configured, the app still functions with cached/manual content

See `src/lib/providers/` for implementation details.

## Troubleshooting

### "Provider not configured" warnings
- Install optional API keys for IGDB or RAWG
- Platform will work with cached content only

### "Missing GIANTBOMB_API_KEY" errors
- This error should no longer appear (removed in latest version)
- If you see this, please report as a bug

### Cron jobs failing
- Verify CRON_SECRET is configured in Supabase
- Check edge function logs for authentication errors
- Ensure cron secret matches between scheduler and edge functions

## Migration Notes

### Removed in Latest Version
- Giant Bomb API integration (API shut down)
- All references to GIANTBOMB_API_KEY
- fetch-giantbomb-content edge function

### Added in Latest Version
- Provider abstraction layer (GameProvider interface)
- IGDB provider stub
- RAWG provider stub
- ProviderManager for multi-provider fallback
