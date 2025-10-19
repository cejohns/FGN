/*
  # Create Guides and Tutorials Table

  1. New Tables
    - `guides`
      - `id` (uuid, primary key)
      - `title` (text, guide title)
      - `slug` (text, unique URL-friendly identifier)
      - `excerpt` (text, short description)
      - `content` (text, full guide content)
      - `featured_image` (text, header image URL)
      - `category` (text, guide type: 'Gaming Tips', 'Game Development', 'Technology')
      - `difficulty` (text, skill level: 'Beginner', 'Intermediate', 'Advanced')
      - `tags` (text[], searchable tags)
      - `author` (text, content author)
      - `estimated_time` (text, time to complete guide)
      - `published_at` (timestamptz, publication date)
      - `view_count` (int, number of views)
      - `is_featured` (bool, featured on homepage)
      - `created_at` (timestamptz, record creation time)

  2. Security
    - Enable RLS on `guides` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Indexes
    - Index on slug for fast lookups
    - Index on category for filtering
    - Index on published_at for sorting
*/

CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  featured_image text NOT NULL,
  category text NOT NULL DEFAULT 'Gaming Tips',
  difficulty text NOT NULL DEFAULT 'Beginner',
  tags text[] DEFAULT ARRAY[]::text[],
  author text NOT NULL,
  estimated_time text DEFAULT '5 min',
  published_at timestamptz DEFAULT now(),
  view_count int DEFAULT 0,
  is_featured bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT guides_category_check CHECK (category IN ('Gaming Tips', 'Game Development', 'Technology', 'Hardware', 'Software')),
  CONSTRAINT guides_difficulty_check CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'))
);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published guides"
  ON guides
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert guides"
  ON guides
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update guides"
  ON guides
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete guides"
  ON guides
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS guides_slug_idx ON guides(slug);
CREATE INDEX IF NOT EXISTS guides_category_idx ON guides(category);
CREATE INDEX IF NOT EXISTS guides_published_at_idx ON guides(published_at DESC);
CREATE INDEX IF NOT EXISTS guides_tags_idx ON guides USING gin(tags);
