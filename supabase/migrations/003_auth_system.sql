-- Migration 003: Sistema de Autenticação
-- Seguindo a arquitetura Next.js + Supabase com NextAPI

-- Drop existing auth_users table (if exists) as we'll use Supabase Auth directly
DROP TABLE IF EXISTS auth_users CASCADE;

-- Create profiles table for user profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update usuario table to work with Supabase Auth
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_id_fkey;
ALTER TABLE usuario ADD CONSTRAINT usuario_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  
  -- Insert into usuario table
  INSERT INTO usuario (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table
  UPDATE profiles 
  SET 
    name = COALESCE(NEW.raw_user_meta_data->>'name', OLD.raw_user_meta_data->>'name'),
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- Update usuario table
  UPDATE usuario 
  SET 
    nome = COALESCE(NEW.raw_user_meta_data->>'name', OLD.raw_user_meta_data->>'name'),
    email = NEW.email
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from profiles table
  DELETE FROM profiles WHERE id = OLD.id;
  
  -- Delete from usuario table (cascade will handle related data)
  DELETE FROM usuario WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_deletion();

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
FOR ALL USING (auth.uid() = id);

-- Create function to get current user profile
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

-- Create function to update user profile
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON usuario TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(TEXT, TEXT) TO authenticated;

-- Create view for user data (useful for NextAPI)
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