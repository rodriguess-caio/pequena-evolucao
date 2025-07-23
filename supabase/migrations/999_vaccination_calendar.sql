-- Migration: Calendário Nacional de Vacinação
-- Data: 2024-01-XX

-- 1. Tabela do Calendário Nacional de Vacinação
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

-- 2. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Trigger para updated_at
CREATE TRIGGER update_vaccination_calendar_updated_at BEFORE UPDATE ON vaccination_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Inserir dados do Calendário Nacional de Vacinação Brasileiro
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