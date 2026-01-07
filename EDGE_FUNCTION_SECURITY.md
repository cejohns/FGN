# Edge Function Security

All write-capable edge functions have been secured to prevent unauthorized access.

## Security Implementation

### Authentication Methods

Edge functions that can write data now support two authentication methods:

1. **Admin JWT Authentication**: Authenticated users must be in the `admin_users` table with `is_active = true`
2. **Cron Secret**: For scheduled jobs, use the `X-Cron-Secret` header with the value from `CRON_SECRET` environment variable

### Secured Functions

All the following functions require admin authentication:

#### Sync Functions
- `sync-game-releases` - Syncs game release data
- `sync-platform-news` - Syncs platform news from RSS feeds
- `sync-youtube-news` - Syncs YouTube channel videos as news

#### Content Generation
- `generate-ai-content` - Generates AI content drafts

#### Content Updates
- `update-game-images` - Updates game images from IGDB

#### Data Seeding
- `seed-demo-releases` - Seeds demo game releases

#### External Data Fetching
- `fetch-igdb-releases` - Fetches releases from IGDB
- `fetch-rawg-releases` - Fetches releases from RAWG
- `fetch-game-deals` - Fetches game deals
- `fetch-igdb-games` - Fetches game data from IGDB
- `fetch-gaming-news` - Fetches gaming news
- `fetch-steam-content` - Fetches Steam content
- `fetch-twitch-videos` - Fetches Twitch videos
- `fetch-all-gaming-content` - Orchestrates all content fetching

## How to Call Secured Functions

### From Admin Panel (Browser)

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/sync-game-releases`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
});
```

### From Cron Jobs

Set the `CRON_SECRET` environment variable in your Supabase project, then:

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/sync-game-releases \
  -H "X-Cron-Secret: your-secret-here" \
  -H "Content-Type: application/json"
```

### From pg_cron (Internal)

```sql
SELECT cron.schedule(
  'sync-releases-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/sync-game-releases',
    headers := jsonb_build_object(
      'X-Cron-Secret', current_setting('app.cron_secret'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

## Security Validation

### Testing Unauthorized Access

A test file has been created at `test-edge-function-auth.html` to verify all functions reject unauthorized requests.

To test:
1. Update the `SUPABASE_URL` in the test file
2. Open the file in a browser
3. Click "Run Tests"
4. All functions should return 401/403 status codes

### Expected Behavior

- **Without authentication**: Functions return 403 with message "This endpoint requires admin authentication"
- **With non-admin JWT**: Functions return 403 with message "User is not an active administrator"
- **With admin JWT**: Functions execute normally
- **With valid cron secret**: Functions execute normally

## Implementation Details

All secured functions use a shared authentication helper located at:
`supabase/functions/_shared/auth.ts`

This helper provides:
- `verifyAdminAuth(req)` - Validates admin authentication
- `createUnauthorizedResponse(error)` - Creates standardized 403 response

## Database Security

In addition to edge function security, all content tables have Row Level Security (RLS) policies that only allow admin users to INSERT, UPDATE, and DELETE data. This provides defense-in-depth even if an edge function is compromised.

## Important Notes

1. RLS policies are the final line of defense - even with service role keys, functions cannot bypass RLS checks when using the client
2. The cron secret should be rotated regularly and kept secure
3. Admin users can be deactivated in the `admin_users` table without deleting their account
4. All write operations are logged by Supabase for audit purposes
