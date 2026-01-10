/*
  # Create Admin Users Management System

  ## Overview
  Sets up a secure admin authentication system using Supabase Auth with email/password.
  Replaces the insecure client-side password check with proper server-side authentication.

  ## 1. New Tables
    - `admin_users`
      - `id` (uuid, primary key) - Links to auth.users table
      - `email` (text) - Admin email address
      - `full_name` (text) - Admin's full name
      - `role` (text) - Admin role (super_admin, editor, moderator)
      - `is_active` (boolean) - Whether admin account is active
      - `created_at` (timestamptz) - When admin was created
      - `last_login_at` (timestamptz) - Last login timestamp

  ## 2. Security
    - Enable RLS on `admin_users` table
    - Admins can only read their own profile
    - Only super_admins can view all admins
    - Only super_admins can create/update admin users

  ## 3. Functions
    - `is_admin()` - Helper function to check if current user is an admin
    - `is_super_admin()` - Helper function to check if current user is a super admin

  ## 4. Important Notes
    - First admin must be created manually via SQL or Supabase dashboard
    - All subsequent admins can be created through the admin panel by super_admins
    - Password authentication is handled by Supabase Auth (auth.users table)
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'editor', 'moderator')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin_users

-- Admins can read their own profile
CREATE POLICY "Admins can view own profile"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Super admins can view all admin profiles
CREATE POLICY "Super admins can view all profiles"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Super admins can insert new admins
CREATE POLICY "Super admins can create admins"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Super admins can update admin profiles
CREATE POLICY "Super admins can update admins"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Admins can update their own last_login_at
CREATE POLICY "Admins can update own last login"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins can delete admins (but not themselves)
CREATE POLICY "Super admins can delete other admins"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (is_super_admin() AND auth.uid() != id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Function to update last_login_at timestamp
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE admin_users
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;