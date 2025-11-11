/*
  # Add INSERT policy for blog_posts table

  1. Changes
    - Add policy to allow anyone to insert blog posts
    - This enables the admin panel to create new blog posts

  2. Security
    - Policy allows public insert for admin functionality
    - In production, consider restricting this to authenticated admin users only
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Allow anyone to insert blog posts'
  ) THEN
    CREATE POLICY "Allow anyone to insert blog posts"
      ON blog_posts
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;
