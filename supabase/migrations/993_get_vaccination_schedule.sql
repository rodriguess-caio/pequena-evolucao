-- Migration: Função para Buscar Cronograma de Vacinação
-- Data: 2024-01-XX

-- Função para buscar cronograma de vacinação de uma criança
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