-- ============================================
-- CREATE YOUR FIRST ADMIN USER
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Replace the email and password below with your own
-- ============================================

DO $$
DECLARE
  new_user_id uuid;
  user_email text := 'cejohns3@gmail.com';  -- CHANGE THIS
  user_password text := 'admin123!';  -- CHANGE THIS
  user_full_name text := 'Admin Cory;  -- CHANGE THIS
BEGIN
  -- Create the auth user
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
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
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

  -- Create the admin user record
  INSERT INTO admin_users (id, email, full_name, role)
  VALUES (new_user_id, user_email, user_full_name, 'super_admin');

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'You can now log in with your credentials';

END $$;
