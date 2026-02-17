-- ============================================
-- FIX BLOG POSTS RLS POLICIES
-- ============================================
--
-- ISSUE: Admin panel cannot insert blog posts because of RLS policies
-- requiring authenticated admin users
--
-- SOLUTION: Add temporary policies for anon role (TESTING ONLY)
--
-- ⚠️ WARNING: These policies allow anyone with the anon key to modify blog posts
-- Remove these policies before going to production and implement proper authentication
-- ============================================

-- Drop existing temp policies if they exist
DROP POLICY IF EXISTS "TEMP: Allow anon insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "TEMP: Allow anon delete blog posts" ON blog_posts;

-- Temporary policy: Allow anon users to insert blog posts (TESTING ONLY)
CREATE POLICY "TEMP: Allow anon insert blog posts"
  ON blog_posts FOR INSERT
  TO anon
  WITH CHECK (true);

-- Temporary policy: Allow anon users to update blog posts (TESTING ONLY)
CREATE POLICY "TEMP: Allow anon update blog posts"
  ON blog_posts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Temporary policy: Allow anon users to delete blog posts (TESTING ONLY)
CREATE POLICY "TEMP: Allow anon delete blog posts"
  ON blog_posts FOR DELETE
  TO anon
  USING (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE tablename = 'blog_posts'
ORDER BY policyname;
