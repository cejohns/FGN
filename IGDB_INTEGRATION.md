# IGDB Integration Guide

This document explains how the IGDB (Internet Game Database) integration works in the FireStar Gaming Network.

## Architecture Overview

The IGDB integration follows a secure server-side architecture:

```
Frontend (React)
    ↓
IGDBProvider (calls edge function)
    ↓
query-igdb Edge Function (Supabase)
    ↓
igdbClient (with OAuth token caching)
    ↓
IGDB API (api.igdb.com)
```

## Key Components

### Server-Side (Supabase Edge Functions)

#### 1. `_shared/igdbClient.ts`
- Manages OAuth token lifecycle
- Caches access tokens in memory (refreshes when expired)
- Provides `igdbFetch(endpoint, query)` for all IGDB API calls
- Supports both `IGDB_CLIENT_ID/SECRET` and `TWITCH_CLIENT_ID/SECRET`

#### 2. `_shared/igdbImages.ts`
- Helper functions for constructing IGDB image URLs
- Supports multiple image sizes: cover, screenshot, logo, thumbnail
- Provides safe fallbacks when image IDs are missing
- Available functions:
  - `buildCoverUrl(imageId, large?)` - Game covers
  - `buildScreenshotUrl(imageId, size?)` - Screenshots
  - `buildLogoUrl(imageId)` - Game logos
  - `buildThumbnailUrl(imageId)` - Thumbnails
  - `build720pUrl(imageId)` - 720p images
  - `build1080pUrl(imageId)` - 1080p images

#### 3. `query-igdb/index.ts` (Edge Function)
- Public-facing API for frontend to query IGDB
- Supports query types:
  - `featured` - Get highly-rated recent games
  - `upcoming` - Get upcoming game releases
  - `search` - Search games by name
  - `slug` - Get game by slug
  - `id` - Get game by ID
- Returns normalized game data with pre-built image URLs
- No authentication required from frontend

#### 4. `fetch-igdb-games/index.ts` (Edge Function)
- Admin-only function (requires authentication)
- Fetches recent highly-rated games from IGDB
- Populates `game_reviews` and `news_articles` tables
- Used for content curation

#### 5. `fetch-igdb-releases/index.ts` (Edge Function)
- Admin-only function (requires authentication)
- Fetches upcoming game releases
- Populates `game_releases` table
- Supports platform filtering

### Client-Side (React)

#### `src/lib/providers/IGDBProvider.ts`
- Implements `GameProvider` interface
- Calls `query-igdb` edge function
- No direct IGDB API access
- Gracefully handles missing credentials
- Provides methods:
  - `getFeaturedGames(limit?)`
  - `getUpcomingReleases(limit?)`
  - `getGameBySlug(slug)`
  - `getGameById(id)`
  - `searchGames(query, limit?)`

#### `src/lib/providers/ProviderManager.ts`
- Manages multiple game data providers
- Falls back between IGDB and RAWG
- Used throughout the application

## Configuration

### Required Environment Variables (Server-Side Only)

Add these to Supabase Edge Function secrets:

```bash
# Option 1: IGDB-branded credentials
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret

# Option 2: Twitch-branded credentials (alternative)
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

The system will check for `IGDB_*` variables first, then fall back to `TWITCH_*`.

### Getting Credentials

1. Go to https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Fill in:
   - Name: "FireStar Gaming Network" (or your app name)
   - OAuth Redirect URLs: `https://localhost` (required but not used)
   - Category: "Game Integration"
4. Click "Create"
5. Copy the Client ID
6. Click "New Secret" to generate a Client Secret
7. Add both to Supabase Edge Function secrets

### Frontend Configuration

No additional configuration needed. The frontend automatically uses the Supabase URL from environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Token Management

### Automatic Token Caching

The IGDB client automatically manages OAuth tokens:

1. First request fetches a new token from Twitch OAuth
2. Token is cached in memory with expiration time
3. Subsequent requests reuse the cached token
4. Token is automatically refreshed 60 seconds before expiration
5. No manual token management required

### Token Lifecycle

```
Request → Check cache → Token valid?
                        ├─ Yes → Use cached token
                        └─ No  → Fetch new token → Cache → Use token
```

### Cache Invalidation

- Tokens expire after ~60 days (Twitch default)
- Cache is automatically cleared on token expiration
- Edge function restart clears the cache (automatic refresh)
- Manual clearing: Use `clearTokenCache()` (debugging only)

## Image URL Construction

### IGDB Image Format

IGDB uses a specific URL pattern:

```
https://images.igdb.com/igdb/image/upload/t_SIZE/IMAGE_ID.FORMAT
```

### Available Sizes

- `t_cover_small` - Small cover (90x128)
- `t_cover_big` - Large cover (264x374)
- `t_screenshot_med` - Medium screenshot (569x320)
- `t_screenshot_big` - Large screenshot (889x500)
- `t_screenshot_huge` - Huge screenshot (1280x720)
- `t_thumb` - Thumbnail (90x90)
- `t_720p` - 720p (1280x720)
- `t_1080p` - 1080p (1920x1080)
- `t_logo_med` - Medium logo (284x160)

### Example Usage

```typescript
import { buildCoverUrl, buildScreenshotUrl } from '../_shared/igdbImages.ts';

const coverUrl = buildCoverUrl(game.cover?.image_id);
const screenshotUrl = buildScreenshotUrl(game.screenshots[0]?.image_id, 'big');
```

## API Endpoints

### query-igdb Edge Function

```bash
# Get featured games
GET /functions/v1/query-igdb?type=featured&limit=10

# Get upcoming releases
GET /functions/v1/query-igdb?type=upcoming&limit=20

# Search games
GET /functions/v1/query-igdb?type=search&query=zelda&limit=5

# Get game by slug
GET /functions/v1/query-igdb?type=slug&slug=the-legend-of-zelda-breath-of-the-wild

# Get game by ID
GET /functions/v1/query-igdb?type=id&id=12345
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "12345",
    "title": "Game Title",
    "slug": "game-title",
    "description": "Game description...",
    "releaseDate": "2024-03-15",
    "platforms": ["PlayStation 5", "Xbox Series X"],
    "genres": ["Action", "Adventure"],
    "coverImage": "https://images.igdb.com/igdb/image/upload/t_cover_big/xyz.jpg",
    "screenshots": ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/abc.jpg"],
    "rating": 8.5,
    "developer": "Developer Name",
    "publisher": "Publisher Name",
    "website": "https://example.com"
  }
}
```

## Rate Limits

IGDB API limits:
- 4 requests per second
- Shared across all endpoints
- Token caching reduces authentication requests

## Error Handling

The system handles errors gracefully:

1. **Missing Credentials**: Returns 503 with `configured: false`
2. **Invalid Token**: Automatically fetches new token and retries
3. **Rate Limit**: Returns error, frontend retries with backoff
4. **No Results**: Returns empty array/null instead of error
5. **Network Error**: Logs error, returns empty data

## Security

### What's Protected

✅ IGDB Client ID and Secret (server-side only)
✅ OAuth tokens (never exposed to frontend)
✅ Token refresh logic (server-side only)

### What's Public

✅ Game data (publicly available information)
✅ Image URLs (IGDB CDN, publicly accessible)
✅ query-igdb endpoint (no auth required)

## Testing

### Manual Testing

```bash
# Test token acquisition
curl -X POST "https://your-project.supabase.co/functions/v1/query-igdb?type=featured&limit=1"

# Expected: Game data or configuration error
```

### Integration Testing

```typescript
import { providerManager } from './src/lib/providers';

// Test featured games
const games = await providerManager.getFeaturedGames(5);
console.log('Featured games:', games);

// Test search
const results = await providerManager.searchGames('minecraft');
console.log('Search results:', results);
```

## Troubleshooting

### "Credentials not configured" error

1. Check Supabase Edge Function secrets
2. Verify variable names: `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`
3. Redeploy edge functions after adding secrets

### "Failed to get access token" error

1. Verify Twitch credentials are valid
2. Check Twitch app is not suspended
3. Ensure redirect URL is set (even if unused)

### Empty results

1. Check IGDB query syntax
2. Verify date ranges (for releases)
3. Check rate limits (4 req/sec)

### Images not loading

1. Image ID may be missing (fallback is used)
2. Check IGDB CDN status
3. Verify image URL construction

## Future Enhancements

Potential improvements:

1. **Token Persistence**: Store tokens in Supabase for multi-instance deployments
2. **Request Queuing**: Implement queue to respect rate limits
3. **Cache Layer**: Add Redis/Supabase cache for frequent queries
4. **Batch Requests**: Combine multiple queries into single request
5. **Webhook Integration**: Real-time updates for new releases
6. **Analytics**: Track popular games and search queries
