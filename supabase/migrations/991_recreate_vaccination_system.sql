-- Migration: Recriar Sistema de Vacinação Completo
-- Data: 2024-01-XX

-- 1. Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS vaccination_alerts CASCADE;
DROP TABLE IF EXISTS child_vaccination_schedule CASCADE;
DROP TABLE IF EXISTS vaccination_calendar CASCADE;

-- 2. Recriar tabela vaccination_calendar
CREATE TABLE vaccination_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vaccine_name TEXT NOT NULL,
    age_months INTEGER NOT NULL,
    dose_number INTEGER NOT NULL DEFAULT 1,
    minimum_interval_days INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recriar tabela child_vaccination_schedule com UUID
CREATE TABLE child_vaccination_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL,
    vaccination_calendar_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    completed_date DATE,
    location TEXT,
    notes TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recriar tabela vaccination_alerts
CREATE TABLE vaccination_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_vaccination_schedule_id UUID NOT NULL,
    user_id UUID NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('7_days', '3_days', 'same_day')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status TEXT NOT NULL DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed'))
);

-- 5. Recriar índices
CREATE INDEX idx_child_vaccination_schedule_child_id ON child_vaccination_schedule(child_id);
CREATE INDEX idx_child_vaccination_schedule_status ON child_vaccination_schedule(status);
CREATE INDEX idx_child_vaccination_schedule_scheduled_date ON child_vaccination_schedule(scheduled_date);
CREATE INDEX idx_vaccination_alerts_user_id ON vaccination_alerts(user_id);
CREATE INDEX idx_vaccination_alerts_sent_at ON vaccination_alerts(sent_at);

-- 6. Recriar trigger para updated_at
CREATE TRIGGER update_child_vaccination_schedule_updated_at BEFORE UPDATE ON child_vaccination_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Inserir dados do Calendário Nacional de Vacinação Brasileiro
INSERT INTO vaccination_calendar (vaccine_name, age_months, dose_number, minimum_interval_days, description) VALUES
-- Ao nascer
('BCG', 0, 1, NULL, 'Bacilo Calmette-Guérin - Dose única'),
('Hepatite B', 0, 1, NULL, 'Hepatite B - 1ª dose'),

-- 2 meses
('Pentavalente', 2, 1, NULL, 'DTP + Hib + Hepatite B - 1ª dose'),
('VIP', 2, 1, NULL, 'Poliomielite Inativada - 1ª dose'),
('Pneumocócica 10V', 2, 1, NULL, 'Pneumocócica 10-valente - 1ª dose'),
('Rotavírus', 2, 1, NULL, 'Rotavírus Humano - 1ª dose'),

-- 4 meses
('Pentavalente', 4, 2, 60, 'DTP + Hib + Hepatite B - 2ª dose'),
('VIP', 4, 2, 60, 'Poliomielite Inativada - 2ª dose'),
('Pneumocócica 10V', 4, 2, 60, 'Pneumocócica 10-valente - 2ª dose'),
('Rotavírus', 4, 2, 60, 'Rotavírus Humano - 2ª dose'),

-- 6 meses
('Pentavalente', 6, 3, 60, 'DTP + Hib + Hepatite B - 3ª dose'),
('VIP', 6, 3, 60, 'Poliomielite Inativada - 3ª dose'),
('Pneumocócica 10V', 6, 3, 60, 'Pneumocócica 10-valente - 3ª dose'),

-- 9 meses
('Febre Amarela', 9, 1, NULL, 'Febre Amarela - Dose única'),

-- 12 meses
('Tríplice Viral', 12, 1, NULL, 'Sarampo, Caxumba e Rubéola - 1ª dose'),
('Meningocócica C', 12, 1, NULL, 'Meningocócica C - Reforço'),

-- 15 meses
('DTP', 15, 1, NULL, 'Difteria, Tétano e Pertussis - 1º Reforço'),
('VOP', 15, 1, NULL, 'Poliomielite Oral - 1º Reforço'),
('Hepatite A', 15, 1, NULL, 'Hepatite A - Dose única'),

-- 4 anos
('DTP', 48, 2, NULL, 'Difteria, Tétano e Pertussis - 2º Reforço'),
('VOP', 48, 2, NULL, 'Poliomielite Oral - 2º Reforço'),
('Tríplice Viral', 48, 2, NULL, 'Sarampo, Caxumba e Rubéola - 2ª dose'),
('Varicela', 48, 1, NULL, 'Varicela - Dose única'),

-- 9 anos
('HPV', 108, 1, NULL, 'HPV - 1ª dose (meninas)'),
('HPV', 114, 2, 180, 'HPV - 2ª dose (meninas)'); 