-- Migration 008: Remoção Completa do Trigger Problemático
-- Remove o trigger que está causando "Database error granting user"

-- Drop the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function that was causing issues
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop other triggers that might cause issues
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Drop the functions
DROP FUNCTION IF EXISTS handle_user_update();
DROP FUNCTION IF EXISTS handle_user_deletion();

-- Ensure basic permissions are granted
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON usuario TO authenticated;

-- Create a simple function to get user profile (without auto-creation)
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple function to create profile manually
CREATE OR REPLACE FUNCTION create_user_profile(
  user_name TEXT DEFAULT NULL,
  user_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO profiles (id, name, email)
  VALUES (
    auth.uid(),
    COALESCE(user_name, 'Usuário'),
    COALESCE(user_email, (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(user_name, profiles.name),
    email = COALESCE(user_email, profiles.email),
    updated_at = NOW();
  
  -- Insert into usuario table
  INSERT INTO usuario (id, nome, email)
  VALUES (
    auth.uid(),
    COALESCE(user_name, 'Usuário'),
    COALESCE(user_email, (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = COALESCE(user_name, usuario.nome),
    email = COALESCE(user_email, usuario.email);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(TEXT, TEXT) TO authenticated;

-- Ensure RLS is enabled with simple policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create a simple one
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON profiles;

CREATE POLICY "profiles_access" ON profiles
FOR ALL USING (auth.uid() = id); 