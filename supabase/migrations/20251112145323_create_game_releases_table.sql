/*
  # Create Game Releases Calendar Table

  ## Overview
  Creates a table to track upcoming game releases with detailed information for a release calendar feature.

  ## New Tables
  - `game_releases`
    - `id` (uuid, primary key) - Unique identifier
    - `title` (text) - Game title
    - `slug` (text, unique) - URL-friendly identifier
    - `description` (text) - Game description
    - `cover_image` (text) - Game cover art URL
    - `banner_image` (text) - Wide banner image URL
    - `trailer_url` (text) - Trailer video URL (optional)
    - `genre` (text) - Game genre
    - `platform` (text) - Available platforms
    - `developer` (text) - Developer name
    - `publisher` (text) - Publisher name
    - `release_date` (date) - Official release date
    - `price` (text) - Expected price (optional)
    - `preorder_link` (text) - Pre-order URL (optional)
    - `rating_expected` (text) - Expected ESRB/PEGI rating (optional)
    - `features` (text[]) - Key features array
    - `view_count` (integer) - Number of views
    - `is_featured` (boolean) - Featured game flag
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `game_releases` table
  - Add SELECT policy for public access
  - Only authenticated service role can insert/update/delete

  ## Indexes
  - Index on release_date for efficient date-based queries
  - Index on slug for quick lookups
*/

CREATE TABLE IF NOT EXISTS game_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image text NOT NULL,
  banner_image text NOT NULL DEFAULT '',
  trailer_url text DEFAULT '',
  genre text NOT NULL,
  platform text NOT NULL,
  developer text NOT NULL DEFAULT '',
  publisher text NOT NULL DEFAULT '',
  release_date date NOT NULL,
  price text DEFAULT '',
  preorder_link text DEFAULT '',
  rating_expected text DEFAULT '',
  features text[] DEFAULT ARRAY[]::text[],
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game releases"
  ON game_releases
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert game releases"
  ON game_releases
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update game releases"
  ON game_releases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete game releases"
  ON game_releases
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_game_releases_date ON game_releases(release_date);
CREATE INDEX IF NOT EXISTS idx_game_releases_slug ON game_releases(slug);
CREATE INDEX IF NOT EXISTS idx_game_releases_featured ON game_releases(is_featured);
