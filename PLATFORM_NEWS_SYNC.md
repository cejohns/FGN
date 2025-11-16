# Platform News Import System

## Overview

The Platform News Import System automatically imports official content from gaming platforms using two methods:
1. **RSS Feeds**: Blog posts from PlayStation, Xbox, and Nintendo
2. **YouTube API**: Latest videos from official gaming channels

All content is stored in a unified `news_posts` table with automatic deduplication, content classification, and media extraction.

## Database Schema

### `news_posts` Table

```sql
CREATE TABLE news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  body text NOT NULL,
  excerpt text NOT NULL,
  image_url text,
  source text NOT NULL CHECK (source IN ('playstation', 'xbox', 'nintendo')),
  source_url text NOT NULL UNIQUE,  -- Ensures no duplicates
  platform text NOT NULL CHECK (platform IN ('ps', 'xbox', 'nintendo')),
  type text NOT NULL CHECK (type IN ('game-update', 'studio-announcement')),
  published_at timestamptz NOT NULL DEFAULT now(),
  auto_generated boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Features

### 1. RSS Feed Sources

- **PlayStation**: `https://blog.playstation.com/feed`
- **Xbox**: `https://news.xbox.com/en-us/feed/`
- **Nintendo**: Configurable via `NINTENDO_FEED_URL` environment variable

### 2. Automatic Content Processing

- **Title & Slug Generation**: Creates URL-friendly slugs from titles
- **Content Extraction**: Pulls full HTML/markdown content from RSS items
- **Excerpt Creation**: Generates 260-character summaries with HTML stripping
- **Image Detection**: Extracts images from enclosures and media:content tags
- **Type Classification**: Automatically classifies posts as:
  - `game-update`: Contains keywords like "patch", "update", "hotfix", "version"
  - `studio-announcement`: All other announcements

### 3. Deduplication

The system uses `source_url` as a unique constraint to prevent duplicate imports. When syncing:
- If a post with the same URL already exists, it's skipped
- Only new posts are inserted
- Results show both inserted and skipped counts

## Edge Function APIs

### 1. RSS Feed Sync

#### Endpoint

```
POST /functions/v1/sync-platform-news
```

#### Headers

```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

#### Response Format

```json
{
  "ok": true,
  "imported": {
    "playstation": { "inserted": 10, "skipped": 5 },
    "xbox": { "inserted": 8, "skipped": 7 },
    "nintendo": { "inserted": 6, "skipped": 4 }
  },
  "message": "Synced 24 new posts"
}
```

### 2. YouTube Video Sync

#### Endpoint

```
POST /functions/v1/sync-youtube-news
```

#### Headers

```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

#### Request Body (Optional)

```json
{
  "maxResults": 10
}
```

#### Response Format

```json
{
  "ok": true,
  "imported": {
    "playstation": { "inserted": 8, "skipped": 2 },
    "xbox": { "inserted": 7, "skipped": 3 },
    "nintendo": { "inserted": 9, "skipped": 1 }
  },
  "message": "Synced 24 new videos from YouTube channels",
  "totalChannels": 3
}
```

## Admin UI Usage

### RSS Feed Sync

1. Navigate to the Admin Panel
2. Scroll to the "Sync Platform News (RSS)" section
3. Click "Sync Platform News" button
4. View results showing posts imported per platform

### YouTube Video Sync

1. Navigate to the Admin Panel
2. Scroll to the "Sync YouTube Channel News" section
3. Click "Sync YouTube News" button
4. View results showing videos imported per channel

## Environment Variables

### Required for YouTube

- `YOUTUBE_API_KEY`: YouTube Data API v3 key from Google Cloud Console
  - Get your key at: https://console.cloud.google.com/
  - Enable YouTube Data API v3
  - Free tier: 10,000 units/day (50 videos = ~100 units)

### Optional

- `NINTENDO_FEED_URL`: URL to Nintendo's RSS feed
  - If not set, Nintendo RSS sync returns 0 results
  - Recommended: Use a third-party RSS generator for Nintendo news

## Content Processing

### RSS Parsing

The RSS sync Edge Function includes a custom RSS parser that:

1. Fetches XML content from RSS feeds
2. Extracts items using regex patterns
3. Parses CDATA sections correctly
4. Handles multiple RSS formats (content:encoded, description, etc.)
5. Extracts publication dates in ISO format

### YouTube API Integration

The YouTube sync Edge Function:

1. Uses YouTube Data API v3 Search endpoint
2. Fetches latest videos for each configured channel
3. Extracts video metadata (title, description, thumbnails, publish date)
4. Converts video links to news posts with type "studio-announcement"
5. All YouTube posts are automatically classified as studio announcements

#### YouTube Channel Configuration

Channels are configured in `src/config/youtubeChannels.ts`:

```typescript
export const YT_CHANNELS = [
  {
    id: 'UC-2Y8dQb0S6DtpxNgAKoJKA',    // Channel ID from YouTube
    label: 'PlayStation',                // Display name
    platform: 'ps',                      // Platform identifier
  },
  // Add more channels as needed
];
```

To add more channels:
1. Get the channel ID from the YouTube channel URL
2. Add a new entry to the YT_CHANNELS array
3. Specify label and platform

## Security

- **Row Level Security (RLS)**: Enabled on `news_posts` table
- **Public Read Access**: Anyone can view published posts
- **Authenticated Write Access**: Only authenticated users can insert/update
- **JWT Verification**: Edge Function requires valid Supabase JWT

## Data Flow

```
RSS Feed URLs
    ↓
Edge Function (fetch & parse)
    ↓
Transform to NewsPost objects
    ↓
Check for duplicates (source_url)
    ↓
Insert new posts to database
    ↓
Return sync results
```

## Example Post Structures

### RSS Blog Post

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "New Game Update Released",
  "slug": "new-game-update-released",
  "body": "<p>Full HTML content from RSS...</p>",
  "excerpt": "A brief 260-character summary of the post...",
  "image_url": "https://example.com/image.jpg",
  "source": "playstation",
  "source_url": "https://blog.playstation.com/2025/01/15/news",
  "platform": "ps",
  "type": "game-update",
  "published_at": "2025-01-15T10:00:00Z",
  "auto_generated": true
}
```

### YouTube Video Post

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "title": "Exclusive Gameplay Reveal",
  "slug": "exclusive-gameplay-reveal",
  "body": "<div class=\"youtube-video\">\n  <h2>Exclusive Gameplay Reveal</h2>\n  <p>Video description text...</p>\n  <p><a href=\"https://www.youtube.com/watch?v=abc123\" target=\"_blank\">Watch on YouTube</a></p>\n</div>",
  "excerpt": "Check out this exclusive first look at upcoming gameplay...",
  "image_url": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  "source": "xbox",
  "source_url": "https://www.youtube.com/watch?v=abc123",
  "platform": "xbox",
  "type": "studio-announcement",
  "published_at": "2025-01-15T14:30:00Z",
  "auto_generated": true
}
```

## Querying News Posts

### Get All Platform News

```sql
SELECT * FROM news_posts
ORDER BY published_at DESC;
```

### Get PlayStation Only

```sql
SELECT * FROM news_posts
WHERE source = 'playstation'
ORDER BY published_at DESC;
```

### Get Game Updates Only

```sql
SELECT * FROM news_posts
WHERE type = 'game-update'
ORDER BY published_at DESC;
```

## Troubleshooting

### RSS Feed Issues

#### No Nintendo Posts Imported

- Check if `NINTENDO_FEED_URL` environment variable is set
- Verify the RSS feed URL is valid and accessible
- Check Edge Function logs for errors

#### RSS Feed Parsing Errors

- Check RSS feed format compatibility
- Verify feed URLs are accessible
- Review Edge Function logs for parsing errors

### YouTube API Issues

#### YouTube API Key Error

- Verify `YOUTUBE_API_KEY` is set in environment variables
- Check that YouTube Data API v3 is enabled in Google Cloud Console
- Ensure API key has proper permissions

#### Quota Exceeded

- YouTube API has a daily quota of 10,000 units
- Each video search costs ~100 units
- Monitor usage in Google Cloud Console
- Consider reducing `maxResults` parameter

#### No Videos Imported

- Check if channel IDs in `youtubeChannels.ts` are correct
- Verify channels have public videos
- Check Edge Function logs for API errors

### General Issues

#### Duplicate Posts Not Detected

- Verify `source_url` values are unique
- Check if RSS feed URLs have changed
- Ensure YouTube video URLs are consistent
- Review database unique constraint on `source_url`

## Future Enhancements

- Add scheduling for automatic periodic syncing
- Implement webhook triggers for real-time updates
- Add content filtering and moderation
- Support for additional gaming platforms
- Integration with existing news_articles table
