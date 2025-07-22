-- Migration 005: Correção de Permissões e Garantias
-- Garante que todas as permissões estejam corretas e o sistema funcione

-- Ensure profiles table exists and has correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure usuario table has correct foreign key
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_id_fkey;
ALTER TABLE usuario ADD CONSTRAINT usuario_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
FOR ALL USING (auth.uid() = id);

-- Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON usuario TO authenticated;

-- Ensure functions exist and have correct permissions
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

CREATE OR REPLACE FUNCTION update_user_profile(
  new_name TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update profiles table
  UPDATE profiles 
  SET 
    name = COALESCE(new_name, name),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    updated_at = NOW()
  WHERE id = auth.uid();
  
  -- Update usuario table
  UPDATE usuario 
  SET 
    nome = COALESCE(new_name, nome)
  WHERE id = auth.uid();
  
  -- Update auth.users metadata
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{name}',
    to_jsonb(COALESCE(new_name, (SELECT name FROM profiles WHERE id = auth.uid())))
  )
  WHERE id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(TEXT, TEXT) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_usuario_id ON usuario(id);

-- Ensure triggers exist for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into usuario table
  INSERT INTO usuario (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create view for user data
CREATE OR REPLACE VIEW user_data AS
SELECT 
  u.id,
  u.nome,
  u.email,
  u.data_registro,
  p.avatar_url,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM usuario u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_data TO authenticated; 