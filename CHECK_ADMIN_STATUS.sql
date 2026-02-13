-- ============================================
-- CHECK ADMIN USER STATUS
-- ============================================
-- Run this to verify your admin account exists and is active
-- Replace the email below with yours
-- ============================================

DO $$
DECLARE
  check_email text := 'cejohns3@gmail.com';  -- CHANGE THIS to your email
  auth_exists boolean;
  admin_exists boolean;
  admin_active boolean;
  admin_role text;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = check_email) INTO auth_exists;

  -- Check if user exists in admin_users
  SELECT EXISTS(SELECT 1 FROM admin_users WHERE email = check_email) INTO admin_exists;

  -- Check if admin is active
  SELECT is_active, role INTO admin_active, admin_role
  FROM admin_users WHERE email = check_email;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin Status Check for: %', check_email;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Auth User Exists: %', CASE WHEN auth_exists THEN '✓ YES' ELSE '✗ NO' END;
  RAISE NOTICE 'Admin Record Exists: %', CASE WHEN admin_exists THEN '✓ YES' ELSE '✗ NO' END;

  IF admin_exists THEN
    RAISE NOTICE 'Admin Active: %', CASE WHEN admin_active THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE 'Admin Role: %', admin_role;
  END IF;

  RAISE NOTICE '========================================';

  IF NOT auth_exists OR NOT admin_exists THEN
    RAISE NOTICE 'ACTION REQUIRED: Run RESET_ADMIN_PASSWORD.sql to create/fix this account';
  ELSIF NOT admin_active THEN
    RAISE NOTICE 'ACTION REQUIRED: Account is inactive. Run RESET_ADMIN_PASSWORD.sql to activate';
  ELSE
    RAISE NOTICE 'Account is ready! You can log in at /admin';
  END IF;

END $$;
