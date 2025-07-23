-- Migration: Funções Finais do Sistema de Vacinação
-- Data: 2024-01-XX

-- 1. Função para buscar cronograma de vacinação de uma criança (UUID)
CREATE OR REPLACE FUNCTION get_vaccination_schedule_for_child(child_id_param UUID)
RETURNS TABLE (
    id UUID,
    child_id UUID,
    vaccination_calendar_id UUID,
    scheduled_date DATE,
    status TEXT,
    completed_date DATE,
    location TEXT,
    notes TEXT,
    certificate_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    vaccine_name TEXT,
    age_months INTEGER,
    dose_number INTEGER,
    description TEXT,
    child_nome TEXT,
    child_data_nascimento DATE,
    days_until_due INTEGER,
    is_overdue BOOLEAN,
    is_due_soon BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cvs.id,
        cvs.child_id,
        cvs.vaccination_calendar_id,
        cvs.scheduled_date,
        cvs.status,
        cvs.completed_date,
        cvs.location,
        cvs.notes,
        cvs.certificate_url,
        cvs.created_at,
        cvs.updated_at,
        vc.vaccine_name,
        vc.age_months,
        vc.dose_number,
        vc.description,
        b.nome as child_nome,
        b.data_nascimento as child_data_nascimento,
        CASE 
            WHEN cvs.status = 'pending' THEN 
                EXTRACT(DAY FROM (cvs.scheduled_date - CURRENT_DATE))
            ELSE NULL
        END as days_until_due,
        CASE 
            WHEN cvs.status = 'pending' AND cvs.scheduled_date < CURRENT_DATE THEN true
            ELSE false
        END as is_overdue,
        CASE 
            WHEN cvs.status = 'pending' AND cvs.scheduled_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days') THEN true
            ELSE false
        END as is_due_soon
    FROM child_vaccination_schedule cvs
    JOIN vaccination_calendar vc ON cvs.vaccination_calendar_id = vc.id
    JOIN bebe b ON cvs.child_id = b.id
    WHERE cvs.child_id = child_id_param
    ORDER BY cvs.scheduled_date ASC;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para gerar cronograma de vacinação para um bebê (UUID)
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

-- 3. Trigger para gerar cronograma automaticamente quando um bebê é criado
CREATE OR REPLACE FUNCTION trigger_generate_vaccination_schedule()
RETURNS TRIGGER AS $$
BEGIN
    -- Gerar cronograma de vacinação para o novo bebê
    PERFORM generate_vaccination_schedule_for_child(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger na tabela bebe
DROP TRIGGER IF EXISTS after_bebe_insert ON bebe;
CREATE TRIGGER after_bebe_insert
    AFTER INSERT ON bebe
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_vaccination_schedule();

-- 5. Row Level Security (RLS)
ALTER TABLE child_vaccination_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para child_vaccination_schedule
CREATE POLICY "Users can view their children's vaccination schedules" ON child_vaccination_schedule
    FOR SELECT USING (
        child_id IN (
            SELECT b.id FROM bebe b 
            WHERE b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vaccination schedules for their children" ON child_vaccination_schedule
    FOR INSERT WITH CHECK (
        child_id IN (
            SELECT b.id FROM bebe b 
            WHERE b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their children's vaccination schedules" ON child_vaccination_schedule
    FOR UPDATE USING (
        child_id IN (
            SELECT b.id FROM bebe b 
            WHERE b.user_id = auth.uid()
        )
    );

-- Políticas para vaccination_alerts
CREATE POLICY "Users can view their vaccination alerts" ON vaccination_alerts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their vaccination alerts" ON vaccination_alerts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Política para vaccination_calendar (somente leitura para usuários)
CREATE POLICY "Users can view vaccination calendar" ON vaccination_calendar
    FOR SELECT USING (is_active = true); 