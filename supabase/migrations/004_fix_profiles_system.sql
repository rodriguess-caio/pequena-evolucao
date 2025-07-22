-- Migration 004: Correção do Sistema de Perfis
-- Adiciona função create_user_profile e melhora o sistema

-- Create function to create user profile
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_profile(TEXT, TEXT) TO authenticated;

-- Improve get_user_profile function to handle missing profiles
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
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN
    -- Create profile if it doesn't exist
    PERFORM create_user_profile();
  END IF;
  
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

-- Ensure all necessary permissions are granted
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON usuario TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(TEXT, TEXT) TO authenticated;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_usuario_id ON usuario(id); 