# Versionamento e Integrações - Sistema de Gestão de Pessoas

## Estratégia de Versionamento

### Semantic Versioning (SemVer)

O Sistema de Gestão de Pessoas segue o padrão Semantic Versioning (SemVer) para controle de versões. O formato é `MAJOR.MINOR.PATCH`:

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis com versões anteriores
- **PATCH**: Correções de bugs compatíveis

#### Exemplos
- `1.0.0` - Primeira versão estável
- `1.1.0` - Nova funcionalidade (ex: módulo de treinamentos)
- `1.1.1` - Correção de bug
- `2.0.0` - Mudança incompatível (ex: reestruturação da API)

### Versionamento da API

#### URL Versioning
```
/api/v1/users
/api/v2/users
```

#### Header Versioning (Alternativo)
```http
Accept: application/vnd.hrmanagement.v1+json
```

### Política de Suporte

#### Versões Suportadas
- **Versão Atual**: Suporte completo e atualizações
- **Versão Anterior**: Suporte para correções críticas (6 meses)
- **Versões Antigas**: Sem suporte ativo

#### Ciclo de Vida
1. **Alpha**: Desenvolvimento interno
2. **Beta**: Testes com usuários selecionados
3. **Release Candidate**: Versão candidata a produção
4. **Stable**: Versão estável para produção
5. **Deprecated**: Versão descontinuada
6. **End of Life**: Sem suporte

### Git Flow

#### Branches Principais
- **main**: Código de produção
- **develop**: Desenvolvimento ativo
- **release/x.x.x**: Preparação de releases
- **hotfix/x.x.x**: Correções urgentes

#### Workflow
```bash
# Feature development
git checkout develop
git checkout -b feature/nova-funcionalidade
# ... desenvolvimento ...
git checkout develop
git merge feature/nova-funcionalidade

# Release preparation
git checkout -b release/1.2.0
# ... testes e ajustes ...
git checkout main
git merge release/1.2.0
git tag v1.2.0

# Hotfix
git checkout main
git checkout -b hotfix/1.2.1
# ... correção ...
git checkout main
git merge hotfix/1.2.1
git tag v1.2.1
```

### Changelog

#### Formato
```markdown
# Changelog

## [1.2.0] - 2024-02-01

### Added
- Nova funcionalidade de treinamentos
- Dashboard de analytics
- Exportação de relatórios em PDF

### Changed
- Melhorias na interface do chat
- Otimização de performance nas consultas

### Fixed
- Correção no cálculo de férias
- Bug na validação de emails

### Deprecated
- Endpoint `/api/v1/old-users` será removido em v2.0.0

### Removed
- Funcionalidade de notificações por SMS

### Security
- Atualização de dependências com vulnerabilidades
```

## Configuração do n8n (Workflow Automation)

### Visão Geral

O n8n é uma ferramenta de automação de workflows que pode ser integrada ao Sistema de Gestão de Pessoas para automatizar processos de RH.

### Instalação do n8n

#### Docker (Recomendado)
```bash
# Criar diretório para dados
mkdir ~/.n8n

# Executar n8n
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### npm
```bash
npm install n8n -g
n8n start
```

### Configuração Inicial

#### Acesso
1. Abra http://localhost:5678
2. Crie uma conta de administrador
3. Configure as credenciais básicas

#### Configuração de Webhook
```javascript
// URL do webhook para receber eventos do sistema HR
const webhookUrl = 'http://localhost:5678/webhook/hr-events';

// Configurar no backend do sistema HR
app.post('/api/v1/webhooks/n8n', (req, res) => {
  // Enviar eventos para n8n
  axios.post(webhookUrl, req.body);
  res.status(200).send('OK');
});
```

### Workflows Recomendados

#### 1. Onboarding de Funcionários
```json
{
  "name": "Employee Onboarding",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "employee-created"
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "={{$node['Webhook'].json['email']}}",
        "subject": "Bem-vindo à empresa!",
        "text": "Olá {{$node['Webhook'].json['name']}}, seja bem-vindo!"
      }
    },
    {
      "name": "Create Slack Channel",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "operation": "create",
        "channel": "onboarding-{{$node['Webhook'].json['id']}}"
      }
    },
    {
      "name": "Add to HR System",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3000/api/v1/admissions",
        "method": "POST",
        "body": {
          "userId": "={{$node['Webhook'].json['id']}}",
          "status": "in_progress"
        }
      }
    }
  ]
}
```

#### 2. Aprovação de Férias
```json
{
  "name": "Vacation Approval",
  "nodes": [
    {
      "name": "Vacation Request",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "vacation-requested"
      }
    },
    {
      "name": "Get Manager",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3000/api/v1/users/{{$node['Vacation Request'].json['userId']}}/manager"
      }
    },
    {
      "name": "Send Approval Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "={{$node['Get Manager'].json['email']}}",
        "subject": "Solicitação de Férias - {{$node['Vacation Request'].json['employeeName']}}",
        "text": "Nova solicitação de férias para aprovação."
      }
    },
    {
      "name": "Create Calendar Event",
      "type": "n8n-nodes-base.googleCalendar",
      "parameters": {
        "operation": "create",
        "start": "={{$node['Vacation Request'].json['startDate']}}",
        "end": "={{$node['Vacation Request'].json['endDate']}}",
        "summary": "Férias - {{$node['Vacation Request'].json['employeeName']}}"
      }
    }
  ]
}
```

#### 3. Avaliação de Desempenho
```json
{
  "name": "Performance Review Reminder",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyMonth",
              "dayOfMonth": 1,
              "hour": 9,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Get Pending Reviews",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3000/api/v1/performance-evaluations?status=pending"
      }
    },
    {
      "name": "Send Reminder",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "={{$item.evaluator.email}}",
        "subject": "Lembrete: Avaliação de Desempenho Pendente",
        "text": "Você tem uma avaliação pendente para {{$item.employee.name}}"
      }
    }
  ]
}
```

### Configuração de Credenciais

#### Email (SMTP)
```javascript
{
  "name": "SMTP",
  "type": "smtp",
  "data": {
    "user": "noreply@empresa.com",
    "password": "senha-do-email",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false
  }
}
```

#### Slack
```javascript
{
  "name": "Slack",
  "type": "slackApi",
  "data": {
    "accessToken": "xoxb-seu-token-slack"
  }
}
```

#### Google Calendar
```javascript
{
  "name": "Google Calendar",
  "type": "googleCalendarOAuth2",
  "data": {
    "clientId": "seu-client-id",
    "clientSecret": "seu-client-secret"
  }
}
```

### Webhooks do Sistema HR

#### Configuração no Backend
```typescript
// webhook.service.ts
@Injectable()
export class WebhookService {
  private n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  async sendEvent(event: string, data: any) {
    if (!this.n8nWebhookUrl) return;

    try {
      await axios.post(`${this.n8nWebhookUrl}/${event}`, {
        event,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
    }
  }
}

// users.service.ts
async createUser(userData: CreateUserDto) {
  const user = await this.prisma.user.create({ data: userData });
  
  // Enviar evento para n8n
  await this.webhookService.sendEvent('employee-created', user);
  
  return user;
}
```

#### Eventos Disponíveis
- `employee-created`: Novo funcionário criado
- `employee-updated`: Funcionário atualizado
- `vacation-requested`: Solicitação de férias
- `vacation-approved`: Férias aprovadas
- `vacation-rejected`: Férias rejeitadas
- `evaluation-created`: Nova avaliação criada
- `evaluation-submitted`: Avaliação submetida
- `training-enrolled`: Inscrição em treinamento
- `training-completed`: Treinamento concluído

## Configuração do Sentry (Error Monitoring)

### Visão Geral

O Sentry é uma plataforma de monitoramento de erros que ajuda a identificar e corrigir problemas em tempo real.

### Configuração Inicial

#### Criação do Projeto
1. Acesse [sentry.io](https://sentry.io)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Selecione "Node.js" para backend e "React" para frontend
5. Copie o DSN fornecido

### Configuração no Backend

#### Instalação
```bash
npm install @sentry/node @sentry/tracing
```

#### Configuração
```typescript
// main.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Sentry error handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());
  
  await app.listen(3000);
}
```

#### Exception Filter
```typescript
// sentry.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    Sentry.captureException(exception);
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus?.() || 500;
    
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// app.module.ts
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryFilter,
    },
  ],
})
export class AppModule {}
```

### Configuração no Frontend

#### Instalação
```bash
npm install @sentry/react @sentry/tracing
```

#### Configuração
```typescript
// main.tsx
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

// App.tsx
import { ErrorBoundary } from '@sentry/react';

function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback} showDialog>
      <Router>
        {/* Sua aplicação */}
      </Router>
    </ErrorBoundary>
  );
}

function ErrorFallback({ error, resetError }) {
  return (
    <div className="error-boundary">
      <h2>Algo deu errado!</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Tentar novamente</button>
    </div>
  );
}
```

### Configuração Avançada

#### Performance Monitoring
```typescript
// Performance transaction
const transaction = Sentry.startTransaction({
  op: 'user-operation',
  name: 'Create User',
});

try {
  const user = await this.userService.create(userData);
  transaction.setStatus('ok');
  return user;
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

#### Custom Context
```typescript
// Adicionar contexto personalizado
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

Sentry.setTag('department', user.department);
Sentry.setContext('request', {
  url: req.url,
  method: req.method,
  headers: req.headers,
});
```

#### Breadcrumbs
```typescript
// Adicionar breadcrumbs
Sentry.addBreadcrumb({
  message: 'User login attempt',
  category: 'auth',
  level: 'info',
  data: {
    email: loginDto.email,
  },
});
```

### Alertas e Notificações

#### Configuração de Alertas
1. No dashboard do Sentry, vá para "Alerts"
2. Crie uma nova regra de alerta
3. Configure condições:
   - Número de erros por minuto
   - Taxa de erro
   - Novos tipos de erro
4. Configure notificações:
   - Email
   - Slack
   - PagerDuty

#### Exemplo de Regra
```yaml
name: "High Error Rate"
conditions:
  - "event.count": "> 10"
  - "time_window": "1m"
actions:
  - "email": ["dev-team@empresa.com"]
  - "slack": ["#alerts"]
```

### Releases e Deploy Tracking

#### Configuração de Release
```bash
# Instalar CLI do Sentry
npm install -g @sentry/cli

# Configurar auth token
sentry-cli login

# Criar release
sentry-cli releases new v1.2.0

# Upload source maps (frontend)
sentry-cli releases files v1.2.0 upload-sourcemaps ./dist

# Finalizar release
sentry-cli releases finalize v1.2.0

# Associar deploy
sentry-cli releases deploys v1.2.0 new -e production
```

#### Automação no CI/CD
```yaml
# .github/workflows/deploy.yml
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  with:
    environment: production
    version: ${{ github.sha }}
```

### Variáveis de Ambiente

#### Backend (.env)
```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.2.0
```

#### Frontend (.env)
```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
```

### Monitoramento de Performance

#### Métricas Importantes
- **Response Time**: Tempo de resposta das APIs
- **Throughput**: Requisições por segundo
- **Error Rate**: Taxa de erro
- **Apdex Score**: Satisfação do usuário

#### Dashboard Personalizado
```typescript
// Custom metrics
Sentry.metrics.increment('user.login', 1, {
  tags: { method: 'email' }
});

Sentry.metrics.timing('database.query', queryTime, {
  tags: { table: 'users' }
});

Sentry.metrics.gauge('active.users', activeUserCount);
```

## Integração com Ferramentas de CI/CD

### GitHub Actions

#### Workflow de Deploy
```yaml
name: Deploy HR Management System

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../hr-management-frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../hr-management-frontend && npm test
      
      - name: Build
        run: |
          cd backend && npm run build
          cd ../hr-management-frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deploy commands here
          echo "Deploying to production..."
      
      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
        with:
          environment: production
          version: ${{ github.sha }}
      
      - name: Trigger n8n Webhook
        run: |
          curl -X POST ${{ secrets.N8N_DEPLOY_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{"version": "${{ github.sha }}", "environment": "production"}'
```

### Versionamento Automático

#### Conventional Commits
```bash
# Instalar ferramentas
npm install -g @commitlint/cli @commitlint/config-conventional
npm install -g semantic-release

# Configurar commitlint
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Exemplos de commits
git commit -m "feat: adicionar módulo de treinamentos"
git commit -m "fix: corrigir cálculo de férias"
git commit -m "docs: atualizar documentação da API"
git commit -m "BREAKING CHANGE: reestruturar endpoints de usuários"
```

#### Semantic Release
```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github"
    ]
  }
}
```

## Conclusão

A implementação adequada de versionamento e integrações garante que o Sistema de Gestão de Pessoas seja mantível, monitorável e escalável. As ferramentas apresentadas (n8n, Sentry, CI/CD) trabalham em conjunto para criar um ecossistema robusto de desenvolvimento e operação.

### Benefícios das Integrações

#### n8n
- Automação de processos de RH
- Redução de trabalho manual
- Integração com ferramentas externas
- Workflows personalizáveis

#### Sentry
- Monitoramento proativo de erros
- Performance insights
- Alertas em tempo real
- Debugging facilitado

#### CI/CD
- Deploy automatizado
- Testes contínuos
- Versionamento consistente
- Rollback rápido

### Próximos Passos

1. **Configurar ambiente de staging** para testes
2. **Implementar feature flags** para releases graduais
3. **Configurar monitoring adicional** (APM, logs)
4. **Criar runbooks** para operações
5. **Treinar equipe** nas ferramentas

---

*Versionamento e Integrações - Sistema de Gestão de Pessoas*  
*Versão 1.0 - Desenvolvido por Manus AI*

