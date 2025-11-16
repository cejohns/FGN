/*
  # Create news_posts table for platform RSS feeds

  1. New Tables
    - `news_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, indexed)
      - `body` (text) - Full HTML/markdown content
      - `excerpt` (text) - Short snippet, max 260 chars
      - `image_url` (text, nullable)
      - `source` (text) - "playstation", "xbox", "nintendo"
      - `source_url` (text, unique) - Original RSS link for deduplication
      - `platform` (text) - "ps", "xbox", "nintendo"
      - `type` (text) - "game-update", "studio-announcement"
      - `published_at` (timestamptz)
      - `auto_generated` (boolean) - true for RSS imports
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `news_posts` table
    - Add policy for public read access to published posts
    - Add policy for authenticated admin insert/update access
*/

CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  body text NOT NULL,
  excerpt text NOT NULL,
  image_url text,
  source text NOT NULL CHECK (source IN ('playstation', 'xbox', 'nintendo')),
  source_url text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('ps', 'xbox', 'nintendo')),
  type text NOT NULL CHECK (type IN ('game-update', 'studio-announcement')),
  published_at timestamptz NOT NULL DEFAULT now(),
  auto_generated boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_posts_slug_idx ON news_posts(slug);
CREATE INDEX IF NOT EXISTS news_posts_source_idx ON news_posts(source);
CREATE INDEX IF NOT EXISTS news_posts_platform_idx ON news_posts(platform);
CREATE INDEX IF NOT EXISTS news_posts_published_at_idx ON news_posts(published_at DESC);

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news posts"
  ON news_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert news posts"
  ON news_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news posts"
  ON news_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete news posts"
  ON news_posts
  FOR DELETE
  TO authenticated
  USING (true);