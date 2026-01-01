/*
  # Secure All Content Tables - Admin Only Write Access

  1. Security Changes
    - Drop all public and authenticated INSERT/UPDATE/DELETE policies
    - Create admin-only write policies for all content tables
    - Ensure only users in admin_users table can write data
    - Keep SELECT policies public for viewing published content

  2. Tables Secured
    - blog_posts: Remove public INSERT policy
    - guides: Remove public INSERT/UPDATE/DELETE policies
    - game_releases: Change authenticated policies to admin-only
    - news_posts: Change authenticated policies to admin-only
    - news_articles: Add admin-only write policies
    - game_reviews: Add admin-only write policies
    - videos: Add admin-only write policies
    - gallery_images: Add admin-only write policies

  3. Admin Check Function
    - Helper function to verify if user is an active admin
*/

-- Create helper function to check if user is an active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- BLOG_POSTS: Remove public INSERT, add admin-only policies
-- ============================================
DROP POLICY IF EXISTS "Allow anyone to insert blog posts" ON blog_posts;

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- GUIDES: Remove public policies, add admin-only
-- ============================================
DROP POLICY IF EXISTS "Service role can insert guides" ON guides;
DROP POLICY IF EXISTS "Service role can update guides" ON guides;
DROP POLICY IF EXISTS "Service role can delete guides" ON guides;

CREATE POLICY "Admins can insert guides"
  ON guides FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update guides"
  ON guides FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete guides"
  ON guides FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- GAME_RELEASES: Change authenticated to admin-only
-- ============================================
DROP POLICY IF EXISTS "Only authenticated users can insert game releases" ON game_releases;
DROP POLICY IF EXISTS "Only authenticated users can update game releases" ON game_releases;
DROP POLICY IF EXISTS "Only authenticated users can delete game releases" ON game_releases;

CREATE POLICY "Admins can insert game releases"
  ON game_releases FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update game releases"
  ON game_releases FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete game releases"
  ON game_releases FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- NEWS_POSTS: Change authenticated to admin-only
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can insert news posts" ON news_posts;
DROP POLICY IF EXISTS "Authenticated users can update news posts" ON news_posts;
DROP POLICY IF EXISTS "Authenticated users can delete news posts" ON news_posts;

CREATE POLICY "Admins can insert news posts"
  ON news_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update news posts"
  ON news_posts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete news posts"
  ON news_posts FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- NEWS_ARTICLES: Add admin-only write policies
-- ============================================
CREATE POLICY "Admins can insert news articles"
  ON news_articles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update news articles"
  ON news_articles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete news articles"
  ON news_articles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- GAME_REVIEWS: Add admin-only write policies
-- ============================================
CREATE POLICY "Admins can insert game reviews"
  ON game_reviews FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update game reviews"
  ON game_reviews FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete game reviews"
  ON game_reviews FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- VIDEOS: Add admin-only write policies
-- ============================================
CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- GALLERY_IMAGES: Add admin-only write policies
-- ============================================
CREATE POLICY "Admins can insert gallery images"
  ON gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update gallery images"
  ON gallery_images FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete gallery images"
  ON gallery_images FOR DELETE
  TO authenticated
  USING (is_admin());
