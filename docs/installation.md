# Guia de Instalação - Sistema de Gestão de Pessoas

## Introdução

Este guia fornece instruções detalhadas para instalação e configuração do Sistema de Gestão de Pessoas em diferentes ambientes. O sistema é composto por um backend em NestJS, frontend em React e banco de dados PostgreSQL.

## Requisitos do Sistema

### Requisitos Mínimos

#### Hardware
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Armazenamento**: 10 GB de espaço livre
- **Rede**: Conexão com internet para dependências

#### Software
- **Sistema Operacional**: 
  - Linux (Ubuntu 20.04+, CentOS 8+)
  - macOS 10.15+
  - Windows 10+
- **Node.js**: 18.0.0 ou superior
- **npm**: 8.0.0 ou superior (ou yarn 1.22.0+)
- **Git**: 2.25.0 ou superior

### Requisitos Recomendados

#### Hardware
- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8 GB
- **Armazenamento**: 50 GB SSD
- **Rede**: Banda larga estável

#### Software
- **Node.js**: 20.0.0 LTS
- **npm**: 10.0.0 ou superior
- **Docker**: 24.0.0+ (para containerização)
- **PostgreSQL**: 14.0+ (se não usar Supabase)

## Preparação do Ambiente

### Instalação do Node.js

#### Linux (Ubuntu/Debian)
```bash
# Atualizar repositórios
sudo apt update

# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

#### macOS
```bash
# Usando Homebrew
brew install node@20

# Ou baixar do site oficial
# https://nodejs.org/en/download/
```

#### Windows
```powershell
# Usando Chocolatey
choco install nodejs

# Ou baixar do site oficial
# https://nodejs.org/en/download/
```

### Instalação do Git

#### Linux
```bash
sudo apt install git
```

#### macOS
```bash
brew install git
```

#### Windows
```powershell
choco install git
```

### Configuração do Git (Opcional)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@empresa.com"
```

## Clonagem do Repositório

### Opção 1: Clone via HTTPS
```bash
git clone https://github.com/seu-usuario/hr-management-system.git
cd hr-management-system
```

### Opção 2: Clone via SSH (Recomendado)
```bash
git clone git@github.com:seu-usuario/hr-management-system.git
cd hr-management-system
```

### Verificação da Estrutura
```bash
ls -la
# Deve mostrar:
# backend/
# hr-management-frontend/
# database/
# docs/
# README.md
```

## Configuração do Banco de Dados

### Opção 1: Supabase (Recomendado)

#### Criação do Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados:
   - **Name**: HR Management System
   - **Database Password**: Senha segura
   - **Region**: Escolha a região mais próxima
5. Aguarde a criação do projeto (2-3 minutos)

#### Configuração do Schema
1. No dashboard do Supabase, vá para "SQL Editor"
2. Copie o conteúdo do arquivo `database/supabase_schema.sql`
3. Cole no editor e clique em "Run"
4. Aguarde a execução (pode levar alguns minutos)
5. Copie o conteúdo do arquivo `database/sample_data.sql`
6. Cole no editor e clique em "Run" para dados de exemplo

#### Obtenção da String de Conexão
1. Vá para "Settings" → "Database"
2. Copie a "Connection string" na seção "Connection parameters"
3. Substitua `[YOUR-PASSWORD]` pela senha definida

### Opção 2: PostgreSQL Local

#### Instalação do PostgreSQL

##### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

##### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

##### Windows
```powershell
choco install postgresql
```

#### Configuração do Banco
```bash
# Conectar como usuário postgres
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE hr_management;

# Criar usuário
CREATE USER hr_user WITH PASSWORD 'senha_segura';

# Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE hr_management TO hr_user;

# Sair do psql
\q
```

#### Execução dos Scripts
```bash
# Navegar para o diretório do banco
cd database

# Executar schema
psql -h localhost -U hr_user -d hr_management -f supabase_schema.sql

# Executar dados de exemplo (opcional)
psql -h localhost -U hr_user -d hr_management -f sample_data.sql
```

## Configuração do Backend

### Navegação para o Diretório
```bash
cd backend
```

### Instalação das Dependências
```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

### Configuração das Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

#### Configuração do .env
```env
# Database
DATABASE_URL="postgresql://hr_user:senha_segura@localhost:5432/hr_management"
# Para Supabase, use a connection string obtida anteriormente

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-com-pelo-menos-32-caracteres"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Chat
CHAT_BOT_ENABLED=true

# Logs
LOG_LEVEL="debug"
```

### Geração do Cliente Prisma
```bash
npx prisma generate
```

### Execução das Migrações (se usando PostgreSQL local)
```bash
npx prisma migrate dev --name init
```

### Seed do Banco (Opcional)
```bash
npx prisma db seed
```

### Teste da Instalação
```bash
# Iniciar em modo desenvolvimento
npm run dev

# Verificar se está rodando
curl http://localhost:3000/health
```

## Configuração do Frontend

### Navegação para o Diretório
```bash
cd ../hr-management-frontend
```

### Instalação das Dependências
```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

### Configuração das Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

#### Configuração do .env
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME="Sistema de Gestão de Pessoas"
VITE_APP_VERSION="1.0.0"

# Features
VITE_CHAT_ENABLED=true
VITE_ANALYTICS_ENABLED=false
```

### Teste da Instalação
```bash
# Iniciar em modo desenvolvimento
npm run dev

# O frontend estará disponível em http://localhost:5173
```

## Verificação da Instalação

### Teste do Backend
```bash
# Verificar health check
curl http://localhost:3000/health

# Verificar documentação da API
curl http://localhost:3000/api
```

### Teste do Frontend
1. Abra o navegador em `http://localhost:5173`
2. Você deve ver a tela de login
3. Use as credenciais padrão:
   - **Email**: admin@hrmanagement.com
   - **Senha**: admin123

### Teste de Integração
1. Faça login no frontend
2. Navegue pelo dashboard
3. Teste o chat clicando no ícone de mensagem
4. Verifique se as páginas carregam corretamente

## Configuração para Produção

### Variáveis de Ambiente de Produção

#### Backend (.env.production)
```env
DATABASE_URL="sua-string-de-conexao-producao"
JWT_SECRET="jwt-secret-super-seguro-producao"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="production"
CORS_ORIGIN="https://seu-dominio.com"
LOG_LEVEL="info"
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.seu-dominio.com/v1
VITE_WS_URL=https://api.seu-dominio.com
VITE_APP_NAME="Sistema de Gestão de Pessoas"
VITE_ANALYTICS_ENABLED=true
```

### Build para Produção

#### Backend
```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend
```bash
cd hr-management-frontend
npm run build

# Os arquivos de produção estarão em dist/
```

## Configuração com Docker

### Dockerfile do Backend
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Dockerfile do Frontend
```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://hr_user:password@db:5432/hr_management
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db

  frontend:
    build: ./hr-management-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=hr_management
      - POSTGRES_USER=hr_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/supabase_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/sample_data.sql:/docker-entrypoint-initdb.d/02-data.sql

volumes:
  postgres_data:
```

### Execução com Docker
```bash
# Build e start
docker-compose up --build

# Em background
docker-compose up -d

# Parar
docker-compose down
```

## Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco
```bash
# Verificar se o PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conectividade
psql -h localhost -U hr_user -d hr_management -c "SELECT 1;"
```

#### Erro de Porta em Uso
```bash
# Verificar qual processo está usando a porta
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

#### Erro de Permissões
```bash
# Corrigir permissões do npm
sudo chown -R $(whoami) ~/.npm

# Limpar cache do npm
npm cache clean --force
```

#### Erro de Dependências
```bash
# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Logs e Debugging

#### Logs do Backend
```bash
# Logs em tempo real
npm run dev

# Logs de produção
pm2 logs hr-backend
```

#### Logs do Frontend
```bash
# Console do navegador (F12)
# Verificar erros de rede e JavaScript
```

#### Logs do Banco
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Supabase logs
# Disponíveis no dashboard do Supabase
```

### Performance

#### Otimização do Backend
```bash
# Usar PM2 para produção
npm install -g pm2
pm2 start npm --name "hr-backend" -- run start:prod
pm2 startup
pm2 save
```

#### Otimização do Frontend
```bash
# Análise do bundle
npm run build -- --analyze

# Otimização de imagens
npm install -g imagemin-cli
imagemin src/assets/images/* --out-dir=dist/assets/images
```

## Configuração de SSL/HTTPS

### Certificado Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuração do Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/hr-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Backup e Recuperação

### Backup do Banco de Dados
```bash
# Backup completo
pg_dump -h localhost -U hr_user hr_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
pg_dump -h localhost -U hr_user hr_management | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Script de backup automático
#!/bin/bash
BACKUP_DIR="/var/backups/hr-system"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U hr_user hr_management | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Restauração do Banco
```bash
# Restaurar backup
gunzip -c backup_20240101_120000.sql.gz | psql -h localhost -U hr_user hr_management

# Ou sem compressão
psql -h localhost -U hr_user hr_management < backup_20240101_120000.sql
```

### Backup de Arquivos
```bash
# Backup do código
tar -czf hr-system-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  /path/to/hr-management-system/

# Backup de uploads (se houver)
rsync -av /var/uploads/ /backup/uploads/
```

## Monitoramento

### Configuração do PM2
```bash
# Instalar PM2
npm install -g pm2

# Arquivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hr-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Monitoramento de Sistema
```bash
# Instalar htop
sudo apt install htop

# Monitorar recursos
htop

# Monitorar logs
tail -f /var/log/nginx/access.log
tail -f ~/.pm2/logs/hr-backend-out.log
```

## Atualizações

### Atualização do Sistema
```bash
# Fazer backup antes da atualização
./scripts/backup.sh

# Atualizar código
git pull origin main

# Atualizar dependências do backend
cd backend
npm install
npm run build

# Atualizar dependências do frontend
cd ../hr-management-frontend
npm install
npm run build

# Reiniciar serviços
pm2 restart hr-backend
sudo systemctl reload nginx
```

### Migrações de Banco
```bash
# Executar migrações
cd backend
npx prisma migrate deploy

# Verificar status
npx prisma migrate status
```

## Conclusão

Após seguir este guia, você deve ter o Sistema de Gestão de Pessoas funcionando corretamente em seu ambiente. Para suporte adicional, consulte a documentação da API e arquitetura, ou entre em contato com a equipe de desenvolvimento.

### Próximos Passos
1. Configurar usuários e permissões
2. Personalizar configurações da empresa
3. Importar dados existentes (se houver)
4. Configurar integrações externas
5. Treinar usuários finais

### Recursos Adicionais
- [Documentação da API](api.md)
- [Arquitetura do Sistema](architecture.md)
- [Guia de Deploy](deployment.md)
- [FAQ e Troubleshooting](faq.md)

---

*Guia de Instalação - Sistema de Gestão de Pessoas*  
*Versão 1.0 - Desenvolvido por Manus AI*

