-- Migration 016: Remover Dados Mockados
-- Remover dados de referência automáticos para permitir apenas dados reais do usuário

-- Remove all reference data that was automatically inserted
DELETE FROM desenvolvimento 
WHERE observacoes IN (
    'Dados de referência - OMS',
    'Dados padrão baseados em padrões médicos da OMS'
);

-- Drop the trigger that automatically inserts reference data
DROP TRIGGER IF EXISTS auto_insert_reference_data_trigger ON bebe;

-- Drop the function that inserts reference data
DROP FUNCTION IF EXISTS insert_reference_data_if_empty(UUID, DATE);
DROP FUNCTION IF EXISTS auto_insert_reference_data();

-- Create a new function that only inserts birth weight if no data exists
CREATE OR REPLACE FUNCTION insert_birth_weight_if_empty(bebe_id_param UUID, birth_date DATE)
RETURNS VOID AS $$
DECLARE
    existing_count INTEGER;
BEGIN
    -- Check if bebê already has development data
    SELECT COUNT(*) INTO existing_count 
    FROM desenvolvimento 
    WHERE bebe_id = bebe_id_param;
    
    -- Only insert birth weight if no data exists
    IF existing_count = 0 THEN
        -- Insert birth weight data (0 months)
        INSERT INTO desenvolvimento (
            bebe_id, 
            data_medicao, 
            idade_meses, 
            peso_kg, 
            comprimento_cm, 
            observacoes
        )
        VALUES (
            bebe_id_param, 
            birth_date, 
            0, 
            3.2, -- Standard birth weight
            50.0, -- Standard birth length
            'Peso do nascimento'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new trigger that only inserts birth weight for new bebês
CREATE OR REPLACE FUNCTION auto_insert_birth_weight()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert birth weight only if no data exists
    PERFORM insert_birth_weight_if_empty(NEW.id, NEW.data_nascimento);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for new bebês
CREATE TRIGGER auto_insert_birth_weight_trigger
    AFTER INSERT ON bebe
    FOR EACH ROW
    EXECUTE FUNCTION auto_insert_birth_weight(); 