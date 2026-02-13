-- ============================================
-- FIX NEWS_POSTS RLS FOR EDGE FUNCTION
-- ============================================
--
-- The sync-platform-news edge function uses the service role key
-- which should bypass RLS. However, if there are issues, this
-- ensures the policies are correct.
--
-- These policies allow:
-- 1. Public read access (anyone can view posts)
-- 2. Service role write access (edge functions can insert)
-- 3. Anon role write access (temporary, for testing)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read news posts" ON news_posts;
DROP POLICY IF EXISTS "Authenticated users can insert news posts" ON news_posts;
DROP POLICY IF EXISTS "Authenticated users can update news posts" ON news_posts;
DROP POLICY IF EXISTS "Authenticated users can delete news posts" ON news_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon insert news posts" ON news_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon update news posts" ON news_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon delete news posts" ON news_posts;

-- Public read access (anyone can view)
CREATE POLICY "Anyone can read news posts"
  ON news_posts
  FOR SELECT
  TO public
  USING (true);

-- Service role and authenticated users can insert
CREATE POLICY "Service and auth can insert news posts"
  ON news_posts
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Service role and authenticated users can update
CREATE POLICY "Service and auth can update news posts"
  ON news_posts
  FOR UPDATE
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Service role and authenticated users can delete
CREATE POLICY "Service and auth can delete news posts"
  ON news_posts
  FOR DELETE
  TO authenticated, service_role
  USING (true);

-- ⚠️ TEMPORARY: Allow anon role for testing (REMOVE IN PRODUCTION)
CREATE POLICY "TEMP: Allow anon insert news posts"
  ON news_posts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon update news posts"
  ON news_posts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "TEMP: Allow anon delete news posts"
  ON news_posts
  FOR DELETE
  TO anon
  USING (true);

-- Verify policies were created
SELECT
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'news_posts'
ORDER BY cmd, policyname;

-- Test the table is accessible
SELECT COUNT(*) as total_posts FROM news_posts;

-- Show recent posts
SELECT
  id,
  title,
  source,
  platform,
  type,
  published_at,
  auto_generated,
  created_at
FROM news_posts
ORDER BY created_at DESC
LIMIT 5;
