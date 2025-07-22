-- Migration 009: Sistema de Bebês
-- Ajustando para trabalhar com profiles e implementando RLS

-- Drop existing bebe table if exists
DROP TABLE IF EXISTS bebe CASCADE;

-- Create bebe table with proper structure
CREATE TABLE IF NOT EXISTS bebe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  tipo_sanguineo TEXT NOT NULL,
  local_nascimento TEXT NOT NULL,
  nome_pai TEXT NOT NULL,
  nome_mae TEXT NOT NULL,
  nome_avo_paterno TEXT,
  nome_avo_materno TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bebe_user_id ON bebe(user_id);
CREATE INDEX IF NOT EXISTS idx_bebe_nome ON bebe(nome);
CREATE INDEX IF NOT EXISTS idx_bebe_data_nascimento ON bebe(data_nascimento);

-- Enable RLS on bebe table
ALTER TABLE bebe ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bebe table
DROP POLICY IF EXISTS "bebe_policy" ON bebe;
CREATE POLICY "bebe_policy" ON bebe
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON bebe TO authenticated;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_bebe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_bebe_updated_at_trigger ON bebe;
CREATE TRIGGER update_bebe_updated_at_trigger 
  BEFORE UPDATE ON bebe 
  FOR EACH ROW 
  EXECUTE FUNCTION update_bebe_updated_at();

-- Create function to get user's bebês
CREATE OR REPLACE FUNCTION get_user_bebes()
RETURNS TABLE (
  id UUID,
  nome TEXT,
  data_nascimento DATE,
  tipo_sanguineo TEXT,
  local_nascimento TEXT,
  nome_pai TEXT,
  nome_mae TEXT,
  nome_avo_paterno TEXT,
  nome_avo_materno TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.nome,
    b.data_nascimento,
    b.tipo_sanguineo,
    b.local_nascimento,
    b.nome_pai,
    b.nome_mae,
    b.nome_avo_paterno,
    b.nome_avo_materno,
    b.created_at,
    b.updated_at
  FROM bebe b
  WHERE b.user_id = auth.uid()
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get specific bebê
CREATE OR REPLACE FUNCTION get_bebe(bebe_id UUID)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  data_nascimento DATE,
  tipo_sanguineo TEXT,
  local_nascimento TEXT,
  nome_pai TEXT,
  nome_mae TEXT,
  nome_avo_paterno TEXT,
  nome_avo_materno TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.nome,
    b.data_nascimento,
    b.tipo_sanguineo,
    b.local_nascimento,
    b.nome_pai,
    b.nome_mae,
    b.nome_avo_paterno,
    b.nome_avo_materno,
    b.created_at,
    b.updated_at
  FROM bebe b
  WHERE b.id = bebe_id AND b.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create bebê
CREATE OR REPLACE FUNCTION create_bebe(
  bebe_nome TEXT,
  bebe_data_nascimento DATE,
  bebe_tipo_sanguineo TEXT,
  bebe_local_nascimento TEXT,
  bebe_nome_pai TEXT,
  bebe_nome_mae TEXT,
  bebe_nome_avo_paterno TEXT DEFAULT NULL,
  bebe_nome_avo_materno TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_bebe_id UUID;
BEGIN
  INSERT INTO bebe (
    user_id,
    nome,
    data_nascimento,
    tipo_sanguineo,
    local_nascimento,
    nome_pai,
    nome_mae,
    nome_avo_paterno,
    nome_avo_materno
  ) VALUES (
    auth.uid(),
    bebe_nome,
    bebe_data_nascimento,
    bebe_tipo_sanguineo,
    bebe_local_nascimento,
    bebe_nome_pai,
    bebe_nome_mae,
    bebe_nome_avo_paterno,
    bebe_nome_avo_materno
  ) RETURNING id INTO new_bebe_id;
  
  RETURN new_bebe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update bebê
CREATE OR REPLACE FUNCTION update_bebe(
  bebe_id UUID,
  bebe_nome TEXT,
  bebe_data_nascimento DATE,
  bebe_tipo_sanguineo TEXT,
  bebe_local_nascimento TEXT,
  bebe_nome_pai TEXT,
  bebe_nome_mae TEXT,
  bebe_nome_avo_paterno TEXT DEFAULT NULL,
  bebe_nome_avo_materno TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bebe SET
    nome = bebe_nome,
    data_nascimento = bebe_data_nascimento,
    tipo_sanguineo = bebe_tipo_sanguineo,
    local_nascimento = bebe_local_nascimento,
    nome_pai = bebe_nome_pai,
    nome_mae = bebe_nome_mae,
    nome_avo_paterno = bebe_nome_avo_paterno,
    nome_avo_materno = bebe_nome_avo_materno,
    updated_at = NOW()
  WHERE id = bebe_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete bebê
CREATE OR REPLACE FUNCTION delete_bebe(bebe_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM bebe 
  WHERE id = bebe_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION get_user_bebes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_bebe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_bebe(TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_bebe(UUID, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_bebe(UUID) TO authenticated; 