/*
  # Add IGDB-backed Content Tables
  
  1. Updates to Existing Tables
    - `games` table: Add screenshot_urls field
  
  2. New Tables
    - `game_releases`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique)
      - `release_date` (date)
      - `platform` (text)
      - `region` (text)
      - `cover_image_url` (text)
      - `source` (text) - e.g., 'igdb', 'rawg'
      - `source_id` (text) - external ID from source
      - `source_url` (text) - link to source
      - `status` (text) - 'draft' or 'published'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `guides`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `content` (text)
      - `cover_image_url` (text)
      - `tags` (text[])
      - `category` (text)
      - `status` (text) - 'draft' or 'published'
      - `is_featured` (boolean)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  3. Security
    - Enable RLS on new tables
    - Add policies for anon users to SELECT only published content
    - Add policies for authenticated admin users (full access handled by existing admin RLS)
*/

-- Add screenshot_urls to games table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'games'
      AND column_name = 'screenshot_urls'
  ) THEN
    ALTER TABLE games ADD COLUMN screenshot_urls text[];
  END IF;
END $$;

-- Create game_releases table
CREATE TABLE IF NOT EXISTS game_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  release_date date,
  platform text,
  region text,
  cover_image_url text,
  source text,
  source_id text,
  source_url text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS game_releases_slug_idx ON game_releases(slug);

-- Create index on release_date for sorting
CREATE INDEX IF NOT EXISTS game_releases_release_date_idx ON game_releases(release_date);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS game_releases_status_idx ON game_releases(status);

-- Enable RLS on game_releases
ALTER TABLE game_releases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access to published releases
CREATE POLICY "public read published releases"
  ON game_releases
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Create guides table
CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  tags text[],
  category text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS guides_slug_idx ON guides(slug);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS guides_status_idx ON guides(status);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS guides_category_idx ON guides(category);

-- Create index on tags for searching
CREATE INDEX IF NOT EXISTS guides_tags_idx ON guides USING GIN(tags);

-- Enable RLS on guides
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access to published guides
CREATE POLICY "public read published guides"
  ON guides
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to game_releases
DROP TRIGGER IF EXISTS update_game_releases_updated_at ON game_releases;
CREATE TRIGGER update_game_releases_updated_at
  BEFORE UPDATE ON game_releases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to guides
DROP TRIGGER IF EXISTS update_guides_updated_at ON guides;
CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to games if not exists
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
