-- Migration 011: Sistema de Dados de Desenvolvimento
-- Adicionando tabelas para acompanhar peso, comprimento e IMC dos bebês

-- Create desenvolvimento table
CREATE TABLE IF NOT EXISTS desenvolvimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bebe_id UUID NOT NULL REFERENCES bebe(id) ON DELETE CASCADE,
  data_medicao DATE NOT NULL,
  idade_meses DECIMAL(5,2) NOT NULL, -- Idade em meses (ex: 2.5 para 2 meses e meio)
  peso_kg DECIMAL(4,2), -- Peso em kg (ex: 3.45)
  comprimento_cm DECIMAL(5,2), -- Comprimento em cm (ex: 52.5)
  imc DECIMAL(4,2), -- IMC calculado (peso / (altura/100)²)
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_desenvolvimento_bebe_id ON desenvolvimento(bebe_id);
CREATE INDEX IF NOT EXISTS idx_desenvolvimento_data_medicao ON desenvolvimento(data_medicao);
CREATE INDEX IF NOT EXISTS idx_desenvolvimento_idade_meses ON desenvolvimento(idade_meses);

-- Enable RLS on desenvolvimento table
ALTER TABLE desenvolvimento ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for desenvolvimento table
CREATE POLICY "desenvolvimento_policy" ON desenvolvimento
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bebe b 
      WHERE b.id = desenvolvimento.bebe_id 
      AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bebe b 
      WHERE b.id = desenvolvimento.bebe_id 
      AND b.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON desenvolvimento TO authenticated;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_desenvolvimento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_desenvolvimento_updated_at_trigger 
  BEFORE UPDATE ON desenvolvimento 
  FOR EACH ROW 
  EXECUTE FUNCTION update_desenvolvimento_updated_at();

-- Create function to calculate IMC automatically
CREATE OR REPLACE FUNCTION calculate_imc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.peso_kg IS NOT NULL AND NEW.comprimento_cm IS NOT NULL THEN
        NEW.imc = NEW.peso_kg / POWER((NEW.comprimento_cm / 100), 2);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to calculate IMC
CREATE TRIGGER calculate_imc_trigger 
  BEFORE INSERT OR UPDATE ON desenvolvimento 
  FOR EACH ROW 
  EXECUTE FUNCTION calculate_imc();

-- Create function to get desenvolvimento data for a bebê
CREATE OR REPLACE FUNCTION get_desenvolvimento_bebe(bebe_id_param UUID)
RETURNS TABLE (
  id UUID,
  data_medicao DATE,
  idade_meses DECIMAL(5,2),
  peso_kg DECIMAL(4,2),
  comprimento_cm DECIMAL(5,2),
  imc DECIMAL(4,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.data_medicao,
    d.idade_meses,
    d.peso_kg,
    d.comprimento_cm,
    d.imc,
    d.observacoes,
    d.created_at
  FROM desenvolvimento d
  WHERE d.bebe_id = bebe_id_param
  ORDER BY d.data_medicao ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get desenvolvimento data by age range
CREATE OR REPLACE FUNCTION get_desenvolvimento_by_age_range(
  bebe_id_param UUID,
  min_age_months DECIMAL(5,2),
  max_age_months DECIMAL(5,2)
)
RETURNS TABLE (
  id UUID,
  data_medicao DATE,
  idade_meses DECIMAL(5,2),
  peso_kg DECIMAL(4,2),
  comprimento_cm DECIMAL(5,2),
  imc DECIMAL(4,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.data_medicao,
    d.idade_meses,
    d.peso_kg,
    d.comprimento_cm,
    d.imc,
    d.observacoes,
    d.created_at
  FROM desenvolvimento d
  WHERE d.bebe_id = bebe_id_param
    AND d.idade_meses >= min_age_months
    AND d.idade_meses <= max_age_months
  ORDER BY d.data_medicao ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 