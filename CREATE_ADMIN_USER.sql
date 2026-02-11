-- ============================================
-- CREATE ADMIN USER - IMPROVED VERSION
-- ============================================
-- Run this in Supabase SQL Editor
-- This script handles existing users gracefully
-- ============================================

DO $$
DECLARE
  new_user_id uuid;
  existing_user_id uuid;
  user_email text := 'cejohns3@gmail.com';
  user_password text := 'admin123!';
  user_full_name text := 'Admin Cory';
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = user_email;

  -- If user exists, use their ID
  IF existing_user_id IS NOT NULL THEN
    new_user_id := existing_user_id;
    RAISE NOTICE 'User already exists in auth.users with ID: %', new_user_id;
  ELSE
    -- Create new auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
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
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', user_full_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;
    RAISE NOTICE 'Created new auth user with ID: %', new_user_id;
  END IF;

  -- Insert or update admin_users record
  INSERT INTO admin_users (id, email, full_name, role, is_active)
  VALUES (new_user_id, user_email, user_full_name, 'super_admin', true)
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      is_active = true,
      full_name = user_full_name;

  RAISE NOTICE '✓ Admin user setup complete!';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'Password: %', user_password;
  RAISE NOTICE 'You can now log in to the admin panel';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE;
END $$;
