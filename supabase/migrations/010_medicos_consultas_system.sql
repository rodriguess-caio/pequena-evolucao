-- Migration 010: Sistema de Médicos e Consultas
-- Implementando gestão de médicos e agendamento de consultas

-- Drop existing tables if they exist
DROP TABLE IF EXISTS consulta CASCADE;
DROP TABLE IF EXISTS medico CASCADE;

-- Create medico table with proper structure
CREATE TABLE IF NOT EXISTS medico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  crm TEXT,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consulta table with proper structure
CREATE TABLE IF NOT EXISTS consulta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bebe_id UUID NOT NULL REFERENCES bebe(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES medico(id) ON DELETE CASCADE,
  data_consulta DATE NOT NULL,
  hora_consulta TIME NOT NULL,
  local TEXT NOT NULL,
  anotacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada', 'remarcada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medico_user_id ON medico(user_id);
CREATE INDEX IF NOT EXISTS idx_medico_nome ON medico(nome);
CREATE INDEX IF NOT EXISTS idx_medico_especialidade ON medico(especialidade);

CREATE INDEX IF NOT EXISTS idx_consulta_user_id ON consulta(user_id);
CREATE INDEX IF NOT EXISTS idx_consulta_bebe_id ON consulta(bebe_id);
CREATE INDEX IF NOT EXISTS idx_consulta_medico_id ON consulta(medico_id);
CREATE INDEX IF NOT EXISTS idx_consulta_data ON consulta(data_consulta);
CREATE INDEX IF NOT EXISTS idx_consulta_status ON consulta(status);

-- Enable RLS on medico table
ALTER TABLE medico ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medico table
DROP POLICY IF EXISTS "medico_policy" ON medico;
CREATE POLICY "medico_policy" ON medico
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on consulta table
ALTER TABLE consulta ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for consulta table
DROP POLICY IF EXISTS "consulta_policy" ON consulta;
CREATE POLICY "consulta_policy" ON consulta
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON medico TO authenticated;
GRANT ALL ON consulta TO authenticated;

-- Create function to update updated_at column for medico
CREATE OR REPLACE FUNCTION update_medico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for medico updated_at
DROP TRIGGER IF EXISTS update_medico_updated_at_trigger ON medico;
CREATE TRIGGER update_medico_updated_at_trigger 
  BEFORE UPDATE ON medico 
  FOR EACH ROW 
  EXECUTE FUNCTION update_medico_updated_at();

-- Create function to update updated_at column for consulta
CREATE OR REPLACE FUNCTION update_consulta_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for consulta updated_at
DROP TRIGGER IF EXISTS update_consulta_updated_at_trigger ON consulta;
CREATE TRIGGER update_consulta_updated_at_trigger 
  BEFORE UPDATE ON consulta 
  FOR EACH ROW 
  EXECUTE FUNCTION update_consulta_updated_at();

-- Create view for consultas with joined data
CREATE OR REPLACE VIEW consultas_detalhadas AS
SELECT 
  c.id,
  c.user_id,
  c.bebe_id,
  c.medico_id,
  c.data_consulta,
  c.hora_consulta,
  c.local,
  c.anotacoes,
  c.status,
  c.created_at,
  c.updated_at,
  b.nome as bebe_nome,
  m.nome as medico_nome,
  m.especialidade as medico_especialidade,
  m.telefone as medico_telefone
FROM consulta c
JOIN bebe b ON c.bebe_id = b.id
JOIN medico m ON c.medico_id = m.id
WHERE c.user_id = auth.uid();

-- Grant permissions on view
GRANT SELECT ON consultas_detalhadas TO authenticated; 