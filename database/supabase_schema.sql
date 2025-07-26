-- =============================================
-- Sistema de Gestão de Pessoas - HR Management
-- Scripts SQL para Supabase
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Tabela de Departamentos
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cargos/Posições
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    salary DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    position_id UUID REFERENCES positions(id),
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Perfis de Usuário
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    hire_date DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Admissões
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admission_date DATE NOT NULL,
    contract_type VARCHAR(50) DEFAULT 'clt' CHECK (contract_type IN ('clt', 'pj', 'intern', 'temporary')),
    probation_end_date DATE,
    salary DECIMAL(10,2),
    benefits TEXT,
    documents_status VARCHAR(50) DEFAULT 'pending' CHECK (documents_status IN ('pending', 'complete', 'incomplete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Avaliações de Desempenho
CREATE TABLE performance_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 10),
    goals_achievement DECIMAL(3,2) CHECK (goals_achievement >= 0 AND goals_achievement <= 10),
    technical_skills DECIMAL(3,2) CHECK (technical_skills >= 0 AND technical_skills <= 10),
    soft_skills DECIMAL(3,2) CHECK (soft_skills >= 0 AND soft_skills <= 10),
    comments TEXT,
    feedback TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Benefícios
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('health', 'dental', 'life_insurance', 'meal_voucher', 'transport_voucher', 'gym', 'education', 'other')),
    value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Benefícios dos Usuários
CREATE TABLE user_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, benefit_id)
);

-- Tabela de Treinamentos
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    duration_hours INTEGER,
    max_participants INTEGER,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'internal' CHECK (type IN ('internal', 'external', 'online')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Participações em Treinamentos
CREATE TABLE training_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'cancelled', 'no_show')),
    completion_date DATE,
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 10),
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(training_id, user_id)
);

-- Tabela de Férias
CREATE TABLE vacations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'annual' CHECK (type IN ('annual', 'medical', 'maternity', 'paternity', 'emergency')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Chat/Mensagens
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'user' CHECK (message_type IN ('user', 'bot', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações do Sistema
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_position_id ON users(position_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Índices para Performance Evaluations
CREATE INDEX idx_performance_evaluations_user_id ON performance_evaluations(user_id);
CREATE INDEX idx_performance_evaluations_evaluator_id ON performance_evaluations(evaluator_id);
CREATE INDEX idx_performance_evaluations_period ON performance_evaluations(period_start, period_end);

-- Índices para Vacations
CREATE INDEX idx_vacations_user_id ON vacations(user_id);
CREATE INDEX idx_vacations_status ON vacations(status);
CREATE INDEX idx_vacations_dates ON vacations(start_date, end_date);

-- Índices para Chat Messages
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_evaluations_updated_at BEFORE UPDATE ON performance_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_benefits_updated_at BEFORE UPDATE ON user_benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_participations_updated_at BEFORE UPDATE ON training_participations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vacations_updated_at BEFORE UPDATE ON vacations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FOREIGN KEY CONSTRAINTS ADICIONAIS
-- =============================================

-- Adicionar constraint para manager_id em departments
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager_id FOREIGN KEY (manager_id) REFERENCES users(id);

-- =============================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- =============================================

-- Habilitar RLS nas tabelas sensíveis (descomente se necessário)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DADOS INICIAIS (SEEDS)
-- =============================================

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (key, value, description) VALUES
('company_name', 'Empresa XYZ', 'Nome da empresa'),
('vacation_days_per_year', '30', 'Dias de férias por ano'),
('probation_period_days', '90', 'Período de experiência em dias'),
('working_hours_per_day', '8', 'Horas de trabalho por dia'),
('max_chat_history_days', '365', 'Dias de histórico de chat a manter');

-- Inserir departamentos padrão
INSERT INTO departments (name, description) VALUES
('Recursos Humanos', 'Departamento responsável pela gestão de pessoas'),
('Tecnologia da Informação', 'Departamento de desenvolvimento e infraestrutura'),
('Vendas', 'Departamento comercial e vendas'),
('Marketing', 'Departamento de marketing e comunicação'),
('Financeiro', 'Departamento financeiro e contábil'),
('Operações', 'Departamento de operações e logística');

-- Inserir cargos padrão
INSERT INTO positions (name, description, salary) VALUES
('Desenvolvedor Full Stack', 'Desenvolvedor com conhecimento em frontend e backend', 8000.00),
('Analista de RH', 'Responsável por processos de recursos humanos', 6500.00),
('Gerente de Vendas', 'Gerente responsável pela equipe de vendas', 12000.00),
('Designer UX/UI', 'Designer de experiência e interface do usuário', 7000.00),
('Analista Financeiro', 'Responsável por análises financeiras', 7500.00),
('Coordenador de Marketing', 'Coordenador de campanhas de marketing', 8500.00);

-- Inserir benefícios padrão
INSERT INTO benefits (name, description, type, value) VALUES
('Plano de Saúde', 'Plano de saúde empresarial', 'health', 350.00),
('Plano Odontológico', 'Plano odontológico empresarial', 'dental', 80.00),
('Seguro de Vida', 'Seguro de vida em grupo', 'life_insurance', 25.00),
('Vale Refeição', 'Vale refeição diário', 'meal_voucher', 35.00),
('Vale Transporte', 'Vale transporte mensal', 'transport_voucher', 220.00),
('Academia', 'Auxílio academia', 'gym', 100.00),
('Auxílio Educação', 'Auxílio para cursos e educação', 'education', 500.00);

-- Inserir usuário administrador padrão
INSERT INTO users (email, password, name, role) VALUES
('admin@hrmanagement.com', crypt('admin123', gen_salt('bf')), 'Administrador do Sistema', 'admin');

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View para usuários com informações completas
CREATE VIEW users_complete AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.created_at,
    p.name as position_name,
    p.salary as position_salary,
    d.name as department_name,
    up.phone,
    up.address,
    up.hire_date,
    up.avatar_url
FROM users u
LEFT JOIN positions p ON u.position_id = p.id
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- View para estatísticas do dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = true) as total_employees,
    (SELECT COUNT(*) FROM departments) as total_departments,
    (SELECT COUNT(*) FROM positions) as total_positions,
    (SELECT COUNT(*) FROM performance_evaluations WHERE status = 'draft') as pending_evaluations,
    (SELECT COUNT(*) FROM vacations WHERE status = 'pending') as pending_vacations,
    (SELECT COUNT(*) FROM trainings WHERE status = 'scheduled') as scheduled_trainings;

-- =============================================
-- FUNÇÕES ÚTEIS
-- =============================================

-- Função para calcular dias de férias disponíveis
CREATE OR REPLACE FUNCTION calculate_available_vacation_days(user_id_param UUID, year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS INTEGER AS $$
DECLARE
    total_days INTEGER := 30; -- Dias padrão por ano
    used_days INTEGER := 0;
BEGIN
    -- Calcular dias já utilizados no ano
    SELECT COALESCE(SUM(days_requested), 0) INTO used_days
    FROM vacations 
    WHERE user_id = user_id_param 
    AND EXTRACT(YEAR FROM start_date) = year_param
    AND status = 'approved';
    
    RETURN total_days - used_days;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTÁRIOS NAS TABELAS
-- =============================================

COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE departments IS 'Departamentos da empresa';
COMMENT ON TABLE positions IS 'Cargos/posições disponíveis na empresa';
COMMENT ON TABLE user_profiles IS 'Perfis detalhados dos usuários';
COMMENT ON TABLE admissions IS 'Processo de admissão de funcionários';
COMMENT ON TABLE performance_evaluations IS 'Avaliações de desempenho dos funcionários';
COMMENT ON TABLE benefits IS 'Benefícios oferecidos pela empresa';
COMMENT ON TABLE user_benefits IS 'Benefícios atribuídos aos usuários';
COMMENT ON TABLE trainings IS 'Treinamentos oferecidos pela empresa';
COMMENT ON TABLE training_participations IS 'Participações dos usuários em treinamentos';
COMMENT ON TABLE vacations IS 'Solicitações e aprovações de férias';
COMMENT ON TABLE chat_messages IS 'Mensagens do sistema de chat';
COMMENT ON TABLE system_settings IS 'Configurações gerais do sistema';

