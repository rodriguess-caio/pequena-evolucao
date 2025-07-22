-- Migration 006: Simplificação de Permissões
-- Remove complexidades e garante que o básico funcione

-- Drop all existing policies and recreate them
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON profiles;

-- Create a simple policy that allows authenticated users to access their own profile
CREATE POLICY "profiles_policy" ON profiles
FOR ALL USING (auth.uid() = id);

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON usuario TO authenticated;

-- Create a simple function to get user profile
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;

-- Ensure the trigger exists for automatic profile creation
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

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a simple function to create profile if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN
    -- Create profile
    INSERT INTO profiles (id, name, email)
    VALUES (
      auth.uid(),
      'Usuário',
      (SELECT email FROM auth.users WHERE id = auth.uid())
    );
    
    -- Create usuario entry
    INSERT INTO usuario (id, nome, email)
    VALUES (
      auth.uid(),
      'Usuário',
      (SELECT email FROM auth.users WHERE id = auth.uid())
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_user_profile() TO authenticated; 