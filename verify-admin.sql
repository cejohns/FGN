-- Run these queries to verify your admin setup

-- 1. Check if admin user exists in admin_users table
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  last_login_at
FROM admin_users
ORDER BY created_at DESC;

-- 2. Check if user exists in auth.users table
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verify the admin functions work
SELECT is_admin() as am_i_admin, is_super_admin() as am_i_super_admin;

-- 4. Check RLS policies on admin_users
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'admin_users';
