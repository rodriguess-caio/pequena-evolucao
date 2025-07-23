-- Migration 015: Corrigir Sistema de Dados de Desenvolvimento
-- Permitir dados reais do usuário sem sobrescrever

-- Remove the problematic trigger that overwrites user data
DROP TRIGGER IF EXISTS auto_insert_development_data_trigger ON bebe;

-- Drop the function that deletes existing data
DROP FUNCTION IF EXISTS insert_complete_development_data(UUID, DATE);

-- Create a new function that only inserts reference data if no data exists
CREATE OR REPLACE FUNCTION insert_reference_data_if_empty(bebe_id_param UUID, birth_date DATE)
RETURNS VOID AS $$
DECLARE
    existing_count INTEGER;
    measurement_date DATE;
    age_months DECIMAL(5,2);
    peso_kg DECIMAL(4,2);
    comprimento_cm DECIMAL(5,2);
    i INTEGER;
BEGIN
    -- Check if bebê already has development data
    SELECT COUNT(*) INTO existing_count 
    FROM desenvolvimento 
    WHERE bebe_id = bebe_id_param;
    
    -- Only insert reference data if no data exists
    IF existing_count = 0 THEN
        -- Insert data for first 24 months (monthly) as reference
        FOR i IN 0..24 LOOP
            measurement_date := birth_date + (INTERVAL '1 month' * i);
            age_months := i::DECIMAL(5,2);
            
            -- Calculate standard weight and length based on WHO growth standards
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
            
            -- Insert development data as reference
            INSERT INTO desenvolvimento (bebe_id, data_medicao, idade_meses, peso_kg, comprimento_cm, observacoes)
            VALUES (bebe_id_param, measurement_date, age_months, peso_kg, comprimento_cm, 'Dados de referência - OMS');
            
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new trigger that only inserts reference data for new bebês
CREATE OR REPLACE FUNCTION auto_insert_reference_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert reference data only if no data exists
    PERFORM insert_reference_data_if_empty(NEW.id, NEW.data_nascimento);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for new bebês
CREATE TRIGGER auto_insert_reference_data_trigger
    AFTER INSERT ON bebe
    FOR EACH ROW
    EXECUTE FUNCTION auto_insert_reference_data();

-- Function to calculate IMC for existing data
CREATE OR REPLACE FUNCTION calculate_imc_for_existing_data()
RETURNS VOID AS $$
DECLARE
    record_data RECORD;
BEGIN
    FOR record_data IN 
        SELECT id, peso_kg, comprimento_cm 
        FROM desenvolvimento 
        WHERE imc IS NULL 
        AND peso_kg IS NOT NULL 
        AND comprimento_cm IS NOT NULL
    LOOP
        -- Calculate IMC: peso (kg) / (altura (m))²
        UPDATE desenvolvimento 
        SET imc = ROUND((record_data.peso_kg / POWER(record_data.comprimento_cm / 100, 2))::DECIMAL(4,2), 2)
        WHERE id = record_data.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate IMC for all existing data
SELECT calculate_imc_for_existing_data();

-- Function to calculate IMC when new data is inserted
CREATE OR REPLACE FUNCTION calculate_imc_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate IMC if peso and comprimento are provided
    IF NEW.peso_kg IS NOT NULL AND NEW.comprimento_cm IS NOT NULL THEN
        NEW.imc := ROUND((NEW.peso_kg / POWER(NEW.comprimento_cm / 100, 2))::DECIMAL(4,2), 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to calculate IMC on insert/update
DROP TRIGGER IF EXISTS calculate_imc_trigger ON desenvolvimento;
CREATE TRIGGER calculate_imc_trigger
    BEFORE INSERT OR UPDATE ON desenvolvimento
    FOR EACH ROW
    EXECUTE FUNCTION calculate_imc_on_insert(); 