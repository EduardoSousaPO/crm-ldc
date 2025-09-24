-- =====================================================
-- Script de Limpeza de Dados Demo - CRM LDC
-- ⚠️  ATENÇÃO: APENAS PARA DEV/STAGING - NUNCA EM PRODUÇÃO
-- =====================================================

-- Verificar se não estamos em produção
DO $$
BEGIN
    -- Verificar se existe algum lead com domínio corporativo real
    IF EXISTS (
        SELECT 1 FROM leads 
        WHERE email ILIKE '%@empresa.com' 
           OR email ILIKE '%@corporativo.com'
           OR email ILIKE '%@cliente.com'
        LIMIT 1
    ) THEN
        RAISE EXCEPTION '🚨 ATENÇÃO: Detectados emails corporativos reais. Este script é apenas para dados demo!';
    END IF;
    
    RAISE NOTICE '✅ Verificação de segurança passou. Prosseguindo com limpeza...';
END $$;

-- Desabilitar triggers temporariamente para performance
SET session_replication_role = replica;

-- Backup de contagem antes da limpeza
DO $$
DECLARE
    leads_count INTEGER;
    interactions_count INTEGER;
    tasks_count INTEGER;
    meetings_count INTEGER;
    events_count INTEGER;
    logs_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO leads_count FROM leads;
    SELECT COUNT(*) INTO interactions_count FROM interactions;
    SELECT COUNT(*) INTO tasks_count FROM tasks;
    SELECT COUNT(*) INTO meetings_count FROM meetings;
    SELECT COUNT(*) INTO events_count FROM calendar_events;
    SELECT COUNT(*) INTO logs_count FROM automation_logs;
    
    RAISE NOTICE '📊 ANTES DA LIMPEZA:';
    RAISE NOTICE '   - Leads: %', leads_count;
    RAISE NOTICE '   - Interações: %', interactions_count;
    RAISE NOTICE '   - Tarefas: %', tasks_count;
    RAISE NOTICE '   - Reuniões: %', meetings_count;
    RAISE NOTICE '   - Eventos: %', events_count;
    RAISE NOTICE '   - Logs: %', logs_count;
END $$;

-- Limpeza em ordem de dependências (filhos primeiro)
TRUNCATE TABLE automation_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE calendar_events RESTART IDENTITY CASCADE;
TRUNCATE TABLE meetings RESTART IDENTITY CASCADE;
TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;
TRUNCATE TABLE interactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE leads RESTART IDENTITY CASCADE;

-- Limpar workflows de automação (opcional)
-- TRUNCATE TABLE automation_workflows RESTART IDENTITY CASCADE;

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- Log da operação
INSERT INTO automation_logs (
    user_id,
    workflow_id,
    action,
    payload,
    status,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    NULL,
    'CLEAN_DEMO_DATA',
    '{"operation": "truncate_all_demo_tables", "timestamp": "' || NOW() || '"}',
    'success',
    NOW()
);

-- Verificação final
DO $$
DECLARE
    total_records INTEGER;
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM leads) +
        (SELECT COUNT(*) FROM interactions) +
        (SELECT COUNT(*) FROM tasks) +
        (SELECT COUNT(*) FROM meetings) +
        (SELECT COUNT(*) FROM calendar_events)
    INTO total_records;
    
    RAISE NOTICE '🧹 LIMPEZA CONCLUÍDA!';
    RAISE NOTICE '📊 Total de registros restantes: %', total_records;
    
    IF total_records = 0 THEN
        RAISE NOTICE '✅ Todas as tabelas foram limpas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️  Ainda existem % registros. Verificar dependências.', total_records;
    END IF;
END $$;

-- Resetar sequences para começar do ID 1
ALTER SEQUENCE leads_id_seq RESTART WITH 1;
ALTER SEQUENCE interactions_id_seq RESTART WITH 1;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE meetings_id_seq RESTART WITH 1;
ALTER SEQUENCE calendar_events_id_seq RESTART WITH 1;
ALTER SEQUENCE automation_logs_id_seq RESTART WITH 1;

RAISE NOTICE '🔄 Sequences resetadas para começar do ID 1';
RAISE NOTICE '🎯 Ambiente pronto para novos dados de produção!';
