/*
  # Create Gallery Images Table

  ## Overview
  Creates a table to store gallery images for the gaming website.

  ## 1. New Tables
    - `gallery_images`
      - `id` (uuid, primary key)
      - `title` (text) - Image title
      - `slug` (text, unique) - URL-friendly slug
      - `description` (text) - Image description
      - `image_url` (text) - URL to the image
      - `photographer` (text) - Photographer name
      - `game_title` (text) - Related game title
      - `category` (text) - Image category (screenshot, artwork, cosplay, etc.)
      - `status` (text) - Content status (draft, published, archived)
      - `is_featured` (boolean) - Whether image is featured
      - `published_at` (timestamptz) - Publication timestamp
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - Enable RLS on `gallery_images` table
    - Public read access for published images
    - Admin-only write access
*/

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  image_url text NOT NULL,
  photographer text,
  game_title text,
  category text DEFAULT 'screenshot',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public can read published images
CREATE POLICY "Public can view published gallery images"
  ON gallery_images
  FOR SELECT
  USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can do everything with gallery images"
  ON gallery_images
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_status ON gallery_images(status);
CREATE INDEX IF NOT EXISTS idx_gallery_images_slug ON gallery_images(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_published_at ON gallery_images(published_at);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();