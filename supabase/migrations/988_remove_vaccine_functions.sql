-- Migration: Remover Todas as Funções de Vacinação
-- Data: 2024-01-XX

-- 1. Remover triggers primeiro
DROP TRIGGER IF EXISTS after_bebe_insert ON bebe;

-- 2. Remover todas as funções relacionadas a vacinação
DROP FUNCTION IF EXISTS get_vaccination_schedule_for_child(INTEGER);
DROP FUNCTION IF EXISTS get_vaccination_schedule_for_child(UUID);
DROP FUNCTION IF EXISTS generate_vaccination_schedule_for_child(INTEGER);
DROP FUNCTION IF EXISTS generate_vaccination_schedule_for_child(UUID);
DROP FUNCTION IF EXISTS trigger_generate_vaccination_schedule();

-- 3. Remover função de update_updated_at se não for usada em outros lugares
-- (mantendo apenas se for usada em outras tabelas)
-- DROP FUNCTION IF EXISTS update_updated_at_column(); 