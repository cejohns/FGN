-- ============================================
-- RESET ADMIN PASSWORD OR CREATE NEW ADMIN
-- ============================================
-- Run this in your Supabase SQL Editor
-- Instructions:
-- 1. Edit the email and password below
-- 2. Copy and paste this entire script into SQL Editor
-- 3. Click "Run" or press Ctrl+Enter
-- ============================================

DO $$
DECLARE
  target_email text := 'cejohns3@gmail.com';  -- CHANGE THIS to your email
  new_password text := 'NewPassword123!';     -- CHANGE THIS to your new password
  full_name text := 'Admin User';             -- CHANGE THIS if creating new user
  existing_user_id uuid;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = target_email;

  IF existing_user_id IS NOT NULL THEN
    -- User exists, update password
    UPDATE auth.users
    SET
      encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW(),
      email_confirmed_at = NOW()
    WHERE email = target_email;

    -- Make sure admin_users record exists and is active
    INSERT INTO admin_users (id, email, full_name, role, is_active)
    VALUES (existing_user_id, target_email, full_name, 'super_admin', true)
    ON CONFLICT (email)
    DO UPDATE SET
      is_active = true,
      role = 'super_admin';

    RAISE NOTICE '✓ Password updated successfully!';
    RAISE NOTICE 'Email: %', target_email;
    RAISE NOTICE 'You can now log in with your new password';

  ELSE
    -- User doesn't exist, create new one
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
      jsonb_build_object('full_name', full_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO existing_user_id;

    -- Create admin_users record
    INSERT INTO admin_users (id, email, full_name, role, is_active)
    VALUES (existing_user_id, target_email, full_name, 'super_admin', true);

    RAISE NOTICE '✓ New admin user created successfully!';
    RAISE NOTICE 'Email: %', target_email;
    RAISE NOTICE 'You can now log in with your credentials';
  END IF;

END $$;
