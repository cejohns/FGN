/*
  # FireStarGamingNetwork Database Schema

  ## Overview
  Creates the complete database structure for a gaming news and media website including
  news articles, game reviews, videos, image galleries, and blog/vlog posts.

  ## New Tables

  ### 1. `news_articles`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Article headline
  - `slug` (text, unique) - URL-friendly version of title
  - `excerpt` (text) - Brief summary for listings
  - `content` (text) - Full article content
  - `featured_image` (text) - URL to main article image
  - `category` (text) - News category (e.g., "Breaking", "Industry", "Events")
  - `author` (text) - Author name
  - `published_at` (timestamptz) - Publication date
  - `view_count` (integer) - Number of views
  - `is_featured` (boolean) - Show on homepage
  - `created_at` (timestamptz) - Record creation time

  ### 2. `game_reviews`
  - `id` (uuid, primary key) - Unique identifier
  - `game_title` (text) - Name of the game
  - `slug` (text, unique) - URL-friendly version
  - `game_cover` (text) - Cover image URL
  - `platform` (text) - Gaming platform(s)
  - `genre` (text) - Game genre
  - `developer` (text) - Game developer
  - `publisher` (text) - Game publisher
  - `release_date` (date) - Game release date
  - `rating` (numeric) - Review score (0-10)
  - `excerpt` (text) - Brief review summary
  - `content` (text) - Full review content
  - `reviewer` (text) - Reviewer name
  - `published_at` (timestamptz) - Publication date
  - `view_count` (integer) - Number of views
  - `is_featured` (boolean) - Show on homepage
  - `created_at` (timestamptz) - Record creation time

  ### 3. `videos`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Video title
  - `slug` (text, unique) - URL-friendly version
  - `description` (text) - Video description
  - `video_url` (text) - URL to video or embed code
  - `thumbnail` (text) - Thumbnail image URL
  - `category` (text) - Video category (e.g., "Gameplay", "Review", "News")
  - `duration` (text) - Video length
  - `creator` (text) - Content creator name
  - `published_at` (timestamptz) - Publication date
  - `view_count` (integer) - Number of views
  - `is_featured` (boolean) - Show on homepage
  - `created_at` (timestamptz) - Record creation time

  ### 4. `gallery_images`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Image title
  - `description` (text) - Image description
  - `image_url` (text) - URL to full-size image
  - `thumbnail_url` (text) - URL to thumbnail version
  - `category` (text) - Image category (e.g., "Screenshots", "Concept Art", "Cosplay")
  - `game_title` (text) - Related game (optional)
  - `photographer` (text) - Photographer/artist name
  - `published_at` (timestamptz) - Publication date
  - `view_count` (integer) - Number of views
  - `is_featured` (boolean) - Show on homepage
  - `created_at` (timestamptz) - Record creation time

  ### 5. `blog_posts`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly version
  - `excerpt` (text) - Brief summary
  - `content` (text) - Full post content
  - `featured_image` (text) - Main post image URL
  - `post_type` (text) - "blog" or "vlog"
  - `video_url` (text) - URL for vlog videos (optional)
  - `category` (text) - Post category (e.g., "Opinion", "Tutorial", "Community")
  - `author` (text) - Author name
  - `published_at` (timestamptz) - Publication date
  - `view_count` (integer) - Number of views
  - `is_featured` (boolean) - Show on homepage
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for public read access (no authentication required)
  - Tables are read-only for public users
  - Future: Admin policies can be added for content management

  ## Notes
  1. All tables include view counts for analytics
  2. Featured flags allow editors to highlight content on homepage
  3. Slugs provide SEO-friendly URLs
  4. All content is publicly readable
  5. Content modification requires authentication (to be implemented)
*/

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  featured_image text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  author text NOT NULL,
  published_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create game_reviews table
CREATE TABLE IF NOT EXISTS game_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_title text NOT NULL,
  slug text UNIQUE NOT NULL,
  game_cover text NOT NULL,
  platform text NOT NULL,
  genre text NOT NULL,
  developer text NOT NULL DEFAULT '',
  publisher text NOT NULL DEFAULT '',
  release_date date,
  rating numeric(3,1) CHECK (rating >= 0 AND rating <= 10),
  excerpt text NOT NULL,
  content text NOT NULL,
  reviewer text NOT NULL,
  published_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  thumbnail text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  duration text DEFAULT '',
  creator text NOT NULL,
  published_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  thumbnail_url text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  game_title text DEFAULT '',
  photographer text NOT NULL DEFAULT 'Anonymous',
  published_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  featured_image text NOT NULL,
  post_type text NOT NULL DEFAULT 'blog' CHECK (post_type IN ('blog', 'vlog')),
  video_url text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  author text NOT NULL,
  published_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view published news articles"
  ON news_articles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published game reviews"
  ON game_reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published gallery images"
  ON gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS news_articles_published_at_idx ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS news_articles_is_featured_idx ON news_articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS game_reviews_published_at_idx ON game_reviews(published_at DESC);
CREATE INDEX IF NOT EXISTS game_reviews_rating_idx ON game_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS videos_published_at_idx ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS gallery_images_published_at_idx ON gallery_images(published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_post_type_idx ON blog_posts(post_type);