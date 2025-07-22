-- Migration 007: Correção do Trigger de Autenticação
-- Remove o trigger problemático que está causando "Database error granting user"

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function that was causing issues
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simpler function that doesn't cause errors
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the user doesn't already exist in profiles
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO profiles (id, name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
      NEW.email
    );
  END IF;
  
  -- Only insert if the user doesn't already exist in usuario
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE id = NEW.id) THEN
    INSERT INTO usuario (id, nome, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
      NEW.email
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the authentication
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger again with error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure all necessary permissions are granted
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON usuario TO authenticated;

-- Create a simple function to ensure user profile exists
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in ensure_user_profile: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_user_profile() TO authenticated; 