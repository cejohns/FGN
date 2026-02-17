-- ============================================
-- COMPLETE ADMIN FIX - ONE-STOP SOLUTION
-- ============================================
-- This script will:
-- 1. Check if user exists in auth.users
-- 2. Check if admin record exists
-- 3. Create or update everything needed
-- 4. Ensure account is active
-- 5. Verify RLS policies are correct
-- ============================================

DO $$
DECLARE
  target_email text := 'cejohns3@gmail.com';  -- CHANGE THIS
  new_password text := 'NewPassword123!';     -- CHANGE THIS
  display_name text := 'Admin User';          -- CHANGE THIS

  auth_user_id uuid;
  admin_record_exists boolean;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting Admin Account Fix...';
  RAISE NOTICE 'Email: %', target_email;
  RAISE NOTICE '========================================';

  -- Step 1: Check if auth user exists
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = target_email;

  IF auth_user_id IS NOT NULL THEN
    RAISE NOTICE '✓ Found existing auth user: %', auth_user_id;

    -- Update password
    UPDATE auth.users
    SET
      encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW(),
      email_confirmed_at = NOW(),
      last_sign_in_at = NOW()
    WHERE id = auth_user_id;

    RAISE NOTICE '✓ Password updated';
  ELSE
    RAISE NOTICE '⚠ No auth user found, creating new one...';

    -- Create new auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      target_email,
      crypt(new_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', display_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO auth_user_id;

    RAISE NOTICE '✓ Created new auth user: %', auth_user_id;
  END IF;

  -- Step 2: Check if admin record exists
  SELECT EXISTS(
    SELECT 1 FROM admin_users WHERE id = auth_user_id
  ) INTO admin_record_exists;

  IF admin_record_exists THEN
    RAISE NOTICE '✓ Found existing admin record';

    -- Update admin record to ensure it's active
    UPDATE admin_users
    SET
      is_active = true,
      role = 'super_admin',
      email = target_email,
      full_name = display_name,
      updated_at = NOW()
    WHERE id = auth_user_id;

    RAISE NOTICE '✓ Admin record updated and activated';
  ELSE
    RAISE NOTICE '⚠ No admin record found, creating one...';

    -- Create new admin record
    INSERT INTO admin_users (
      id,
      email,
      full_name,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      auth_user_id,
      target_email,
      display_name,
      'super_admin',
      true,
      NOW(),
      NOW()
    );

    RAISE NOTICE '✓ Admin record created';
  END IF;

  -- Step 3: Verify the setup
  DECLARE
    final_check RECORD;
  BEGIN
    SELECT
      au.id,
      au.email,
      au.email_confirmed_at IS NOT NULL as email_confirmed,
      ad.full_name,
      ad.role,
      ad.is_active
    INTO final_check
    FROM auth.users au
    LEFT JOIN admin_users ad ON au.id = ad.id
    WHERE au.email = target_email;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'User ID: %', final_check.id;
    RAISE NOTICE 'Email: %', final_check.email;
    RAISE NOTICE 'Email Confirmed: %', final_check.email_confirmed;
    RAISE NOTICE 'Full Name: %', final_check.full_name;
    RAISE NOTICE 'Role: %', final_check.role;
    RAISE NOTICE 'Active: %', final_check.is_active;
    RAISE NOTICE '========================================';

    IF final_check.is_active AND final_check.email_confirmed THEN
      RAISE NOTICE '✅ SUCCESS! You can now log in at /admin';
      RAISE NOTICE 'Email: %', target_email;
      RAISE NOTICE 'Password: (the one you set above)';
    ELSE
      RAISE NOTICE '⚠ WARNING: Setup completed but account may have issues';
    END IF;
  END;

END $$;

-- Also verify RLS policies are correct
DO $$
BEGIN
  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'admin_users'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '⚠ WARNING: RLS not enabled on admin_users table';
  ELSE
    RAISE NOTICE '✓ RLS is enabled on admin_users';
  END IF;

  -- Count policies
  DECLARE
    policy_count int;
  BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_users';

    RAISE NOTICE '✓ Found % RLS policies on admin_users', policy_count;
  END;
END $$;
