-- Migration: Cronograma Personalizado de Vacinação (Simplificado)
-- Data: 2024-01-XX

-- 1. Tabela do Cronograma Personalizado de Vacinação (sem foreign keys por enquanto)
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

-- 2. Tabela de Alertas de Vacinação (sem foreign keys por enquanto)
CREATE TABLE vaccination_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_vaccination_schedule_id UUID NOT NULL,
    user_id UUID NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('7_days', '3_days', 'same_day')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status TEXT NOT NULL DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed'))
);

-- 3. Índices para Performance
CREATE INDEX idx_child_vaccination_schedule_child_id ON child_vaccination_schedule(child_id);
CREATE INDEX idx_child_vaccination_schedule_status ON child_vaccination_schedule(status);
CREATE INDEX idx_child_vaccination_schedule_scheduled_date ON child_vaccination_schedule(scheduled_date);
CREATE INDEX idx_vaccination_alerts_user_id ON vaccination_alerts(user_id);
CREATE INDEX idx_vaccination_alerts_sent_at ON vaccination_alerts(sent_at);

-- 4. Trigger para updated_at
CREATE TRIGGER update_child_vaccination_schedule_updated_at BEFORE UPDATE ON child_vaccination_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 