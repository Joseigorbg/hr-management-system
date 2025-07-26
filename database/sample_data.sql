-- =============================================
-- DADOS DE EXEMPLO PARA DEMONSTRAÇÃO
-- Sistema de Gestão de Pessoas - HR Management
-- =============================================

-- IMPORTANTE: Execute este script APÓS o supabase_schema.sql

-- =============================================
-- USUÁRIOS DE EXEMPLO
-- =============================================

-- Obter IDs dos departamentos e cargos para referência
DO $$
DECLARE
    dept_ti_id UUID;
    dept_rh_id UUID;
    dept_vendas_id UUID;
    dept_marketing_id UUID;
    
    pos_dev_id UUID;
    pos_analista_rh_id UUID;
    pos_gerente_vendas_id UUID;
    pos_designer_id UUID;
    
    admin_user_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
BEGIN
    -- Obter IDs dos departamentos
    SELECT id INTO dept_ti_id FROM departments WHERE name = 'Tecnologia da Informação';
    SELECT id INTO dept_rh_id FROM departments WHERE name = 'Recursos Humanos';
    SELECT id INTO dept_vendas_id FROM departments WHERE name = 'Vendas';
    SELECT id INTO dept_marketing_id FROM departments WHERE name = 'Marketing';
    
    -- Obter IDs dos cargos
    SELECT id INTO pos_dev_id FROM positions WHERE name = 'Desenvolvedor Full Stack';
    SELECT id INTO pos_analista_rh_id FROM positions WHERE name = 'Analista de RH';
    SELECT id INTO pos_gerente_vendas_id FROM positions WHERE name = 'Gerente de Vendas';
    SELECT id INTO pos_designer_id FROM positions WHERE name = 'Designer UX/UI';
    
    -- Obter ID do usuário admin
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@hrmanagement.com';
    
    -- Inserir usuários de exemplo
    INSERT INTO users (email, password, name, role, position_id, department_id) VALUES
    ('joao.silva@empresa.com', crypt('senha123', gen_salt('bf')), 'João Silva', 'employee', pos_dev_id, dept_ti_id),
    ('maria.santos@empresa.com', crypt('senha123', gen_salt('bf')), 'Maria Santos', 'manager', pos_analista_rh_id, dept_rh_id),
    ('pedro.costa@empresa.com', crypt('senha123', gen_salt('bf')), 'Pedro Costa', 'manager', pos_gerente_vendas_id, dept_vendas_id),
    ('ana.oliveira@empresa.com', crypt('senha123', gen_salt('bf')), 'Ana Oliveira', 'employee', pos_designer_id, dept_ti_id);
    
    -- Obter IDs dos usuários criados
    SELECT id INTO user1_id FROM users WHERE email = 'joao.silva@empresa.com';
    SELECT id INTO user2_id FROM users WHERE email = 'maria.santos@empresa.com';
    SELECT id INTO user3_id FROM users WHERE email = 'pedro.costa@empresa.com';
    SELECT id INTO user4_id FROM users WHERE email = 'ana.oliveira@empresa.com';
    
    -- Inserir perfis dos usuários
    INSERT INTO user_profiles (user_id, phone, address, birth_date, hire_date, emergency_contact_name, emergency_contact_phone) VALUES
    (user1_id, '(11) 99999-9999', 'São Paulo, SP', '1990-05-15', '2023-01-15', 'Maria Silva', '(11) 88888-8888'),
    (user2_id, '(11) 88888-8888', 'São Paulo, SP', '1985-08-20', '2022-08-20', 'João Santos', '(11) 77777-7777'),
    (user3_id, '(11) 77777-7777', 'Rio de Janeiro, RJ', '1988-03-10', '2021-03-10', 'Ana Costa', '(11) 66666-6666'),
    (user4_id, '(11) 66666-6666', 'Belo Horizonte, MG', '1992-12-05', '2023-05-01', 'Carlos Oliveira', '(11) 55555-5555');
    
    -- Inserir admissões
    INSERT INTO admissions (user_id, admission_date, contract_type, probation_end_date, salary, benefits, documents_status) VALUES
    (user1_id, '2023-01-15', 'clt', '2023-04-15', 8000.00, 'Plano de saúde, vale refeição, vale transporte', 'complete'),
    (user2_id, '2022-08-20', 'clt', '2022-11-20', 6500.00, 'Plano de saúde, vale refeição, vale transporte', 'complete'),
    (user3_id, '2021-03-10', 'clt', '2021-06-10', 12000.00, 'Plano de saúde, vale refeição, vale transporte, seguro de vida', 'complete'),
    (user4_id, '2023-05-01', 'clt', '2023-08-01', 7000.00, 'Plano de saúde, vale refeição, vale transporte', 'complete');
    
    -- Inserir avaliações de desempenho
    INSERT INTO performance_evaluations (user_id, evaluator_id, period_start, period_end, overall_score, goals_achievement, technical_skills, soft_skills, comments, status) VALUES
    (user1_id, user2_id, '2023-01-01', '2023-06-30', 8.5, 9.0, 8.0, 8.5, 'Excelente desempenho técnico e boa colaboração em equipe.', 'approved'),
    (user4_id, admin_user_id, '2023-05-01', '2023-10-31', 7.8, 8.0, 7.5, 8.0, 'Bom desempenho inicial, com potencial de crescimento.', 'approved');
    
    -- Inserir solicitações de férias
    INSERT INTO vacations (user_id, start_date, end_date, days_requested, type, status, approved_by, approved_at, comments) VALUES
    (user1_id, '2024-07-01', '2024-07-15', 15, 'annual', 'approved', user2_id, NOW() - INTERVAL '30 days', 'Férias aprovadas para período de verão'),
    (user3_id, '2024-08-15', '2024-08-30', 15, 'annual', 'pending', NULL, NULL, 'Solicitação de férias para agosto'),
    (user4_id, '2024-06-10', '2024-06-20', 10, 'annual', 'approved', admin_user_id, NOW() - INTERVAL '15 days', 'Férias aprovadas');
    
    -- Inserir treinamentos
    INSERT INTO trainings (title, description, instructor, duration_hours, max_participants, start_date, end_date, location, type, status) VALUES
    ('Segurança da Informação', 'Treinamento sobre boas práticas de segurança digital', 'Carlos Security', 8, 20, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '8 hours', 'Sala de Treinamento A', 'internal', 'scheduled'),
    ('Liderança e Gestão', 'Desenvolvimento de habilidades de liderança', 'Ana Leadership', 16, 15, NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days', 'Auditório Principal', 'internal', 'scheduled'),
    ('React Avançado', 'Curso avançado de React para desenvolvedores', 'João React', 24, 10, NOW() + INTERVAL '21 days', NOW() + INTERVAL '24 days', 'Online', 'online', 'scheduled');
    
    -- Inserir participações em treinamentos
    INSERT INTO training_participations (training_id, user_id, status) VALUES
    ((SELECT id FROM trainings WHERE title = 'Segurança da Informação'), user1_id, 'enrolled'),
    ((SELECT id FROM trainings WHERE title = 'Segurança da Informação'), user4_id, 'enrolled'),
    ((SELECT id FROM trainings WHERE title = 'Liderança e Gestão'), user2_id, 'enrolled'),
    ((SELECT id FROM trainings WHERE title = 'Liderança e Gestão'), user3_id, 'enrolled'),
    ((SELECT id FROM trainings WHERE title = 'React Avançado'), user1_id, 'enrolled'),
    ((SELECT id FROM trainings WHERE title = 'React Avançado'), user4_id, 'enrolled');
    
    -- Inserir benefícios dos usuários
    INSERT INTO user_benefits (user_id, benefit_id, start_date, is_active) VALUES
    (user1_id, (SELECT id FROM benefits WHERE name = 'Plano de Saúde'), '2023-01-15', true),
    (user1_id, (SELECT id FROM benefits WHERE name = 'Vale Refeição'), '2023-01-15', true),
    (user1_id, (SELECT id FROM benefits WHERE name = 'Vale Transporte'), '2023-01-15', true),
    (user2_id, (SELECT id FROM benefits WHERE name = 'Plano de Saúde'), '2022-08-20', true),
    (user2_id, (SELECT id FROM benefits WHERE name = 'Vale Refeição'), '2022-08-20', true),
    (user2_id, (SELECT id FROM benefits WHERE name = 'Seguro de Vida'), '2022-08-20', true),
    (user3_id, (SELECT id FROM benefits WHERE name = 'Plano de Saúde'), '2021-03-10', true),
    (user3_id, (SELECT id FROM benefits WHERE name = 'Vale Refeição'), '2021-03-10', true),
    (user3_id, (SELECT id FROM benefits WHERE name = 'Seguro de Vida'), '2021-03-10', true),
    (user3_id, (SELECT id FROM benefits WHERE name = 'Academia'), '2021-03-10', true),
    (user4_id, (SELECT id FROM benefits WHERE name = 'Plano de Saúde'), '2023-05-01', true),
    (user4_id, (SELECT id FROM benefits WHERE name = 'Vale Refeição'), '2023-05-01', true),
    (user4_id, (SELECT id FROM benefits WHERE name = 'Auxílio Educação'), '2023-05-01', true);
    
    -- Inserir mensagens de chat de exemplo
    INSERT INTO chat_messages (sender_id, recipient_id, message, message_type, is_read) VALUES
    (NULL, user1_id, 'Bem-vindo ao sistema de RH! Como posso ajudá-lo hoje?', 'bot', false),
    (user1_id, NULL, 'Gostaria de saber sobre meus benefícios', 'user', true),
    (NULL, user1_id, 'Você tem os seguintes benefícios ativos: Plano de Saúde, Vale Refeição e Vale Transporte. Precisa de mais informações sobre algum deles?', 'bot', false),
    (user2_id, user1_id, 'João, você pode revisar o relatório de desempenho que enviei?', 'user', false),
    (user1_id, user2_id, 'Claro, Maria! Vou revisar ainda hoje.', 'user', true);
    
    -- Atualizar manager_id nos departamentos
    UPDATE departments SET manager_id = user2_id WHERE name = 'Recursos Humanos';
    UPDATE departments SET manager_id = user3_id WHERE name = 'Vendas';
    UPDATE departments SET manager_id = admin_user_id WHERE name = 'Tecnologia da Informação';
    
END $$;

