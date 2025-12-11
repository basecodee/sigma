/*
  # Create User Profiles Table with Role Management

  ## Overview
  This migration sets up the user authentication system with role-based access control.
  It extends Supabase's built-in authentication with custom user profiles.

  ## New Tables
  
  ### `user_profiles`
  - `id` (uuid, primary key) - References auth.users(id)
  - `username` (text, unique, not null) - User's unique username for login
  - `full_name` (text) - User's full name
  - `role` (text, not null) - User role: 'admin' or 'user'
  - `is_active` (boolean, default true) - Account active status
  - `created_at` (timestamptz, default now()) - Profile creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security
  - Enable Row Level Security (RLS) on `user_profiles` table
  - Add policy for authenticated users to read their own profile
  - Add policy for authenticated users to update their own profile (excluding role changes)
  - Add policy for admin users to read all profiles
  - Add policy for admin users to update any profile

  ## Notes
  - This table extends Supabase's auth.users with additional profile information
  - Role field is restricted to 'admin' or 'user' values
  - Username must be unique across all users
  - Profiles are automatically linked to auth.users via foreign key
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Create index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (excluding role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

-- Policy: Admin users can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admin users can insert new profiles
CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admin users can update any profile
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admin users can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
