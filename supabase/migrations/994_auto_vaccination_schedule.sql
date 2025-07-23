-- Migration: Função para Gerar Cronograma Automático de Vacinação
-- Data: 2024-01-XX

-- Políticas para child_vaccination_schedule
CREATE POLICY "Users can view their children's vaccination schedules" ON child_vaccination_schedule
    FOR SELECT USING (
        child_id IN (
            SELECT b.id FROM bebe b 
            JOIN profiles p ON b.user_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vaccination schedules for their children" ON child_vaccination_schedule
    FOR INSERT WITH CHECK (
        child_id IN (
            SELECT b.id FROM bebe b 
            JOIN profiles p ON b.user_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "Users can update their children's vaccination schedules" ON child_vaccination_schedule
    FOR UPDATE USING (
        child_id IN (
            SELECT b.id FROM bebe b 
            JOIN profiles p ON b.user_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

-- 1. Função para gerar cronograma de vacinação para um bebê
CREATE OR REPLACE FUNCTION generate_vaccination_schedule_for_child(child_id_param UUID)
RETURNS VOID AS $$
DECLARE
    calendar_record RECORD;
    scheduled_date DATE;
    child_birth_date DATE;
BEGIN
    -- Buscar data de nascimento do bebê
    SELECT data_nascimento INTO child_birth_date 
    FROM bebe 
    WHERE id = child_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bebê com ID % não encontrado', child_id_param;
    END IF;
    
    -- Para cada vacina no calendário nacional
    FOR calendar_record IN 
        SELECT * FROM vaccination_calendar WHERE is_active = true ORDER BY age_months, dose_number
    LOOP
        -- Calcular data agendada baseada na idade em meses
        scheduled_date := child_birth_date + (calendar_record.age_months || ' months')::INTERVAL;
        
        -- Inserir no cronograma personalizado
        INSERT INTO child_vaccination_schedule (
            child_id,
            vaccination_calendar_id,
            scheduled_date,
            status
        ) VALUES (
            child_id_param,
            calendar_record.id,
            scheduled_date,
            'pending'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger para gerar cronograma automaticamente quando um bebê é criado
CREATE OR REPLACE FUNCTION trigger_generate_vaccination_schedule()
RETURNS TRIGGER AS $$
BEGIN
    -- Gerar cronograma de vacinação para o novo bebê
    PERFORM generate_vaccination_schedule_for_child(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger na tabela bebe
CREATE TRIGGER after_bebe_insert
    AFTER INSERT ON bebe
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_vaccination_schedule(); 