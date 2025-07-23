-- Migration: Adicionar Foreign Keys para Sistema de Vacinação
-- Data: 2024-01-XX

-- 1. Adicionar foreign key para vaccination_calendar_id
ALTER TABLE child_vaccination_schedule 
ADD CONSTRAINT fk_child_vaccination_schedule_calendar 
FOREIGN KEY (vaccination_calendar_id) REFERENCES vaccination_calendar(id) ON DELETE CASCADE;

-- 2. Adicionar foreign key para child_id
ALTER TABLE child_vaccination_schedule 
ADD CONSTRAINT fk_child_vaccination_schedule_child 
FOREIGN KEY (child_id) REFERENCES bebe(id) ON DELETE CASCADE;

-- 3. Adicionar foreign key para child_vaccination_schedule_id
ALTER TABLE vaccination_alerts 
ADD CONSTRAINT fk_vaccination_alerts_schedule 
FOREIGN KEY (child_vaccination_schedule_id) REFERENCES child_vaccination_schedule(id) ON DELETE CASCADE;

-- 4. Adicionar foreign key para user_id em vaccination_alerts
ALTER TABLE vaccination_alerts 
ADD CONSTRAINT fk_vaccination_alerts_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; 