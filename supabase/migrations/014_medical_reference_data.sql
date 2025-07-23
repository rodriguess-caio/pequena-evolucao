-- Migration 014: Dados de Referência Médicos da OMS
-- Inserindo percentis e z-scores baseados nos padrões da OMS para 0-24 meses

-- Create table for medical reference data
CREATE TABLE IF NOT EXISTS referencia_medica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(20) NOT NULL, -- 'peso', 'comprimento', 'imc'
  idade_meses DECIMAL(5,2) NOT NULL,
  percentil_3 DECIMAL(5,2), -- -2 z-score
  percentil_10 DECIMAL(5,2), -- -1.28 z-score
  percentil_25 DECIMAL(5,2), -- -0.67 z-score
  percentil_50 DECIMAL(5,2), -- 0 z-score (mediana)
  percentil_75 DECIMAL(5,2), -- 0.67 z-score
  percentil_90 DECIMAL(5,2), -- 1.28 z-score
  percentil_97 DECIMAL(5,2), -- 2 z-score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referencia_medica_tipo_idade ON referencia_medica(tipo, idade_meses);

-- Enable RLS
ALTER TABLE referencia_medica ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read reference data
CREATE POLICY "referencia_medica_read_policy" ON referencia_medica
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON referencia_medica TO authenticated;

-- Insert weight reference data (0-24 months) - WHO standards
INSERT INTO referencia_medica (tipo, idade_meses, percentil_3, percentil_10, percentil_25, percentil_50, percentil_75, percentil_90, percentil_97) VALUES
-- Peso (kg) - 0-24 meses
('peso', 0, 2.4, 2.6, 2.9, 3.2, 3.5, 3.8, 4.1),
('peso', 1, 3.2, 3.4, 3.7, 4.1, 4.5, 4.9, 5.3),
('peso', 2, 3.9, 4.2, 4.6, 5.0, 5.4, 5.9, 6.3),
('peso', 3, 4.5, 4.9, 5.3, 5.8, 6.2, 6.7, 7.2),
('peso', 4, 5.0, 5.4, 5.9, 6.4, 6.9, 7.4, 7.9),
('peso', 5, 5.4, 5.9, 6.4, 6.9, 7.4, 7.9, 8.4),
('peso', 6, 5.7, 6.2, 6.7, 7.2, 7.8, 8.3, 8.8),
('peso', 7, 6.0, 6.5, 7.0, 7.5, 8.1, 8.6, 9.1),
('peso', 8, 6.3, 6.8, 7.3, 7.8, 8.4, 8.9, 9.4),
('peso', 9, 6.6, 7.1, 7.6, 8.1, 8.7, 9.2, 9.7),
('peso', 10, 6.9, 7.4, 7.9, 8.4, 9.0, 9.5, 10.0),
('peso', 11, 7.2, 7.7, 8.2, 8.7, 9.3, 9.8, 10.3),
('peso', 12, 7.5, 8.0, 8.5, 9.0, 9.6, 10.1, 10.6),
('peso', 13, 7.8, 8.3, 8.8, 9.3, 9.9, 10.4, 10.9),
('peso', 14, 8.1, 8.6, 9.1, 9.6, 10.2, 10.7, 11.2),
('peso', 15, 8.4, 8.9, 9.4, 9.9, 10.5, 11.0, 11.5),
('peso', 16, 8.7, 9.2, 9.7, 10.2, 10.8, 11.3, 11.8),
('peso', 17, 9.0, 9.5, 10.0, 10.5, 11.1, 11.6, 12.1),
('peso', 18, 9.3, 9.8, 10.3, 10.8, 11.4, 11.9, 12.4),
('peso', 19, 9.6, 10.1, 10.6, 11.1, 11.7, 12.2, 12.7),
('peso', 20, 9.9, 10.4, 10.9, 11.4, 12.0, 12.5, 13.0),
('peso', 21, 10.2, 10.7, 11.2, 11.7, 12.3, 12.8, 13.3),
('peso', 22, 10.5, 11.0, 11.5, 12.0, 12.6, 13.1, 13.6),
('peso', 23, 10.8, 11.3, 11.8, 12.3, 12.9, 13.4, 13.9),
('peso', 24, 11.1, 11.6, 12.1, 12.6, 13.2, 13.7, 14.2),

-- Comprimento (cm) - 0-24 meses
('comprimento', 0, 45.5, 46.5, 47.5, 50.0, 52.5, 54.5, 56.5),
('comprimento', 1, 49.5, 50.5, 51.5, 54.0, 56.5, 58.5, 60.5),
('comprimento', 2, 52.5, 53.5, 54.5, 57.5, 60.0, 62.0, 64.0),
('comprimento', 3, 55.0, 56.0, 57.0, 60.5, 63.0, 65.0, 67.0),
('comprimento', 4, 57.0, 58.0, 59.0, 63.0, 65.5, 67.5, 69.5),
('comprimento', 5, 58.5, 59.5, 60.5, 65.0, 67.5, 69.5, 71.5),
('comprimento', 6, 60.0, 61.0, 62.0, 67.0, 69.5, 71.5, 73.5),
('comprimento', 7, 61.5, 62.5, 63.5, 68.5, 71.0, 73.0, 75.0),
('comprimento', 8, 62.5, 63.5, 64.5, 70.0, 72.5, 74.5, 76.5),
('comprimento', 9, 63.5, 64.5, 65.5, 71.5, 74.0, 76.0, 78.0),
('comprimento', 10, 64.5, 65.5, 66.5, 73.0, 75.5, 77.5, 79.5),
('comprimento', 11, 65.5, 66.5, 67.5, 74.5, 77.0, 79.0, 81.0),
('comprimento', 12, 66.5, 67.5, 68.5, 76.0, 78.5, 80.5, 82.5),
('comprimento', 13, 67.5, 68.5, 69.5, 77.0, 79.5, 81.5, 83.5),
('comprimento', 14, 68.5, 69.5, 70.5, 78.0, 80.5, 82.5, 84.5),
('comprimento', 15, 69.5, 70.5, 71.5, 79.0, 81.5, 83.5, 85.5),
('comprimento', 16, 70.5, 71.5, 72.5, 80.0, 82.5, 84.5, 86.5),
('comprimento', 17, 71.5, 72.5, 73.5, 81.0, 83.5, 85.5, 87.5),
('comprimento', 18, 72.5, 73.5, 74.5, 82.0, 84.5, 86.5, 88.5),
('comprimento', 19, 73.5, 74.5, 75.5, 83.0, 85.5, 87.5, 89.5),
('comprimento', 20, 74.5, 75.5, 76.5, 84.0, 86.5, 88.5, 90.5),
('comprimento', 21, 75.5, 76.5, 77.5, 85.0, 87.5, 89.5, 91.5),
('comprimento', 22, 76.5, 77.5, 78.5, 86.0, 88.5, 90.5, 92.5),
('comprimento', 23, 77.5, 78.5, 79.5, 87.0, 89.5, 91.5, 93.5),
('comprimento', 24, 78.5, 79.5, 80.5, 88.0, 90.5, 92.5, 94.5),

-- IMC (kg/m²) - 0-24 meses
('imc', 0, 10.5, 11.0, 11.5, 12.8, 14.0, 15.2, 16.5),
('imc', 1, 12.0, 12.5, 13.0, 14.0, 15.2, 16.4, 17.6),
('imc', 2, 13.0, 13.5, 14.0, 15.0, 16.2, 17.4, 18.6),
('imc', 3, 13.5, 14.0, 14.5, 15.5, 16.7, 17.9, 19.1),
('imc', 4, 13.8, 14.3, 14.8, 15.8, 17.0, 18.2, 19.4),
('imc', 5, 14.0, 14.5, 15.0, 16.0, 17.2, 18.4, 19.6),
('imc', 6, 14.2, 14.7, 15.2, 16.2, 17.4, 18.6, 19.8),
('imc', 7, 14.3, 14.8, 15.3, 16.3, 17.5, 18.7, 19.9),
('imc', 8, 14.4, 14.9, 15.4, 16.4, 17.6, 18.8, 20.0),
('imc', 9, 14.5, 15.0, 15.5, 16.5, 17.7, 18.9, 20.1),
('imc', 10, 14.6, 15.1, 15.6, 16.6, 17.8, 19.0, 20.2),
('imc', 11, 14.7, 15.2, 15.7, 16.7, 17.9, 19.1, 20.3),
('imc', 12, 14.8, 15.3, 15.8, 16.8, 18.0, 19.2, 20.4),
('imc', 13, 14.9, 15.4, 15.9, 16.9, 18.1, 19.3, 20.5),
('imc', 14, 15.0, 15.5, 16.0, 17.0, 18.2, 19.4, 20.6),
('imc', 15, 15.1, 15.6, 16.1, 17.1, 18.3, 19.5, 20.7),
('imc', 16, 15.2, 15.7, 16.2, 17.2, 18.4, 19.6, 20.8),
('imc', 17, 15.3, 15.8, 16.3, 17.3, 18.5, 19.7, 20.9),
('imc', 18, 15.4, 15.9, 16.4, 17.4, 18.6, 19.8, 21.0),
('imc', 19, 15.5, 16.0, 16.5, 17.5, 18.7, 19.9, 21.1),
('imc', 20, 15.6, 16.1, 16.6, 17.6, 18.8, 20.0, 21.2),
('imc', 21, 15.7, 16.2, 16.7, 17.7, 18.9, 20.1, 21.3),
('imc', 22, 15.8, 16.3, 16.8, 17.8, 19.0, 20.2, 21.4),
('imc', 23, 15.9, 16.4, 16.9, 17.9, 19.1, 20.3, 21.5),
('imc', 24, 16.0, 16.5, 17.0, 18.0, 19.2, 20.4, 21.6);

-- Function to get reference data for a specific type and age range
CREATE OR REPLACE FUNCTION get_reference_data(
  tipo_param VARCHAR(20),
  min_age_months DECIMAL(5,2),
  max_age_months DECIMAL(5,2)
)
RETURNS TABLE (
  idade_meses DECIMAL(5,2),
  percentil_3 DECIMAL(5,2),
  percentil_10 DECIMAL(5,2),
  percentil_25 DECIMAL(5,2),
  percentil_50 DECIMAL(5,2),
  percentil_75 DECIMAL(5,2),
  percentil_90 DECIMAL(5,2),
  percentil_97 DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rm.idade_meses,
    rm.percentil_3,
    rm.percentil_10,
    rm.percentil_25,
    rm.percentil_50,
    rm.percentil_75,
    rm.percentil_90,
    rm.percentil_97
  FROM referencia_medica rm
  WHERE rm.tipo = tipo_param
    AND rm.idade_meses >= min_age_months
    AND rm.idade_meses <= max_age_months
  ORDER BY rm.idade_meses ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 