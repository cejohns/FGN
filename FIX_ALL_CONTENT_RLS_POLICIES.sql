-- ============================================
-- FIX ALL CONTENT TABLES RLS POLICIES
-- ============================================
--
-- ISSUE: Admin panel cannot insert/update/delete content because of RLS policies
-- requiring authenticated admin users
--
-- SOLUTION: Add temporary policies for anon role (TESTING ONLY)
--
-- ⚠️ WARNING: These policies allow anyone with the anon key to modify content
-- Remove these policies before going to production and implement proper authentication
-- ============================================

-- ============================================
-- BLOG POSTS
-- ============================================
DROP POLICY IF EXISTS "TEMP: Allow anon insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon delete blog posts" ON blog_posts;

CREATE POLICY "TEMP: Allow anon insert blog posts"
  ON blog_posts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update blog posts"
  ON blog_posts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete blog posts"
  ON blog_posts FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- NEWS ARTICLES
-- ============================================
DROP POLICY IF EXISTS "TEMP: Allow anon insert news articles" ON news_articles;
DROP POLICY IF EXISTS "TEMP: Allow anon update news articles" ON news_articles;
DROP POLICY IF EXISTS "TEMP: Allow anon delete news articles" ON news_articles;

CREATE POLICY "TEMP: Allow anon insert news articles"
  ON news_articles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update news articles"
  ON news_articles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete news articles"
  ON news_articles FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- GAME REVIEWS
-- ============================================
DROP POLICY IF EXISTS "TEMP: Allow anon insert game reviews" ON game_reviews;
DROP POLICY IF EXISTS "TEMP: Allow anon update game reviews" ON game_reviews;
DROP POLICY IF EXISTS "TEMP: Allow anon delete game reviews" ON game_reviews;

CREATE POLICY "TEMP: Allow anon insert game reviews"
  ON game_reviews FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update game reviews"
  ON game_reviews FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete game reviews"
  ON game_reviews FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- GUIDES (TUTORIALS)
-- ============================================
DROP POLICY IF EXISTS "TEMP: Allow anon insert guides" ON guides;
DROP POLICY IF EXISTS "TEMP: Allow anon update guides" ON guides;
DROP POLICY IF EXISTS "TEMP: Allow anon delete guides" ON guides;

CREATE POLICY "TEMP: Allow anon insert guides"
  ON guides FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update guides"
  ON guides FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete guides"
  ON guides FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- VIDEOS
-- ============================================
DROP POLICY IF EXISTS "TEMP: Allow anon insert videos" ON videos;
DROP POLICY IF EXISTS "TEMP: Allow anon update videos" ON videos;
DROP POLICY IF EXISTS "TEMP: Allow anon delete videos" ON videos;

CREATE POLICY "TEMP: Allow anon insert videos"
  ON videos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update videos"
  ON videos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete videos"
  ON videos FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- GALLERY IMAGES
-- ============================================
DROP POLICY IF EXISTS "TEMP: Allow anon insert gallery images" ON gallery_images;
DROP POLICY IF EXISTS "TEMP: Allow anon update gallery images" ON gallery_images;
DROP POLICY IF EXISTS "TEMP: Allow anon delete gallery images" ON gallery_images;

CREATE POLICY "TEMP: Allow anon insert gallery images"
  ON gallery_images FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update gallery images"
  ON gallery_images FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete gallery images"
  ON gallery_images FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- VERIFY POLICIES WERE CREATED
-- ============================================
SELECT
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('blog_posts', 'news_articles', 'game_reviews', 'guides', 'videos', 'gallery_images')
  AND policyname LIKE 'TEMP:%'
ORDER BY tablename, cmd;
