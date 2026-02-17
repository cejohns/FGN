-- ============================================
-- EMERGENCY ADMIN FIX - Run this NOW
-- ============================================
-- This will bypass all RLS and directly create/fix your admin account
-- Copy this entire file and run it in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
  target_email text := 'cejohns3@gmail.com';  -- CHANGE THIS
  new_password text := 'NewPassword123!';     -- CHANGE THIS
  display_name text := 'Admin User';          -- CHANGE THIS

  auth_user_id uuid;
  existing_user_id uuid;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'EMERGENCY ADMIN FIX';
  RAISE NOTICE 'Email: %', target_email;
  RAISE NOTICE '========================================';

  -- Check if user already exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = target_email;

  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'Found existing user: %', existing_user_id;

    -- Delete old admin record if exists
    DELETE FROM admin_users WHERE id = existing_user_id;
    RAISE NOTICE '✓ Cleared old admin record';

    -- Delete auth user
    DELETE FROM auth.users WHERE id = existing_user_id;
    RAISE NOTICE '✓ Cleared old auth user';
  END IF;

  -- Step 1: Create fresh auth user
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

  RAISE NOTICE '✓ Created auth user: %', auth_user_id;

  -- Step 2: Create admin record
  INSERT INTO admin_users (
    id,
    email,
    full_name,
    role,
    is_active,
    created_at,
    last_login_at
  ) VALUES (
    auth_user_id,
    target_email,
    display_name,
    'super_admin',
    true,
    NOW(),
    NOW()
  );

  RAISE NOTICE '✓ Created admin record';

  -- Step 3: Verify the setup
  DECLARE
    verify_record RECORD;
  BEGIN
    SELECT
      au.id,
      au.email,
      au.email_confirmed_at IS NOT NULL as confirmed,
      au.encrypted_password IS NOT NULL as has_password,
      ad.full_name,
      ad.role,
      ad.is_active
    INTO verify_record
    FROM auth.users au
    JOIN admin_users ad ON au.id = ad.id
    WHERE au.email = target_email;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'User ID: %', verify_record.id;
    RAISE NOTICE 'Email: %', verify_record.email;
    RAISE NOTICE 'Email Confirmed: %', verify_record.confirmed;
    RAISE NOTICE 'Has Password: %', verify_record.has_password;
    RAISE NOTICE 'Name: %', verify_record.full_name;
    RAISE NOTICE 'Role: %', verify_record.role;
    RAISE NOTICE 'Active: %', verify_record.is_active;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'LOGIN CREDENTIALS:';
    RAISE NOTICE 'Email: %', target_email;
    RAISE NOTICE 'Password: %', new_password;
    RAISE NOTICE 'URL: /admin';
    RAISE NOTICE '========================================';
  END;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '========================================';
  RAISE NOTICE '❌ ERROR OCCURRED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Error: %', SQLERRM;
  RAISE NOTICE 'Details: %', SQLSTATE;
  RAISE NOTICE '========================================';
END $$;
