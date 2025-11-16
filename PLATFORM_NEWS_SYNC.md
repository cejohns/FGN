# Platform News RSS Sync Feature

## Overview

The Platform News Sync feature automatically imports official news from PlayStation, Xbox, and Nintendo RSS feeds into a unified `news_posts` table. It includes automatic deduplication, content classification, and image extraction.

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

## Edge Function API

### Endpoint

```
POST /functions/v1/sync-platform-news
```

### Headers

```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

### Response Format

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

## Admin UI Usage

1. Navigate to the Admin Panel
2. Scroll to the "Sync Platform News (RSS)" section
3. Click "Sync Platform News" button
4. View results showing:
   - Number of posts imported per platform
   - Number of duplicate posts skipped
   - Total sync time

## Environment Variables

### Required

None - PlayStation and Xbox feeds work out of the box

### Optional

- `NINTENDO_FEED_URL`: URL to Nintendo's RSS feed
  - If not set, Nintendo sync returns 0 results
  - Recommended: Use a third-party RSS generator for Nintendo news

## RSS Parsing

The Edge Function includes a custom RSS parser that:

1. Fetches XML content from RSS feeds
2. Extracts items using regex patterns
3. Parses CDATA sections correctly
4. Handles multiple RSS formats (content:encoded, description, etc.)
5. Extracts publication dates in ISO format

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

## Example Post Structure

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

### No Nintendo Posts Imported

- Check if `NINTENDO_FEED_URL` environment variable is set
- Verify the RSS feed URL is valid and accessible
- Check Edge Function logs for errors

### Duplicate Posts Not Detected

- Verify `source_url` values are unique
- Check if RSS feed URLs have changed
- Review database unique constraint on `source_url`

### RSS Feed Parsing Errors

- Check RSS feed format compatibility
- Verify feed URLs are accessible
- Review Edge Function logs for parsing errors

## Future Enhancements

- Add scheduling for automatic periodic syncing
- Implement webhook triggers for real-time updates
- Add content filtering and moderation
- Support for additional gaming platforms
- Integration with existing news_articles table
