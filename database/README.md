# Configuração do Banco de Dados Supabase

Este diretório contém os scripts SQL necessários para configurar o banco de dados do Sistema de Gestão de Pessoas no Supabase.

## Arquivos

### 1. `supabase_schema.sql`
Script principal que cria toda a estrutura do banco de dados:
- **Tabelas principais**: users, departments, positions, user_profiles, etc.
- **Índices**: Para otimização de performance
- **Triggers**: Para atualização automática de timestamps
- **Views**: Para consultas otimizadas
- **Funções**: Utilitários como cálculo de dias de férias
- **Dados iniciais**: Configurações padrão, departamentos e benefícios

### 2. `sample_data.sql`
Script com dados de exemplo para demonstração:
- Usuários de teste
- Perfis completos
- Avaliações de desempenho
- Solicitações de férias
- Treinamentos e participações
- Mensagens de chat

## Como Executar no Supabase

### Passo 1: Acessar o SQL Editor
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para a seção "SQL Editor"

### Passo 2: Executar o Schema Principal
1. Copie todo o conteúdo do arquivo `supabase_schema.sql`
2. Cole no SQL Editor
3. Clique em "Run" para executar

### Passo 3: Executar os Dados de Exemplo (Opcional)
1. Copie todo o conteúdo do arquivo `sample_data.sql`
2. Cole no SQL Editor
3. Clique em "Run" para executar

## Estrutura do Banco de Dados

### Tabelas Principais

#### `users`
- Usuários do sistema (funcionários)
- Campos: id, email, password, name, role, position_id, department_id

#### `departments`
- Departamentos da empresa
- Campos: id, name, description, manager_id

#### `positions`
- Cargos/posições disponíveis
- Campos: id, name, description, salary

#### `user_profiles`
- Perfis detalhados dos usuários
- Campos: phone, address, birth_date, hire_date, emergency_contact

#### `performance_evaluations`
- Avaliações de desempenho
- Campos: user_id, evaluator_id, scores, comments, status

#### `vacations`
- Solicitações de férias
- Campos: user_id, start_date, end_date, status, approved_by

#### `trainings` e `training_participations`
- Treinamentos e participações
- Controle de inscrições e conclusões

#### `benefits` e `user_benefits`
- Benefícios oferecidos e atribuições
- Planos de saúde, vale refeição, etc.

#### `chat_messages`
- Sistema de mensagens/chat
- Suporte a bot e mensagens entre usuários

### Recursos Implementados

#### Segurança
- Senhas criptografadas com bcrypt
- UUIDs para todas as chaves primárias
- Constraints de integridade referencial

#### Performance
- Índices otimizados para consultas frequentes
- Views pré-calculadas para dashboard
- Triggers para atualização automática de timestamps

#### Funcionalidades Avançadas
- Função para cálculo de dias de férias disponíveis
- Sistema de roles (admin, manager, employee)
- Controle de status para workflows
- Histórico completo de alterações

## Configuração no Backend

Após executar os scripts, configure a string de conexão no backend:

```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"
```

## Usuários Padrão

Após executar os scripts, os seguintes usuários estarão disponíveis:

### Administrador
- **Email**: admin@hrmanagement.com
- **Senha**: admin123
- **Role**: admin

### Usuários de Exemplo
- **João Silva**: joao.silva@empresa.com (senha: senha123)
- **Maria Santos**: maria.santos@empresa.com (senha: senha123)
- **Pedro Costa**: pedro.costa@empresa.com (senha: senha123)
- **Ana Oliveira**: ana.oliveira@empresa.com (senha: senha123)

## Manutenção

### Backup
Recomenda-se fazer backup regular do banco de dados através do Supabase Dashboard.

### Monitoramento
Use as views criadas (`dashboard_stats`, `users_complete`) para monitorar o sistema.

### Limpeza
O sistema inclui configurações para limpeza automática de dados antigos (ex: mensagens de chat).

## Troubleshooting

### Erro de Permissões
Se houver erros de permissão, verifique se o usuário tem privilégios para:
- Criar tabelas e índices
- Criar funções e triggers
- Inserir dados

### Erro de Extensões
Se as extensões não estiverem disponíveis:
```sql
-- Execute como superuser se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Performance
Se houver problemas de performance:
1. Verifique se todos os índices foram criados
2. Analise as consultas com EXPLAIN
3. Considere adicionar índices específicos para suas consultas

## Próximos Passos

1. Execute os scripts no Supabase
2. Configure a string de conexão no backend
3. Teste a conectividade
4. Execute os testes de integração
5. Configure o ambiente de produção

