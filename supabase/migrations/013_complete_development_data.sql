-- Migration 013: Dados de Desenvolvimento Completos
-- Inserindo dados de desenvolvimento mais completos e realistas

-- Function to insert complete development data for a bebê
CREATE OR REPLACE FUNCTION insert_complete_development_data(bebe_id_param UUID, birth_date DATE)
RETURNS VOID AS $$
DECLARE
    measurement_date DATE;
    age_months DECIMAL(5,2);
    peso_kg DECIMAL(4,2);
    comprimento_cm DECIMAL(5,2);
    i INTEGER;
BEGIN
    -- Clear existing data for this bebê
    DELETE FROM desenvolvimento WHERE bebe_id = bebe_id_param;
    
    -- Insert data for first 24 months (monthly)
    FOR i IN 0..24 LOOP
        measurement_date := birth_date + (INTERVAL '1 month' * i);
        age_months := i::DECIMAL(5,2);
        
        -- Calculate standard weight and length based on WHO growth standards
        -- These are realistic values for a healthy baby development
        CASE i
            WHEN 0 THEN peso_kg := 3.2; comprimento_cm := 50.0;
            WHEN 1 THEN peso_kg := 4.1; comprimento_cm := 54.0;
            WHEN 2 THEN peso_kg := 5.0; comprimento_cm := 57.5;
            WHEN 3 THEN peso_kg := 5.8; comprimento_cm := 60.5;
            WHEN 4 THEN peso_kg := 6.4; comprimento_cm := 63.0;
            WHEN 5 THEN peso_kg := 6.9; comprimento_cm := 65.0;
            WHEN 6 THEN peso_kg := 7.2; comprimento_cm := 67.0;
            WHEN 7 THEN peso_kg := 7.5; comprimento_cm := 68.5;
            WHEN 8 THEN peso_kg := 7.8; comprimento_cm := 70.0;
            WHEN 9 THEN peso_kg := 8.1; comprimento_cm := 71.5;
            WHEN 10 THEN peso_kg := 8.4; comprimento_cm := 73.0;
            WHEN 11 THEN peso_kg := 8.7; comprimento_cm := 74.5;
            WHEN 12 THEN peso_kg := 9.0; comprimento_cm := 76.0;
            WHEN 13 THEN peso_kg := 9.3; comprimento_cm := 77.0;
            WHEN 14 THEN peso_kg := 9.6; comprimento_cm := 78.0;
            WHEN 15 THEN peso_kg := 9.9; comprimento_cm := 79.0;
            WHEN 16 THEN peso_kg := 10.2; comprimento_cm := 80.0;
            WHEN 17 THEN peso_kg := 10.5; comprimento_cm := 81.0;
            WHEN 18 THEN peso_kg := 10.8; comprimento_cm := 82.0;
            WHEN 19 THEN peso_kg := 11.1; comprimento_cm := 83.0;
            WHEN 20 THEN peso_kg := 11.4; comprimento_cm := 84.0;
            WHEN 21 THEN peso_kg := 11.7; comprimento_cm := 85.0;
            WHEN 22 THEN peso_kg := 12.0; comprimento_cm := 86.0;
            WHEN 23 THEN peso_kg := 12.3; comprimento_cm := 87.0;
            WHEN 24 THEN peso_kg := 12.6; comprimento_cm := 88.0;
            ELSE 
                peso_kg := 3.2 + (i * 0.4);
                comprimento_cm := 50.0 + (i * 1.5);
        END CASE;
        
        -- Insert development data
        INSERT INTO desenvolvimento (bebe_id, data_medicao, idade_meses, peso_kg, comprimento_cm, observacoes)
        VALUES (bebe_id_param, measurement_date, age_months, peso_kg, comprimento_cm, 'Dados padrão baseados em padrões médicos da OMS');
        
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert complete development data for all existing bebês
DO $$
DECLARE
    bebe_record RECORD;
BEGIN
    FOR bebe_record IN 
        SELECT id, data_nascimento 
        FROM bebe 
        WHERE user_id IN (SELECT id FROM profiles)
    LOOP
        PERFORM insert_complete_development_data(bebe_record.id, bebe_record.data_nascimento);
    END LOOP;
END $$;

-- Also insert data for bebês that might be created in the future
-- Create a trigger to automatically insert development data for new bebês
CREATE OR REPLACE FUNCTION auto_insert_development_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert development data for the new bebê
    PERFORM insert_complete_development_data(NEW.id, NEW.data_nascimento);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new bebês
DROP TRIGGER IF EXISTS auto_insert_development_data_trigger ON bebe;
CREATE TRIGGER auto_insert_development_data_trigger
    AFTER INSERT ON bebe
    FOR EACH ROW
    EXECUTE FUNCTION auto_insert_development_data(); 