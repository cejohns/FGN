# Database Schema Documentation

This document describes the database schema for the FireStar Gaming Network, including tables for IGDB-backed content and their RLS policies.

## Tables Overview

### Core Content Tables

1. **games** - IGDB game data with full metadata
2. **game_releases** - Upcoming game release calendar
3. **guides** - User guides and tutorials
4. **news_articles** - Gaming news and articles
5. **blog_posts** - Editorial blog content
6. **game_reviews** - Game reviews and ratings
7. **videos** - Video content links

## Detailed Table Schemas

### 1. games

Stores comprehensive game data from IGDB with publication controls.

```sql
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- IGDB Integration
  igdb_id bigint UNIQUE,                    -- IGDB game ID (unique)

  -- Basic Information
  name text NOT NULL,                       -- Game title
  slug text,                                -- URL-friendly slug
  summary text,                             -- Short description
  storyline text,                           -- Detailed story/lore

  -- Media
  cover_url text,                           -- Cover image URL
  screenshot_urls text[],                   -- Array of screenshot URLs

  -- Release & Rating
  first_release_date date,                  -- Initial release date
  rating numeric,                           -- Aggregate rating (0-10)
  rating_count integer,                     -- Number of ratings

  -- Classification
  genres text[],                            -- Array of genre names
  platforms text[],                         -- Array of platform names
  studios text[],                           -- Array of developer/publisher names

  -- Publication Control
  status text NOT NULL DEFAULT 'draft',     -- 'draft' | 'published'
  is_featured boolean DEFAULT false,        -- Featured on homepage
  published_at timestamptz,                 -- Publication timestamp

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX games_slug_idx ON games(slug);
CREATE INDEX games_status_idx ON games(status);
CREATE INDEX games_igdb_id_idx ON games(igdb_id);

-- Trigger
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS Policy:**
```sql
-- Anon users can only SELECT published games
CREATE POLICY "public read published games"
  ON games FOR SELECT TO anon
  USING (status = 'published');
```

---

### 2. game_releases

Upcoming game release calendar with source tracking.

```sql
CREATE TABLE game_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  title text NOT NULL,                      -- Game title
  slug text UNIQUE,                         -- URL-friendly slug
  release_date date,                        -- Release date
  platform text,                            -- Platform name
  region text,                              -- Release region

  -- Media
  cover_image_url text,                     -- Cover image URL

  -- Source Tracking
  source text,                              -- Data source (e.g., 'igdb', 'rawg')
  source_id text,                           -- External ID from source
  source_url text,                          -- Link to source page

  -- Publication Control
  status text NOT NULL DEFAULT 'draft',     -- 'draft' | 'published'

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX game_releases_slug_idx ON game_releases(slug);
CREATE INDEX game_releases_release_date_idx ON game_releases(release_date);
CREATE INDEX game_releases_status_idx ON game_releases(status);

-- Trigger
CREATE TRIGGER update_game_releases_updated_at
  BEFORE UPDATE ON game_releases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS Policy:**
```sql
-- Anon users can only SELECT published releases
CREATE POLICY "public read published releases"
  ON game_releases FOR SELECT TO anon
  USING (status = 'published');
```

---

### 3. guides

Game guides, tutorials, and walkthroughs.

```sql
CREATE TABLE guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  title text NOT NULL,                      -- Guide title
  slug text UNIQUE,                         -- URL-friendly slug
  excerpt text,                             -- Short description
  content text,                             -- Full guide content (Markdown)

  -- Media
  cover_image_url text,                     -- Cover image URL

  -- Classification
  tags text[],                              -- Array of tags
  category text,                            -- Guide category

  -- Publication Control
  status text NOT NULL DEFAULT 'draft',     -- 'draft' | 'published'
  is_featured boolean DEFAULT false,        -- Featured guide
  published_at timestamptz,                 -- Publication timestamp

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX guides_slug_idx ON guides(slug);
CREATE INDEX guides_status_idx ON guides(status);
CREATE INDEX guides_category_idx ON guides(category);
CREATE INDEX guides_tags_idx ON guides USING GIN(tags);

-- Trigger
CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS Policy:**
```sql
-- Anon users can only SELECT published guides
CREATE POLICY "public read published guides"
  ON guides FOR SELECT TO anon
  USING (status = 'published');
```

---

### 4. news_articles

Gaming news and announcements.

```sql
CREATE TABLE news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

### 5. blog_posts

Editorial blog content and opinion pieces.

```sql
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

### 6. game_reviews

Game reviews with scores and ratings.

```sql
CREATE TABLE game_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  score numeric,                            -- Review score
  excerpt text,
  content text,
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

### 7. videos

Video content links and metadata.

```sql
CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  youtube_url text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## Row Level Security (RLS)

All tables have RLS enabled. The standard policy pattern is:

```sql
-- Anon users can only read published content
CREATE POLICY "public read published {table}"
  ON {table} FOR SELECT TO anon
  USING (status = 'published');
```

### RLS Testing

To verify RLS is working correctly:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// This will only return published content
const { data } = await supabase.from('games').select('*');
```

Draft content is completely invisible to anon users and will not be returned in queries.

---

## Status Field

All content tables use a `status` field with two possible values:

- **`draft`** (default) - Content is not visible to public users
- **`published`** - Content is visible to all users

### Publishing Content

To publish content, update the status and set published_at:

```sql
UPDATE games
SET
  status = 'published',
  published_at = now()
WHERE id = 'game-uuid';
```

---

## Featured Content

Tables that support featured content (`is_featured` boolean):

- `games`
- `guides`
- `news_articles`
- `game_reviews`
- `videos`

Featured content can be queried with:

```sql
SELECT * FROM games
WHERE status = 'published' AND is_featured = true
ORDER BY published_at DESC;
```

---

## IGDB Integration

The `games` table is designed to work seamlessly with IGDB data:

### Data Mapping

| IGDB Field | Database Field | Type | Notes |
|------------|---------------|------|-------|
| `id` | `igdb_id` | bigint | Unique IGDB identifier |
| `name` | `name` | text | Game title |
| `slug` | `slug` | text | URL slug |
| `summary` | `summary` | text | Short description |
| `storyline` | `storyline` | text | Detailed story |
| `cover.image_id` | `cover_url` | text | Built with `buildCoverUrl()` |
| `screenshots[].image_id` | `screenshot_urls` | text[] | Built with `buildScreenshotUrl()` |
| `first_release_date` | `first_release_date` | date | Unix timestamp → date |
| `rating` | `rating` | numeric | 0-100 → 0-10 scale |
| `rating_count` | `rating_count` | integer | Number of ratings |
| `genres[].name` | `genres` | text[] | Array of genre names |
| `platforms[].name` | `platforms` | text[] | Array of platform names |
| `involved_companies` | `studios` | text[] | Developers & publishers |

### Image URLs

All IGDB image URLs are pre-built using the image helpers:

```typescript
import { buildCoverUrl, buildScreenshotUrl } from '../_shared/igdbImages.ts';

const game = {
  cover_url: buildCoverUrl(igdbGame.cover?.image_id),
  screenshot_urls: igdbGame.screenshots?.map(s => buildScreenshotUrl(s.image_id))
};
```

---

## Query Examples

### Get All Published Games

```javascript
const { data: games } = await supabase
  .from('games')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false });
```

### Get Featured Games with Filters

```javascript
const { data: games } = await supabase
  .from('games')
  .select('name, slug, cover_url, rating, genres')
  .eq('status', 'published')
  .eq('is_featured', true)
  .gte('rating', 8.0)
  .order('rating', { ascending: false })
  .limit(10);
```

### Get Upcoming Releases

```javascript
const { data: releases } = await supabase
  .from('game_releases')
  .select('*')
  .eq('status', 'published')
  .gte('release_date', new Date().toISOString())
  .order('release_date', { ascending: true })
  .limit(20);
```

### Search Guides by Tags

```javascript
const { data: guides } = await supabase
  .from('guides')
  .select('*')
  .eq('status', 'published')
  .contains('tags', ['tutorial', 'beginner'])
  .order('published_at', { ascending: false });
```

### Get Game by Slug

```javascript
const { data: game } = await supabase
  .from('games')
  .select('*')
  .eq('slug', 'the-legend-of-zelda')
  .eq('status', 'published')
  .maybeSingle();
```

---

## Admin Operations

Admin users bypass RLS policies and can perform all operations. Admins are identified by checking the `admin_users` table.

### Common Admin Operations

```sql
-- Insert new game
INSERT INTO games (igdb_id, name, slug, summary, cover_url, status)
VALUES (12345, 'New Game', 'new-game', 'Description', 'https://...', 'draft');

-- Publish content
UPDATE games SET status = 'published', published_at = now()
WHERE id = 'uuid';

-- Feature content
UPDATE games SET is_featured = true WHERE id = 'uuid';

-- Update content
UPDATE games SET summary = 'New description', updated_at = now()
WHERE id = 'uuid';

-- Delete content
DELETE FROM games WHERE id = 'uuid';
```

---

## Migrations

Database schema is managed through Supabase migrations in `supabase/migrations/`.

### Creating New Migrations

```bash
# Migration files are named with timestamp
# Format: YYYYMMDDHHMMSS_description.sql
```

### Migration Best Practices

1. Always use `IF NOT EXISTS` when creating tables/columns
2. Include comprehensive comments explaining changes
3. Add proper indexes for frequently queried columns
4. Enable RLS and create policies in the same migration
5. Test migrations locally before deploying

---

## Performance Considerations

### Indexes

All tables have indexes on:
- `slug` - For fast lookups by URL
- `status` - For filtering published/draft content
- Additional indexes based on query patterns

### Query Optimization

- Use `.select()` to fetch only needed columns
- Add `.limit()` to prevent fetching too many rows
- Use `.maybeSingle()` when expecting 0 or 1 result
- Filter by `status` first (indexed)
- Consider pagination for large datasets

### Caching

Consider implementing caching for:
- Featured content (changes infrequently)
- Published game lists (cache by genre/platform)
- Guide listings (cache by category)

---

## Security Best Practices

1. **Never disable RLS** - All tables must have RLS enabled
2. **Restrictive by default** - RLS policies should be as restrictive as possible
3. **Test with anon key** - Always verify anon users can only see published content
4. **Audit admin actions** - Track who publishes/modifies content
5. **Validate input** - Use database constraints and application validation
6. **Secure admin endpoints** - Require authentication for write operations

---

## Troubleshooting

### Content Not Visible

1. Check `status` field - must be 'published'
2. Verify RLS is enabled: `SELECT rls_enabled FROM pg_tables WHERE tablename = 'games';`
3. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'games';`
4. Test with anon key, not service role key

### Queries Returning Empty

1. Ensure content exists: `SELECT COUNT(*) FROM games WHERE status = 'published';`
2. Check query filters are correct
3. Verify anon key is being used (not service role)
4. Check for typos in column names

### Performance Issues

1. Add indexes on frequently filtered columns
2. Use `.select()` to limit returned columns
3. Add pagination with `.range()`
4. Consider materialized views for complex queries
