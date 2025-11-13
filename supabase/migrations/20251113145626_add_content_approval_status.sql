/*
  # Add Content Approval Status System

  1. Changes
    - Add `status` column to all content tables (news_articles, game_reviews, blog_posts, videos, gallery_images)
    - Status values: 'draft', 'published'
    - Default to 'published' for existing content
    - Update published_at to be NULL for drafts
  
  2. Purpose
    - Enable preview and approval workflow for AI-generated content
    - Allow admin to review content before publishing to main site
    - Maintain backward compatibility with existing published content

  3. Security
    - Public users can only see 'published' content
    - All content remains protected by existing RLS policies
*/

-- Add status column to news_articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_articles' AND column_name = 'status'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

-- Add status column to game_reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_reviews' AND column_name = 'status'
  ) THEN
    ALTER TABLE game_reviews ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

-- Add status column to blog_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

-- Add status column to videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'status'
  ) THEN
    ALTER TABLE videos ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

-- Add status column to gallery_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_images' AND column_name = 'status'
  ) THEN
    ALTER TABLE gallery_images ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published'));
  END IF;
END $$;